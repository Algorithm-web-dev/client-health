-- Remove previous placeholder model
DROP TABLE IF EXISTS public.action_log CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.agent_deltas CASCADE;
DROP TABLE IF EXISTS public.agent_outputs CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.cycles CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.client_tier CASCADE;
DROP TYPE IF EXISTS public.cycle_status CASCADE;
DROP TYPE IF EXISTS public.submission_status CASCADE;
DROP TYPE IF EXISTS public.rag_status CASCADE;
DROP TYPE IF EXISTS public.trajectory_flag CASCADE;
DROP TYPE IF EXISTS public.review_status CASCADE;

-- PROFILES aligned to spec
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'ci';
UPDATE public.profiles SET full_name = COALESCE(NULLIF(full_name,''), COALESCE(email,'Unknown'));
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('ci','director','admin'));

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- role lookup without recursive RLS on profiles
CREATE OR REPLACE FUNCTION public.current_role_is(_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = ANY(_roles));
$$;
REVOKE ALL ON FUNCTION public.current_role_is(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_role_is(text[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''), 'ci')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- CLIENTS
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  ci_leads text[] NOT NULL DEFAULT '{}',
  director_support text,
  tier text CHECK (tier IN ('A','B','C','D')),
  scope jsonb NOT NULL DEFAULT '{"seo":false,"paid":false,"data":false,"web_dev":false,"cro":false}',
  memory_summary text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','no_scope','archived'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manages clients" ON public.clients FOR ALL TO authenticated
  USING (public.current_role_is(ARRAY['admin'])) WITH CHECK (public.current_role_is(ARRAY['admin']));

-- CYCLES
CREATE TABLE public.cycles (
  id text PRIMARY KEY,
  label text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  is_seed boolean NOT NULL DEFAULT false,
  batch_run_completed boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycles TO authenticated;
GRANT ALL ON public.cycles TO service_role;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read cycles" ON public.cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "director manages cycles" ON public.cycles FOR ALL TO authenticated
  USING (public.current_role_is(ARRAY['director','admin']))
  WITH CHECK (public.current_role_is(ARRAY['director','admin']));

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients ON DELETE CASCADE,
  cycle_id text NOT NULL REFERENCES public.cycles,
  submitted_by uuid REFERENCES public.profiles,
  submitted_at timestamptz DEFAULT now(),
  fast_path boolean NOT NULL DEFAULT false,
  is_seed boolean NOT NULL DEFAULT false,
  performance_rag text CHECK (performance_rag IN ('Green','Amber','Red')),
  performance_reason text,
  paid_rag text CHECK (paid_rag IN ('Green','Amber','Red')),
  paid_reason text,
  relationship_rag text CHECK (relationship_rag IN ('Green','Amber','Red')),
  relationship_reason text,
  confidence_score int CHECK (confidence_score BETWEEN 1 AND 10),
  growth_rag text CHECK (growth_rag IN ('Green','Amber','Red')),
  growth_reason text,
  overall_rag text CHECK (overall_rag IN ('Green','Amber','Red')),
  upsell_opportunity text,
  upsell_value text,
  upsell_probability numeric,
  next_action text,
  action_owner text,
  action_deadline date,
  validation_flags jsonb DEFAULT '[]',
  hidden_risk boolean DEFAULT false,
  hidden_risk_reason text,
  status text NOT NULL DEFAULT 'phase1_complete' CHECK (status IN ('phase1_complete','submitted')),
  version int NOT NULL DEFAULT 1,
  UNIQUE (client_id, cycle_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read submissions" ON public.submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "ci writes own submissions" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "ci updates own submissions" ON public.submissions FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid()) WITH CHECK (submitted_by = auth.uid());

-- QUESTIONS
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients,
  cycle_id text NOT NULL REFERENCES public.cycles,
  question_text text NOT NULL,
  question_context text,
  answer_text text,
  generated_by_agent boolean NOT NULL DEFAULT true,
  is_fallback boolean NOT NULL DEFAULT false,
  rag_at_time text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authed write questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authed update questions" ON public.questions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- AGENT OUTPUTS
CREATE TABLE public.agent_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients,
  cycle_id text NOT NULL REFERENCES public.cycles,
  type text NOT NULL DEFAULT 'batch' CHECK (type IN ('phase2','batch')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','complete','failed')),
  insight_narrative text,
  trajectory_flag jsonb,
  upsell_window jsonb,
  recommended_actions jsonb,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_outputs TO authenticated;
GRANT ALL ON public.agent_outputs TO service_role;
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read agent outputs" ON public.agent_outputs FOR SELECT TO authenticated USING (true);
CREATE POLICY "director manages agent outputs" ON public.agent_outputs FOR ALL TO authenticated
  USING (public.current_role_is(ARRAY['director','admin']))
  WITH CHECK (public.current_role_is(ARRAY['director','admin']));

-- AGENT DELTAS
CREATE TABLE public.agent_deltas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_output_id uuid NOT NULL REFERENCES public.agent_outputs ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients,
  cycle_id text NOT NULL REFERENCES public.cycles,
  risk_before text,
  risk_after text,
  new_flags jsonb DEFAULT '[]',
  resolved_flags jsonb DEFAULT '[]',
  summary text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_deltas TO authenticated;
GRANT ALL ON public.agent_deltas TO service_role;
ALTER TABLE public.agent_deltas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read deltas" ON public.agent_deltas FOR SELECT TO authenticated USING (true);
CREATE POLICY "director manages deltas" ON public.agent_deltas FOR ALL TO authenticated
  USING (public.current_role_is(ARRAY['director','admin']))
  WITH CHECK (public.current_role_is(ARRAY['director','admin']));

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_output_id uuid NOT NULL REFERENCES public.agent_outputs ON DELETE CASCADE,
  reviewed_by uuid REFERENCES public.profiles,
  decision text NOT NULL CHECK (decision IN ('confirmed','overridden')),
  override_reason text,
  reviewed_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "authed write reviews" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (reviewed_by = auth.uid());

-- ACTION LOG
CREATE TABLE public.action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients,
  cycle_id text NOT NULL REFERENCES public.cycles,
  description text NOT NULL,
  owner text,
  deadline date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','abandoned')),
  outcome text CHECK (outcome IN ('done','no_change','client_responded','improved','worsened')),
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_log TO authenticated;
GRANT ALL ON public.action_log TO service_role;
ALTER TABLE public.action_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authed read actions" ON public.action_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "authed write actions" ON public.action_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authed update actions" ON public.action_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_submissions_client_cycle ON public.submissions(client_id, cycle_id);
CREATE INDEX idx_agent_outputs_client_created ON public.agent_outputs(client_id, created_at DESC);