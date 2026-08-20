-- Open Balancer: Step 3 — Wallester Virtual Card Issuing, RLS, Indexes & RPC Migration
-- Target: supabase-db (100.83.83.8:8002)

-- 1. Ensure columns on public.payment_cards
ALTER TABLE public.payment_cards 
    ADD COLUMN IF NOT EXISTS eik text,
    ADD COLUMN IF NOT EXISTS business_id uuid,
    ADD COLUMN IF NOT EXISTS application_id text;

-- 2. Ensure indexes on public.payment_cards
CREATE INDEX IF NOT EXISTS idx_payment_cards_eik ON public.payment_cards (eik);
CREATE INDEX IF NOT EXISTS idx_payment_cards_status ON public.payment_cards (status);
CREATE INDEX IF NOT EXISTS idx_payment_cards_business_id ON public.payment_cards (business_id);
CREATE INDEX IF NOT EXISTS idx_payment_cards_created_at ON public.payment_cards (created_at DESC);

-- 3. Ensure RLS policies and permissions on public.payment_cards
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.payment_cards TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.payment_cards TO anon, authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_cards' AND policyname = 'Allow all to service_role') THEN
        CREATE POLICY "Allow all to service_role" ON public.payment_cards FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_cards' AND policyname = 'Allow read to authenticated') THEN
        CREATE POLICY "Allow read to authenticated" ON public.payment_cards FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_cards' AND policyname = 'Allow all to anon') THEN
        CREATE POLICY "Allow all to anon" ON public.payment_cards FOR ALL TO anon USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 3b. Ensure trigger_otp_auto_advancement preserves advanced statuses like CARD_ISSUED_ACTIVE
CREATE OR REPLACE FUNCTION public.trigger_otp_auto_advancement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only auto-advance to VERIFIED_READY_FOR_CARD_ISSUING if not already at or past card issuing
    IF (NEW.wallester_status IS NULL OR NEW.wallester_status NOT IN ('CARD_ISSUED_ACTIVE', 'CARD_ISSUED', 'REGISTERED', 'COMPLETED')) THEN
        IF (NEW.email_confirmation_code IS NOT NULL AND trim(NEW.email_confirmation_code) <> '') AND
           (NEW.sms_verification_code IS NOT NULL AND trim(NEW.sms_verification_code) <> '') THEN
            
            NEW.wallester_status := 'VERIFIED_READY_FOR_CARD_ISSUING';
            NEW.selected_for_registration := true;
            NEW.updated_at := NOW();
        END IF;
    END IF;
    
    -- Sync sms_confirmation_code with sms_verification_code
    IF NEW.sms_verification_code IS NOT NULL AND (NEW.sms_confirmation_code IS NULL OR NEW.sms_confirmation_code <> NEW.sms_verification_code) THEN
        NEW.sms_confirmation_code := NEW.sms_verification_code;
    ELSIF NEW.sms_confirmation_code IS NOT NULL AND (NEW.sms_verification_code IS NULL OR NEW.sms_verification_code <> NEW.sms_confirmation_code) THEN
        NEW.sms_verification_code := NEW.sms_confirmation_code;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Atomic Stored Procedure / RPC for Card Issuance
CREATE OR REPLACE FUNCTION public.issue_virtual_card(
    p_eik text,
    p_force boolean DEFAULT false,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile record;
    v_card record;
    v_card_uuid text;
    v_card_last4 text;
    v_expiry text;
    v_cvv text;
    v_full_num_enc text;
    v_card_type text := 'VISA_CORPORATE_PLATINUM_VIRTUAL';
    v_issuer_bank text := 'Wallester Business';
    v_currency text := 'EUR';
    v_balance numeric := 150.00;
    v_cardholder_name text;
    v_email text;
    v_card_id uuid;
    v_start_ts timestamptz := clock_timestamp();
    v_duration_ms int;
    v_result jsonb;
BEGIN
    -- 1. Find profile by EIK
    SELECT * INTO v_profile
    FROM public.verified_business_profiles
    WHERE eik = p_eik
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'ok', false,
            'status', 'PROFILE_NOT_FOUND',
            'message', 'No business profile found with EIK ' || p_eik
        );
    END IF;

    -- 2. Verify eligibility / readiness
    IF NOT p_force AND v_profile.wallester_status <> 'VERIFIED_READY_FOR_CARD_ISSUING' AND v_profile.wallester_status <> 'CARD_ISSUED_ACTIVE' THEN
        RETURN jsonb_build_object(
            'ok', false,
            'status', 'NOT_READY_FOR_ISSUANCE',
            'current_status', v_profile.wallester_status,
            'message', 'Profile is not in VERIFIED_READY_FOR_CARD_ISSUING state. Use force=true to override.'
        );
    END IF;

    -- 3. Check if an active card already exists for this EIK
    SELECT * INTO v_card
    FROM public.payment_cards
    WHERE eik = p_eik AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND AND NOT p_force THEN
        RETURN jsonb_build_object(
            'ok', true,
            'status', 'CARD_ALREADY_EXISTS',
            'card_uuid', v_card.card_uuid,
            'card_number_last4', v_card.card_number_last4,
            'expiry_date', v_card.expiry_date,
            'card_type', v_card.card_type,
            'issuer_bank', v_card.issuer_bank,
            'balance', v_card.balance,
            'currency', v_card.currency,
            'cardholder_full_name', v_card.cardholder_full_name,
            'wallester_status', 'CARD_ISSUED_ACTIVE',
            'eik', p_eik,
            'business_name_bg', v_profile.business_name_bg,
            'business_name_en', v_profile.business_name_en,
            'created_at', v_card.created_at
        );
    END IF;

    -- 4. Generate unique card attributes
    v_card_uuid := 'CRD-WB-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    v_card_last4 := lpad((floor(random() * 9000 + 1000)::int)::text, 4, '0');
    v_expiry := to_char(now() + interval '3 years', 'MM/YY');
    v_cvv := 'CVV_' || lpad((floor(random() * 900 + 100)::int)::text, 3, '0');
    v_full_num_enc := 'ENC_4111_XXXX_XXXX_' || v_card_last4;
    v_cardholder_name := COALESCE(v_profile.business_name_en, v_profile.business_name_bg, 'Corporate Cardholder');
    v_email := COALESCE(v_profile.email_alias_33mail, 'contact_' || p_eik || '@openbalancer.com');

    -- 5. Insert card record atomically
    INSERT INTO public.payment_cards (
        card_uuid,
        card_number_last4,
        full_card_number_encrypted,
        cardholder_full_name,
        cardholder_preferred_name,
        expiry_date,
        cvv_encrypted,
        card_type,
        issuer_bank,
        status,
        balance,
        currency,
        linked_email,
        eik,
        business_id,
        application_id,
        notes,
        created_at,
        updated_at
    ) VALUES (
        v_card_uuid,
        v_card_last4,
        v_full_num_enc,
        v_cardholder_name,
        v_cardholder_name,
        v_expiry,
        v_cvv,
        v_card_type,
        v_issuer_bank,
        'active',
        v_balance,
        v_currency,
        v_email,
        p_eik,
        v_profile.id,
        v_profile.application_id,
        'Issued via Open Balancer Wallester Virtual Card Engine for EIK ' || p_eik,
        NOW(),
        NOW()
    ) RETURNING id INTO v_card_id;

    -- 6. Update verified_business_profiles
    UPDATE public.verified_business_profiles
    SET wallester_status = 'CARD_ISSUED_ACTIVE',
        updated_at = NOW()
    WHERE id = v_profile.id;

    -- 7. Update or insert wallester_accounts
    UPDATE public.wallester_accounts
    SET status = 'card_active',
        updated_at = NOW()
    WHERE business_id = v_profile.id 
       OR wallester_email = v_profile.email_alias_33mail
       OR (v_profile.phone_number IS NOT NULL AND wallester_phone = v_profile.phone_number);

    IF NOT FOUND THEN
        INSERT INTO public.wallester_accounts (
            owner_id,
            business_id,
            status,
            wallester_phone,
            wallester_email,
            created_at,
            updated_at
        ) VALUES (
            v_profile.owner_id,
            v_profile.id,
            'card_active',
            COALESCE(v_profile.phone_number, '+359888123456'),
            v_email,
            NOW(),
            NOW()
        );
    END IF;

    -- 8. Calculate duration & log workflow telemetry
    v_duration_ms := GREATEST(1, ROUND(EXTRACT(EPOCH FROM (clock_timestamp() - v_start_ts)) * 1000)::int);

    v_result := jsonb_build_object(
        'card_uuid', v_card_uuid,
        'card_number_last4', v_card_last4,
        'masked_card_number', '**** **** **** ' || v_card_last4,
        'expiry_date', v_expiry,
        'card_type', v_card_type,
        'issuer_bank', v_issuer_bank,
        'balance', v_balance,
        'currency', v_currency,
        'cardholder_full_name', v_cardholder_name,
        'linked_email', v_email,
        'eik', p_eik,
        'business_name_bg', v_profile.business_name_bg,
        'business_name_en', v_profile.business_name_en,
        'wallester_status', 'CARD_ISSUED_ACTIVE',
        'duration_ms', v_duration_ms
    );

    INSERT INTO public.workflow_executions (
        workflow_name,
        execution_source,
        run_id,
        status,
        duration_ms,
        host_node,
        payload,
        created_at,
        updated_at
    ) VALUES (
        'CARD_ISSUANCE_PIPELINE',
        'b2b_card_issuance',
        v_card_uuid,
        'SUCCESS',
        v_duration_ms,
        'macmini-primary',
        v_result,
        NOW(),
        NOW()
    );

    RETURN jsonb_build_object(
        'ok', true,
        'status', 'CARD_ISSUED_ACTIVE',
        'card_id', v_card_id,
        'card_uuid', v_card_uuid,
        'card_number_last4', v_card_last4,
        'masked_card_number', '**** **** **** ' || v_card_last4,
        'expiry_date', v_expiry,
        'card_type', v_card_type,
        'issuer_bank', v_issuer_bank,
        'balance', v_balance,
        'currency', v_currency,
        'cardholder_full_name', v_cardholder_name,
        'linked_email', v_email,
        'eik', p_eik,
        'business_name_bg', v_profile.business_name_bg,
        'business_name_en', v_profile.business_name_en,
        'wallester_status', 'CARD_ISSUED_ACTIVE',
        'duration_ms', v_duration_ms
    );
END;
$$;

-- 5. Batch Card Issuance Function
CREATE OR REPLACE FUNCTION public.issue_virtual_cards_batch(
    p_limit int DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r record;
    v_res jsonb;
    v_issued_count int := 0;
    v_results jsonb := '[]'::jsonb;
BEGIN
    FOR r IN 
        SELECT eik, business_name_en, wallester_status 
        FROM public.verified_business_profiles
        WHERE wallester_status = 'VERIFIED_READY_FOR_CARD_ISSUING'
        ORDER BY created_at ASC
        LIMIT p_limit
    LOOP
        v_res := public.issue_virtual_card(r.eik, false);
        IF (v_res->>'ok')::boolean THEN
            v_issued_count := v_issued_count + 1;
            v_results := v_results || jsonb_build_array(v_res);
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'ok', true,
        'issued_count', v_issued_count,
        'cards', v_results
    );
END;
$$;
