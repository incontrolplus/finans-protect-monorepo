-- Open Balancer: Global Error Handling & Request Protection Migration
-- Target DB: supabase-db on macmini-primary (100.83.83.8)

-- 1. Ensure workflow_executions has necessary columns
ALTER TABLE IF EXISTS public.workflow_executions 
    ADD COLUMN IF NOT EXISTS validation_errors jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS is_manual_review boolean DEFAULT false;

-- 2. Create registration_requests table if not exists
CREATE TABLE IF NOT EXISTS public.registration_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id text,
    email text,
    phone text,
    company_name text,
    status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'NEEDS_MANUAL_REVIEW', 'REJECTED'
    rejection_reason text,
    validation_errors jsonb DEFAULT '[]'::jsonb,
    raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    source_workflow text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create Indexes for High-Performance Querying & Filtering
CREATE INDEX IF NOT EXISTS idx_reg_requests_status ON public.registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_reg_requests_manual ON public.registration_requests(status) WHERE status = 'NEEDS_MANUAL_REVIEW';
CREATE INDEX IF NOT EXISTS idx_reg_requests_created_at ON public.registration_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_requests_email ON public.registration_requests(email);

-- 4. Enable Row Level Security & Configure Access Policies
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to registration_requests" ON public.registration_requests;
CREATE POLICY "Allow all access to registration_requests"
    ON public.registration_requests
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

GRANT ALL ON public.registration_requests TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.workflow_executions TO anon, authenticated, service_role, postgres;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
