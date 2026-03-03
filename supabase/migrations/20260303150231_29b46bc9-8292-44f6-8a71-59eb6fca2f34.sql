
-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT,
  sponsoring_area TEXT,
  service_or_journey TEXT,
  primary_users TEXT[],
  stage TEXT NOT NULL DEFAULT 'Idea',
  delivery_model TEXT DEFAULT 'Internal',
  estimated_cost_band TEXT DEFAULT 'M',
  dependencies TEXT,
  risks TEXT,
  links JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Frameworks table
CREATE TABLE public.frameworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Framework versions
CREATE TABLE public.framework_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dimensions
CREATE TABLE public.dimensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_version_id UUID NOT NULL REFERENCES public.framework_versions(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  weight NUMERIC NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Tests (criteria/questions)
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  framework_version_id UUID NOT NULL REFERENCES public.framework_versions(id) ON DELETE CASCADE,
  dimension_id UUID NOT NULL REFERENCES public.dimensions(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  guidance TEXT,
  input_type TEXT NOT NULL DEFAULT 'scale_1_5',
  scale_min INTEGER NOT NULL DEFAULT 1,
  scale_max INTEGER NOT NULL DEFAULT 5,
  weight NUMERIC NOT NULL DEFAULT 1,
  is_gate BOOLEAN NOT NULL DEFAULT false,
  gate_rule_json JSONB,
  scoring_rule_json JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Test runs (assessment events)
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  framework_version_id UUID NOT NULL REFERENCES public.framework_versions(id),
  checkpoint TEXT NOT NULL,
  assessed_by UUID REFERENCES auth.users(id),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  overall_score NUMERIC,
  outcome TEXT CHECK (outcome IN ('IN', 'CONDITIONAL', 'OUT')),
  rationale_json JSONB,
  dimension_scores_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Test responses
CREATE TABLE public.test_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_run_id UUID NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id),
  response_value_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can read/write all (demo team mode)
CREATE POLICY "Authenticated users can read projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON public.projects FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read frameworks" ON public.frameworks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert frameworks" ON public.frameworks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read framework_versions" ON public.framework_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert framework_versions" ON public.framework_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update framework_versions" ON public.framework_versions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read dimensions" ON public.dimensions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert dimensions" ON public.dimensions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read tests" ON public.tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tests" ON public.tests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tests" ON public.tests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read test_runs" ON public.test_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert test_runs" ON public.test_runs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read test_responses" ON public.test_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert test_responses" ON public.test_responses FOR INSERT TO authenticated WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
