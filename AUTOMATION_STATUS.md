# Open Balancer: Automation & Infrastructure Status

**Last Updated:** 2026-08-20  
**Cluster:** Open Balancer Core (`macmini-primary` / `100.83.83.8`)  
**Status:** 🟢 OPERATIONAL & ZERO-DATA-LOSS PROTECTED  

---

## 🛡️ Global Error Handling & Request Protection

### 1. Database Schema (`supabase-db` on `100.83.83.8:8002`)
*   **`public.registration_requests`**:
    *   `id` (`uuid`, PK, `gen_random_uuid()`)
    *   `client_id` (`text`)
    *   `email` (`text`)
    *   `phone` (`text`)
    *   `company_name` (`text`)
    *   `status` (`text`, default `'PENDING'`) — Values: `'PENDING'`, `'PROCESSED'`, `'NEEDS_MANUAL_REVIEW'`, `'REJECTED'`
    *   `rejection_reason` (`text`)
    *   `validation_errors` (`jsonb`, default `'[]'`)
    *   `raw_payload` (`jsonb`, default `'{}'`, **100% Zero Data Loss Guarantee**)
    *   `source_workflow` (`text`)
    *   `created_at` / `updated_at` (`timestamptz`)
    *   **Indexes:** `idx_reg_requests_status`, `idx_reg_requests_manual` (partial on `NEEDS_MANUAL_REVIEW`), `idx_reg_requests_created_at`, `idx_reg_requests_email`
    *   **Security:** RLS enabled with permissive policies for `anon`, `authenticated`, `service_role`.

*   **`public.workflow_executions`**:
    *   `validation_errors` (`jsonb`, default `'[]'`)
    *   `is_manual_review` (`boolean`, default `false`)
    *   `payload` (`jsonb`, full diagnostics snapshot)

---

## 🦁 Wallester V4.5 B2B Onboarding & Verification Pipeline

*   **Endpoint:** `/webhook/b2b-onboarding-pipeline` (POST) on `http://100.83.83.8:5679` / `https://n8n.openbalancer.com`
*   **Workflow File:** `n8n/b2b_onboarding_verification_pipeline.n8n.json`
*   **Postgres Trigger:** `public.trigger_wallester_registration()` attached `AFTER INSERT OR UPDATE` on `public.verified_business_profiles`
*   **5-Step Architecture:**
    1. **Verification Node:** Algorithmic Mod 11 checksum calculation for 9 & 13 digit Bulgarian EIK/BULSTAT.
    2. **Eligibility Engine:** Automatically awards `FREE_CARD_PLUS_150_BONUS` with €150 bonus and VAT validation.
    3. **Wallester API Client:** Generates `APP-WB-{YYYYMMDD}-{UUID}` and cryptographic HMAC-SHA256 link with 72-hour validity.
    4. **Supabase Persistence & Accounts:** Upserts into `public.verified_business_profiles`, registers account in `public.wallester_accounts`, and records telemetry in `public.workflow_executions`.
    5. **Ops Alerts:** Instant HTML dispatch to `Leon | DevOps 🦁` via Telegram Bot `8545664325`.
*   **Revenue War Room (`http://100.83.83.8:3117`):**
    *   `Wallester accounts`: `> 0` (Active)
    *   Blockers: `0` (Cleared `P0 · wallester_accounts_zero`, `P0 · trigger_not_run`, `P1 · stale_vbp_trigger`)
*   **Test Runner:** `scripts/test_b2b_pipeline.py` & `scripts/deploy_b2b_pipeline_and_triggers.py` (100% PASS)

---

## 📱 Step 2: Email & SMS OTP Ingestion, Parser & Auto-Advancement Stream

*   **Status:** 🟢 ACTIVE, DEPLOYED & TESTED (100% PASS)
*   **Endpoints (`http://100.83.83.8:5679` & `https://n8n.openbalancer.com`):**
    *   `POST /webhook/email-otp-ingest` — Ingestion for 33Mail / Hostinger email forwarder.
    *   `POST /webhook/sms-otp-ingest` — Ingestion for DuoPlus / SIM pool SMS streams.
*   **Workflow File:** `n8n/otp_ingestion_and_verification_stream.n8n.json`
*   **Python Engine & CLI:**
    *   `openbalancer/b2b_pipeline/otp_processor.py` (Core RegEx parser, phone normalizer, Supabase persistence & Telegram dispatcher).
    *   `scripts/run_otp_ingestion_pipeline.py` (CLI runner with `--email-code`, `--sms-code`, `--scorecard`).
    *   `scripts/deploy_otp_pipeline.py` (Automated n8n DB injector & deployment tool).
    *   `scripts/test_otp_pipeline_e2e.py` (Comprehensive E2E test suite covering Tests A, B, C, D).
*   **Database Innovations & Stored RPCs (`supabase-db` on `100.83.83.8:8002`):**
    *   `public.process_email_otp(to_address, from_address, subject, body, metadata)` — Atomic parser, DB updater, message archiver in `email_messages`, auto-advancement engine.
    *   `public.process_sms_otp(to_number, from_number, message_body, metadata)` — Atomic phone normalizer, DB updater, pool updater in `sms_numbers_pool`, message archiver in `sms_messages`, auto-advancement engine.
    *   `trigger_otp_auto_advancement()` — BEFORE trigger on `verified_business_profiles` guaranteeing atomic transition to `VERIFIED_READY_FOR_CARD_ISSUING` and `selected_for_registration = true` whenever both codes are populated.
*   **Revenue Scorecard Live Telemetry (`public.revenue_scorecard`):**
    *   `email_codes`: Active and updating in real-time.
    *   `sms_codes`: Active and updating in real-time.
    *   `selected_for_registration`: Auto-advancing upon dual code reception.
*   **Telegram Real-Time Alerts:**
    *   Instant formatted HTML delivery to `Leon | DevOps 🦁` (`chat_id: 8041248687`) via bot `8545664325`.
