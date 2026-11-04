BEGIN;

ALTER TABLE public.hnc_company_enquiries
  ADD COLUMN IF NOT EXISTS preferred_callback_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_consent_at timestamptz;

CREATE TABLE IF NOT EXISTS public.hnc_customer_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.hnc_company_directory(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name text,
  requester_email text,
  requester_phone text,
  category text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  company_response text,
  responded_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hnc_customer_complaints_category_check
    CHECK (category IN (
      'poor_customer_service','unanswered_call','unreturned_call',
      'unresolved_enquiry','billing','product_or_service',
      'staff_conduct','general'
    )),
  CONSTRAINT hnc_customer_complaints_status_check
    CHECK (status IN (
      'submitted','acknowledged','investigating','awaiting_customer',
      'resolved','closed','rejected'
    ))
);

CREATE TABLE IF NOT EXISTS public.hnc_company_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.hnc_company_directory(id) ON DELETE CASCADE,
  caller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider text,
  provider_call_id text UNIQUE,
  status text NOT NULL DEFAULT 'initiated',
  duration_seconds integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hnc_company_calls_status_check
    CHECK (status IN (
      'initiated','ringing','answered','no_answer','busy','failed',
      'completed','cancelled'
    )),
  CONSTRAINT hnc_company_calls_duration_check CHECK (duration_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS idx_hnc_customer_complaints_company
  ON public.hnc_customer_complaints(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hnc_customer_complaints_requester
  ON public.hnc_customer_complaints(requester_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hnc_customer_complaints_status
  ON public.hnc_customer_complaints(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hnc_company_calls_company
  ON public.hnc_company_calls(company_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_hnc_company_calls_caller
  ON public.hnc_company_calls(caller_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_hnc_company_calls_status
  ON public.hnc_company_calls(status, started_at DESC);

ALTER TABLE public.hnc_customer_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hnc_company_calls ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.hnc_customer_complaints FROM anon, authenticated;
REVOKE ALL ON public.hnc_company_calls FROM anon, authenticated;

GRANT ALL ON public.hnc_customer_complaints TO service_role;
GRANT ALL ON public.hnc_company_calls TO service_role;

COMMIT;