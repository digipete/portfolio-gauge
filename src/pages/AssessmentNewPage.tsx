import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { GovukNotificationBanner } from "@/components/govuk/GovukNotificationBanner";
import { OutcomeTag } from "@/components/govuk/GovukTag";
import { computeScores, type DimensionDef, type TestDef, type TestResponse, type ScoringResult } from "@/lib/scoring-engine";

const CHECKPOINTS = ["Intake", "Discovery checkpoint", "Alpha checkpoint", "Beta checkpoint", "Pre-live checkpoint"];

export default function AssessmentNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get("project") || "";

  const [projects, setProjects] = useState<any[]>([]);
  const [frameworkVersions, setFrameworkVersions] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<DimensionDef[]>([]);
  const [tests, setTests] = useState<TestDef[]>([]);

  const [projectId, setProjectId] = useState(preselectedProject);
  const [fvId, setFvId] = useState("");
  const [checkpoint, setCheckpoint] = useState("Intake");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (fvId) loadFrameworkData(fvId);
  }, [fvId]);

  async function loadInitialData() {
    const [projRes, fvRes] = await Promise.all([
      supabase.from("projects").select("id, name").order("name"),
      supabase.from("framework_versions").select("id, version_label, framework_id, frameworks(name)").eq("status", "published").order("version_label"),
    ]);
    if (projRes.data) setProjects(projRes.data);
    if (fvRes.data) {
      setFrameworkVersions(fvRes.data);
      if (fvRes.data.length > 0) setFvId(fvRes.data[0].id);
    }
    setLoading(false);
  }

  async function loadFrameworkData(versionId: string) {
    const [dimRes, testRes] = await Promise.all([
      supabase.from("dimensions").select("*").eq("framework_version_id", versionId).order("sort_order"),
      supabase.from("tests").select("*").eq("framework_version_id", versionId).order("sort_order"),
    ]);
    if (dimRes.data) setDimensions(dimRes.data as unknown as DimensionDef[]);
    if (testRes.data) setTests(testRes.data as unknown as TestDef[]);
    setResponses({});
    setResult(null);
  }

  function setResponse(testId: string, value: number) {
    setResponses((prev) => ({ ...prev, [testId]: value }));
  }

  function handleScore(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!projectId) errs.push("Select a project");
    if (!fvId) errs.push("Select a framework version");

    // Check all tests have responses
    const unanswered = tests.filter((t) => responses[t.id] == null);
    if (unanswered.length > 0) {
      errs.push(`Answer all ${unanswered.length} remaining question(s)`);
    }

    if (errs.length) {
      setErrors(errs);
      return;
    }

    const testResponses: TestResponse[] = tests.map((t) => ({
      test_id: t.id,
      value: responses[t.id] ?? 0,
    }));

    const scored = computeScores(dimensions, tests, testResponses);
    setResult(scored);
    setErrors([]);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);

    const { data: run, error: runErr } = await supabase
      .from("test_runs")
      .insert([{
        project_id: projectId,
        framework_version_id: fvId,
        checkpoint,
        overall_score: result.overall_score,
        outcome: result.outcome,
        rationale_json: JSON.parse(JSON.stringify({
          rationale: result.rationale,
          gates_triggered: result.gates_triggered,
          strengths: result.strengths,
          concerns: result.concerns,
          recommended_next_steps: result.recommended_next_steps,
        })),
        dimension_scores_json: JSON.parse(JSON.stringify(result.dimension_scores)),
        assessed_at: new Date().toISOString(),
      }] as any)
      .select()
      .single();

    if (runErr) {
      setErrors([runErr.message]);
      setSaving(false);
      return;
    }

    // Save individual responses
    const responseRows = tests.map((t) => ({
      test_run_id: run.id,
      test_id: t.id,
      response_value_json: { value: responses[t.id] ?? 0 },
    }));

    await supabase.from("test_responses").insert(responseRows);

    navigate(`/assessments/${run.id}`);
  }

  if (loading) {
    return <GovukLayout><p className="govuk-body">Loading…</p></GovukLayout>;
  }

  // Group tests by dimension
  const testsByDimension = new Map<string, TestDef[]>();
  for (const t of tests) {
    const list = testsByDimension.get(t.dimension_id) || [];
    list.push(t);
    testsByDimension.set(t.dimension_id, list);
  }

  return (
    <GovukLayout>
      <h1 className="govuk-heading-xl">New assessment</h1>

      {errors.length > 0 && (
        <div className="govuk-error-summary" data-module="govuk-error-summary">
          <div role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {result && (
        <GovukNotificationBanner
          type={result.outcome === "IN" ? "success" : result.outcome === "OUT" ? "warning" : "info"}
          title="Assessment result"
        >
          <p className="govuk-notification-banner__heading">
            Outcome: <OutcomeTag outcome={result.outcome} /> — Score: {result.overall_score}/100
          </p>
          <p className="govuk-body">{result.rationale}</p>
          <button className="govuk-button" onClick={handleSave} disabled={saving} style={{ marginTop: "10px" }}>
            {saving ? "Saving…" : "Save assessment"}
          </button>
        </GovukNotificationBanner>
      )}

      <form onSubmit={handleScore}>
        <div className="govuk-grid-row" style={{ marginBottom: "30px" }}>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="project">Project</label>
              <select className="govuk-select" id="project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select a project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="fv">Framework version</label>
              <select className="govuk-select" id="fv" value={fvId} onChange={(e) => setFvId(e.target.value)}>
                {frameworkVersions.map((fv: any) => (
                  <option key={fv.id} value={fv.id}>
                    {fv.frameworks?.name} {fv.version_label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="checkpoint">Checkpoint</label>
              <select className="govuk-select" id="checkpoint" value={checkpoint} onChange={(e) => setCheckpoint(e.target.value)}>
                {CHECKPOINTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {dimensions.map((dim) => {
          const dimTests = testsByDimension.get(dim.id) || [];
          return (
            <fieldset key={dim.id} className="govuk-fieldset" style={{ marginBottom: "40px" }}>
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h2 className="govuk-fieldset__heading">{dim.name}</h2>
              </legend>
              {dim.description && <p className="govuk-body">{dim.description}</p>}

              {dimTests.map((test) => (
                <div key={test.id} className="govuk-form-group" style={{ marginBottom: "25px", borderLeft: "4px solid hsl(var(--govuk-blue))", paddingLeft: "15px" }}>
                  <label className="govuk-label govuk-label--s" htmlFor={`test-${test.id}`}>
                    {test.label}
                    {test.is_gate && <span className="govuk-tag govuk-tag--red" style={{ marginLeft: "8px", fontSize: "12px" }}>Gate</span>}
                  </label>
                  {test.description && (
                    <div className="govuk-hint">{test.description}</div>
                  )}
                  {test.guidance && (
                    <details className="govuk-details" style={{ marginBottom: "10px" }}>
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">Guidance</span>
                      </summary>
                      <div className="govuk-details__text">{test.guidance}</div>
                    </details>
                  )}

                  <div className="govuk-radios govuk-radios--inline">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <div className="govuk-radios__item" key={val}>
                        <input
                          className="govuk-radios__input"
                          id={`test-${test.id}-${val}`}
                          name={`test-${test.id}`}
                          type="radio"
                          value={val}
                          checked={responses[test.id] === val}
                          onChange={() => setResponse(test.id, val)}
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor={`test-${test.id}-${val}`}>
                          {val}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
          );
        })}

        <button type="submit" className="govuk-button">
          Calculate score
        </button>
      </form>
    </GovukLayout>
  );
}
