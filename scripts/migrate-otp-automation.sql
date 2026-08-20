-- Open Balancer: OTP Stream, Parser, Indexes & Auto-Advancement Migration (V2)
-- Target: supabase-db (100.83.83.8:8002)

-- 1. Ensure columns exist on verified_business_profiles
ALTER TABLE public.verified_business_profiles 
    ADD COLUMN IF NOT EXISTS sms_confirmation_code text,
    ADD COLUMN IF NOT EXISTS email_confirmation_received_at timestamptz,
    ADD COLUMN IF NOT EXISTS sms_verification_received_at timestamptz;

-- 2. Ensure indexes on target tables
CREATE INDEX IF NOT EXISTS idx_email_messages_to_address ON public.email_messages (to_address);
CREATE INDEX IF NOT EXISTS idx_email_messages_extracted_code ON public.email_messages (extracted_code);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages (status);

CREATE INDEX IF NOT EXISTS idx_sms_messages_to_number ON public.sms_messages (to_number);
CREATE INDEX IF NOT EXISTS idx_sms_messages_sms_code ON public.sms_messages (sms_code);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON public.sms_messages (status);

CREATE INDEX IF NOT EXISTS idx_vbp_email_code ON public.verified_business_profiles (email_confirmation_code) WHERE email_confirmation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vbp_sms_code ON public.verified_business_profiles (sms_verification_code) WHERE sms_verification_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vbp_ready_for_card ON public.verified_business_profiles (wallester_status) WHERE wallester_status = 'VERIFIED_READY_FOR_CARD_ISSUING';
CREATE INDEX IF NOT EXISTS idx_vbp_email_alias_33mail ON public.verified_business_profiles (email_alias_33mail);
CREATE INDEX IF NOT EXISTS idx_vbp_phone_number ON public.verified_business_profiles (phone_number);

-- 3. Ensure RLS policies are permissive for service_role, authenticated and anon
DO $$
BEGIN
    -- email_messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_messages' AND policyname = 'Allow all to service_role') THEN
        CREATE POLICY "Allow all to service_role" ON public.email_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_messages' AND policyname = 'Allow anon select and insert') THEN
        CREATE POLICY "Allow anon select and insert" ON public.email_messages FOR ALL TO anon USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_messages' AND policyname = 'Allow authenticated all') THEN
        CREATE POLICY "Allow authenticated all" ON public.email_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- sms_messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_messages' AND policyname = 'Allow all to service_role') THEN
        CREATE POLICY "Allow all to service_role" ON public.sms_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_messages' AND policyname = 'Allow anon select and insert') THEN
        CREATE POLICY "Allow anon select and insert" ON public.sms_messages FOR ALL TO anon USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_messages' AND policyname = 'Allow authenticated all') THEN
        CREATE POLICY "Allow authenticated all" ON public.sms_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- verified_business_profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verified_business_profiles' AND policyname = 'Allow all to anon') THEN
        CREATE POLICY "Allow all to anon" ON public.verified_business_profiles FOR ALL TO anon USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. Auto-Advancement Trigger Function (BEFORE INSERT OR UPDATE)
CREATE OR REPLACE FUNCTION public.trigger_otp_auto_advancement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If both email and sms codes are non-empty
    IF (NEW.email_confirmation_code IS NOT NULL AND trim(NEW.email_confirmation_code) <> '') AND
       (NEW.sms_verification_code IS NOT NULL AND trim(NEW.sms_verification_code) <> '') THEN
        
        NEW.wallester_status := 'VERIFIED_READY_FOR_CARD_ISSUING';
        NEW.selected_for_registration := true;
        NEW.updated_at := NOW();
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

DROP TRIGGER IF EXISTS trigger_otp_auto_advancement ON public.verified_business_profiles;
CREATE TRIGGER trigger_otp_auto_advancement
    BEFORE INSERT OR UPDATE ON public.verified_business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_otp_auto_advancement();

-- 5. Atomic Email OTP Ingestion & Parser Function (RPC)
CREATE OR REPLACE FUNCTION public.process_email_otp(
    p_to_address text,
    p_from_address text DEFAULT NULL,
    p_subject text DEFAULT NULL,
    p_body text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_email text;
    v_extracted_eik text;
    v_code text;
    v_profile_id uuid;
    v_eik text;
    v_business_name_bg text;
    v_business_name_en text;
    v_phone_number text;
    v_sms_code text;
    v_wallester_status text;
    v_auto_advanced boolean := false;
    v_msg_id uuid;
    v_full_text text;
    v_payload jsonb;
BEGIN
    -- Normalize email
    v_clean_email := lower(trim(COALESCE(p_to_address, '')));
    v_full_text := COALESCE(p_body, '') || ' ' || COALESCE(p_subject, '');
    
    -- Extract 6-digit OTP code using regex from body or subject
    -- Look for explicit contextual pattern first
    v_code := (regexp_match(v_full_text, '(?:code|код|otp|pin|is|e|е|:|\s|^)(\d{6})(?:\.|\s|$|,|!)', 'i'))[1];
    
    IF v_code IS NULL THEN
        -- Fallback: any standalone 6-digit number
        v_code := (regexp_match(v_full_text, '\b\d{6}\b'))[1];
    END IF;

    -- Extract candidate 9-digit or 13-digit EIK from to_address if present
    v_extracted_eik := (regexp_match(v_clean_email, '(\d{9}|\d{13})'))[1];

    -- Look up profile:
    -- 1. Exact match on email_alias_33mail or email_alias_hostinger
    -- 2. Prefix match on email alias before '@'
    -- 3. Match by extracted EIK if alias matches nothing else
    SELECT id, eik, business_name_bg, business_name_en, phone_number, sms_verification_code, wallester_status
    INTO v_profile_id, v_eik, v_business_name_bg, v_business_name_en, v_phone_number, v_sms_code, v_wallester_status
    FROM public.verified_business_profiles
    WHERE (lower(COALESCE(email_alias_33mail, '')) = v_clean_email AND v_clean_email <> '')
       OR (lower(COALESCE(email_alias_hostinger, '')) = v_clean_email AND v_clean_email <> '')
       OR (v_clean_email LIKE '%@%' AND lower(COALESCE(email_alias_33mail, '')) = split_part(v_clean_email, '@', 1))
       OR (v_extracted_eik IS NOT NULL AND eik = v_extracted_eik)
    ORDER BY updated_at DESC
    LIMIT 1;

    -- If profile found and code extracted, perform atomic update
    IF v_profile_id IS NOT NULL AND v_code IS NOT NULL THEN
        -- If profile didn't have email_alias_33mail, update it
        UPDATE public.verified_business_profiles
        SET email_confirmation_code = v_code,
            email_confirmation_received_at = NOW(),
            email_alias_33mail = COALESCE(email_alias_33mail, p_to_address),
            updated_at = NOW()
        WHERE id = v_profile_id;
        
        -- Check auto advancement
        IF v_sms_code IS NOT NULL AND trim(v_sms_code) <> '' THEN
            UPDATE public.verified_business_profiles
            SET wallester_status = 'VERIFIED_READY_FOR_CARD_ISSUING',
                selected_for_registration = true,
                updated_at = NOW()
            WHERE id = v_profile_id;
            
            v_auto_advanced := true;
            v_wallester_status := 'VERIFIED_READY_FOR_CARD_ISSUING';
            
            -- Record workflow execution for auto advancement
            INSERT INTO public.workflow_executions (
                id, workflow_name, execution_source, run_id, status, duration_ms, host_node, payload, is_manual_review, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                'otp_ingestion_and_verification_stream',
                'OTP_AUTO_ADVANCEMENT',
                'OTP-ADV-' || to_char(NOW(), 'YYYYMMDD-HH24MISS') || '-' || substring(COALESCE(v_eik, '000000') from 1 for 6),
                'SUCCESS',
                25,
                'macmini-primary',
                jsonb_build_object(
                    'eik', v_eik,
                    'business_name_bg', v_business_name_bg,
                    'business_name_en', v_business_name_en,
                    'email_code', v_code,
                    'sms_code', v_sms_code,
                    'phone_number', v_phone_number,
                    'email_alias_33mail', p_to_address,
                    'trigger_event', 'EMAIL_OTP_INGEST',
                    'wallester_status', 'VERIFIED_READY_FOR_CARD_ISSUING',
                    'selected_for_registration', true,
                    'auto_advanced_at', NOW()
                ),
                false,
                NOW(),
                NOW()
            );
        END IF;
    END IF;

    -- Archive email message
    INSERT INTO public.email_messages (
        id, direction, from_address, to_address, subject, body_preview, body_full,
        classification, extracted_code, status, processed_at, metadata, created_at
    ) VALUES (
        gen_random_uuid(),
        'inbound',
        p_from_address,
        p_to_address,
        p_subject,
        substring(COALESCE(p_body, '') from 1 for 255),
        p_body,
        'OTP',
        v_code,
        CASE WHEN v_code IS NOT NULL THEN 'processed' ELSE 'unmatched_code' END,
        NOW(),
        jsonb_build_object(
            'matched_profile_id', v_profile_id,
            'matched_eik', v_eik,
            'auto_advanced', v_auto_advanced,
            'extra', p_metadata
        ),
        NOW()
    ) RETURNING id INTO v_msg_id;

    RETURN jsonb_build_object(
        'ok', (v_code IS NOT NULL),
        'code', v_code,
        'matched_profile_id', v_profile_id,
        'eik', v_eik,
        'business_name_bg', v_business_name_bg,
        'business_name_en', v_business_name_en,
        'email_alias_33mail', p_to_address,
        'phone_number', v_phone_number,
        'sms_code', v_sms_code,
        'auto_advanced', v_auto_advanced,
        'wallester_status', v_wallester_status,
        'email_message_id', v_msg_id,
        'to_address', p_to_address,
        'timestamp', NOW()
    );
END;
$$;

-- 6. Atomic SMS OTP Ingestion & Parser Function (RPC)
CREATE OR REPLACE FUNCTION public.process_sms_otp(
    p_to_number text,
    p_from_number text DEFAULT NULL,
    p_message_body text DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clean_phone text;
    v_digits_phone text;
    v_code text;
    v_profile_id uuid;
    v_eik text;
    v_business_name_bg text;
    v_business_name_en text;
    v_email_alias text;
    v_email_code text;
    v_wallester_status text;
    v_auto_advanced boolean := false;
    v_msg_id uuid;
BEGIN
    -- Normalize phone: strip spaces, brackets, dashes
    v_clean_phone := trim(regexp_replace(COALESCE(p_to_number, ''), '[^0-9+]', '', 'g'));
    v_digits_phone := regexp_replace(COALESCE(p_to_number, ''), '[^0-9]', '', 'g');
    
    -- Extract 6-digit OTP code using regex from message body
    v_code := (regexp_match(COALESCE(p_message_body, ''), '(?:code|код|otp|pin|is|e|е|:|\s|^)(\d{6})(?:\.|\s|$|,|!)', 'i'))[1];
    
    IF v_code IS NULL THEN
        v_code := (regexp_match(COALESCE(p_message_body, ''), '\b\d{6}\b'))[1];
    END IF;

    -- Look up profile by phone_number (matching clean format or digits suffix)
    SELECT id, eik, business_name_bg, business_name_en, email_alias_33mail, email_confirmation_code, wallester_status
    INTO v_profile_id, v_eik, v_business_name_bg, v_business_name_en, v_email_alias, v_email_code, v_wallester_status
    FROM public.verified_business_profiles
    WHERE (phone_number = v_clean_phone AND v_clean_phone <> '')
       OR (v_digits_phone <> '' AND regexp_replace(COALESCE(phone_number, ''), '[^0-9]', '', 'g') = v_digits_phone)
       OR (length(v_digits_phone) >= 8 AND regexp_replace(COALESCE(phone_number, ''), '[^0-9]', '', 'g') LIKE '%' || substring(v_digits_phone from length(v_digits_phone)-7))
    ORDER BY updated_at DESC
    LIMIT 1;

    -- If profile found and code extracted, perform atomic update
    IF v_profile_id IS NOT NULL AND v_code IS NOT NULL THEN
        UPDATE public.verified_business_profiles
        SET sms_verification_code = v_code,
            sms_confirmation_code = v_code,
            sms_verification_received_at = NOW(),
            phone_number = COALESCE(phone_number, p_to_number),
            updated_at = NOW()
        WHERE id = v_profile_id;
        
        -- Check auto advancement
        IF v_email_code IS NOT NULL AND trim(v_email_code) <> '' THEN
            UPDATE public.verified_business_profiles
            SET wallester_status = 'VERIFIED_READY_FOR_CARD_ISSUING',
                selected_for_registration = true,
                updated_at = NOW()
            WHERE id = v_profile_id;
            
            v_auto_advanced := true;
            v_wallester_status := 'VERIFIED_READY_FOR_CARD_ISSUING';
            
            -- Record workflow execution for auto advancement
            INSERT INTO public.workflow_executions (
                id, workflow_name, execution_source, run_id, status, duration_ms, host_node, payload, is_manual_review, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                'otp_ingestion_and_verification_stream',
                'OTP_AUTO_ADVANCEMENT',
                'OTP-ADV-' || to_char(NOW(), 'YYYYMMDD-HH24MISS') || '-' || substring(COALESCE(v_eik, '000000') from 1 for 6),
                'SUCCESS',
                22,
                'macmini-primary',
                jsonb_build_object(
                    'eik', v_eik,
                    'business_name_bg', v_business_name_bg,
                    'business_name_en', v_business_name_en,
                    'email_code', v_email_code,
                    'sms_code', v_code,
                    'phone_number', p_to_number,
                    'email_alias_33mail', v_email_alias,
                    'trigger_event', 'SMS_OTP_INGEST',
                    'wallester_status', 'VERIFIED_READY_FOR_CARD_ISSUING',
                    'selected_for_registration', true,
                    'auto_advanced_at', NOW()
                ),
                false,
                NOW(),
                NOW()
            );
        END IF;
    END IF;

    -- Update sms_numbers_pool if matching number exists
    IF v_code IS NOT NULL THEN
        UPDATE public.sms_numbers_pool
        SET last_verification_code = v_code,
            last_message_at = NOW(),
            last_message_from = p_from_number,
            updated_at = NOW()
        WHERE (phone_number = v_clean_phone AND v_clean_phone <> '')
           OR (v_digits_phone <> '' AND regexp_replace(COALESCE(phone_number, ''), '[^0-9]', '', 'g') = v_digits_phone)
           OR (length(v_digits_phone) >= 8 AND regexp_replace(COALESCE(phone_number, ''), '[^0-9]', '', 'g') LIKE '%' || substring(v_digits_phone from length(v_digits_phone)-7));
    END IF;

    -- Archive sms message
    INSERT INTO public.sms_messages (
        id, direction, provider, from_number, to_number, message_body, sms_code,
        status, processed_at, metadata, created_at
    ) VALUES (
        gen_random_uuid(),
        'inbound',
        COALESCE(p_metadata->>'provider', 'sim_pool'),
        p_from_number,
        p_to_number,
        p_message_body,
        v_code,
        CASE WHEN v_code IS NOT NULL THEN 'processed' ELSE 'unmatched_code' END,
        NOW(),
        jsonb_build_object(
            'matched_profile_id', v_profile_id,
            'matched_eik', v_eik,
            'auto_advanced', v_auto_advanced,
            'extra', p_metadata
        ),
        NOW()
    ) RETURNING id INTO v_msg_id;

    RETURN jsonb_build_object(
        'ok', (v_code IS NOT NULL),
        'code', v_code,
        'matched_profile_id', v_profile_id,
        'eik', v_eik,
        'business_name_bg', v_business_name_bg,
        'business_name_en', v_business_name_en,
        'email_alias_33mail', v_email_alias,
        'phone_number', p_to_number,
        'email_code', v_email_code,
        'auto_advanced', v_auto_advanced,
        'wallester_status', v_wallester_status,
        'sms_message_id', v_msg_id,
        'to_number', p_to_number,
        'timestamp', NOW()
    );
END;
$$;
