-- ENUMS
CREATE TYPE public.client_tier AS ENUM ('enterprise','growth','core');
CREATE TYPE public.cycle_status AS ENUM ('draft','open','closed');
CREATE TYPE public.submission_status AS ENUM ('draft','submitted');
CREATE TYPE public.rag_status AS ENUM ('green','amber','red');
CREATE TYPE public.trajectory_flag AS ENUM ('improving','stable','deteriorating');
CREATE TYPE public.review_status AS ENUM ('pending','approved','changes_requested');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CLIENTS
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier public.client_tier NOT NULL DEFAULT 'core',
  ci_lead_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  industry text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read clients" ON public.clients FOR SELECT TO authenticated
  USING (ci_lead_id = auth.uid() OR public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'director'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'director'));
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CYCLES
CREATE TABLE public.cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status public.cycle_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycles TO authenticated;
GRANT ALL ON public.cycles TO service_role;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read cycles" ON public.cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Directors manage cycles" ON public.cycles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER cycles_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QUESTIONS
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES public.cycles(id) ON DELETE CASCADE,
  key text NOT NULL,
  prompt text NOT NULL,
  category text,
  help_text text,
  order_index integer NOT NULL DEFAULT 0,
  weight numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Directors manage questions" ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  ci_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.submission_status NOT NULL DEFAULT 'draft',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, cycle_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CIs read own submissions" ON public.submissions FOR SELECT TO authenticated
  USING (ci_user_id = auth.uid() OR public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "CIs insert own submissions" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (ci_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "CIs update own draft submissions" ON public.submissions FOR UPDATE TO authenticated
  USING ((ci_user_id = auth.uid() AND status = 'draft') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (ci_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete submissions" ON public.submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AGENT OUTPUTS
CREATE TABLE public.agent_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES public.cycles(id) ON DELETE SET NULL,
  overall_rag public.rag_status NOT NULL DEFAULT 'green',
  confidence_score numeric NOT NULL DEFAULT 0,
  hidden_risk boolean NOT NULL DEFAULT false,
  trajectory_flag public.trajectory_flag NOT NULL DEFAULT 'stable',
  summary text,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  dimension_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_outputs TO authenticated;
GRANT ALL ON public.agent_outputs TO service_role;
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read agent outputs" ON public.agent_outputs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = agent_outputs.submission_id AND s.ci_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.clients c WHERE c.id = agent_outputs.client_id AND c.ci_lead_id = auth.uid()));
CREATE POLICY "Directors manage agent outputs" ON public.agent_outputs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER agent_outputs_updated_at BEFORE UPDATE ON public.agent_outputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AGENT DELTAS
CREATE TABLE public.agent_deltas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_output_id uuid NOT NULL REFERENCES public.agent_outputs(id) ON DELETE CASCADE,
  previous_output_id uuid REFERENCES public.agent_outputs(id) ON DELETE SET NULL,
  field text NOT NULL,
  previous_value text,
  new_value text,
  direction text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_deltas TO authenticated;
GRANT ALL ON public.agent_deltas TO service_role;
ALTER TABLE public.agent_deltas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read agent deltas" ON public.agent_deltas FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.agent_outputs o JOIN public.clients c ON c.id = o.client_id
               WHERE o.id = agent_deltas.agent_output_id AND c.ci_lead_id = auth.uid()));
CREATE POLICY "Directors manage agent deltas" ON public.agent_deltas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_output_id uuid NOT NULL REFERENCES public.agent_outputs(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.review_status NOT NULL DEFAULT 'pending',
  notes text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read reviews" ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.agent_outputs o JOIN public.clients c ON c.id = o.client_id
               WHERE o.id = reviews.agent_output_id AND c.ci_lead_id = auth.uid()));
CREATE POLICY "Directors manage reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ACTION LOG
CREATE TABLE public.action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.action_log TO authenticated;
GRANT ALL ON public.action_log TO service_role;
ALTER TABLE public.action_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read action log" ON public.action_log FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR public.has_role(auth.uid(),'director') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Insert own action log" ON public.action_log FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE INDEX idx_submissions_client ON public.submissions(client_id, cycle_id);
CREATE INDEX idx_agent_outputs_client_created ON public.agent_outputs(client_id, created_at DESC);
CREATE INDEX idx_clients_ci_lead ON public.clients(ci_lead_id);