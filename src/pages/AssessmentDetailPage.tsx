import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { GovukNotificationBanner } from "@/components/govuk/GovukNotificationBanner";
import { OutcomeTag } from "@/components/govuk/GovukTag";
import type { DimensionScore } from "@/lib/scoring-engine";

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadRun();
  }, [id]);

  async function loadRun() {
    setLoading(true);
    const { data } = await supabase
      .from("test_runs")
      .select("*, projects(name), framework_versions(version_label, frameworks(name))")
      .eq("id", id)
      .single();
    if (data) setRun(data);
    setLoading(false);
  }

  if (loading) return <GovukLayout><p className="govuk-body">Loading…</p></GovukLayout>;
  if (!run) return <GovukLayout><h1 className="govuk-heading-xl">Assessment not found</h1></GovukLayout>;

  const rationale = run.rationale_json || {};
  const dimScores: DimensionScore[] = run.dimension_scores_json || [];

  return (
    <GovukLayout>
      <Link to={`/projects/${run.project_id}`} className="govuk-back-link">
        Back to {run.projects?.name}
      </Link>

      <h1 className="govuk-heading-xl" style={{ marginTop: "15px" }}>
        Assessment: {run.projects?.name}
      </h1>

      <GovukNotificationBanner
        type={run.outcome === "IN" ? "success" : run.outcome === "OUT" ? "warning" : "info"}
        title="Assessment outcome"
      >
        <p className="govuk-notification-banner__heading">
          <OutcomeTag outcome={run.outcome} /> — Score: {run.overall_score}/100
        </p>
      </GovukNotificationBanner>

      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Date</dt>
          <dd className="govuk-summary-list__value">{new Date(run.assessed_at).toLocaleDateString("en-GB")}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Checkpoint</dt>
          <dd className="govuk-summary-list__value">{run.checkpoint}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Framework</dt>
          <dd className="govuk-summary-list__value">
            {run.framework_versions?.frameworks?.name} {run.framework_versions?.version_label}
          </dd>
        </div>
      </dl>

      {/* Dimension scores bar chart */}
      <h2 className="govuk-heading-l">Dimension scores</h2>
      <table className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col">Dimension</th>
            <th className="govuk-table__header" scope="col" style={{ width: "50%" }}>Score</th>
            <th className="govuk-table__header govuk-table__header--numeric" scope="col">%</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {dimScores.map((ds) => (
            <tr key={ds.dimension_id} className="govuk-table__row">
              <td className="govuk-table__cell">{ds.dimension_name}</td>
              <td className="govuk-table__cell">
                <div style={{ background: "hsl(var(--govuk-light-grey))", borderRadius: "2px", height: "24px", width: "100%" }}>
                  <div
                    style={{
                      background: ds.percentage >= 65 ? "hsl(var(--govuk-green))" : ds.percentage >= 45 ? "hsl(var(--govuk-orange))" : "hsl(var(--govuk-red))",
                      height: "100%",
                      width: `${Math.min(ds.percentage, 100)}%`,
                      borderRadius: "2px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </td>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {Math.round(ds.percentage)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Details section */}
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">How this was calculated</span>
        </summary>
        <div className="govuk-details__text">
          <p className="govuk-body">{rationale.rationale}</p>

          {rationale.gates_triggered?.length > 0 && (
            <>
              <h3 className="govuk-heading-s">Gates triggered</h3>
              <ul className="govuk-list govuk-list--bullet">
                {rationale.gates_triggered.map((g: any, i: number) => (
                  <li key={i}>{g.test_label}: {g.message} (scored {g.value})</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </details>

      {/* Strengths & Concerns */}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <h3 className="govuk-heading-m">Strengths</h3>
          <ul className="govuk-list govuk-list--bullet">
            {(rationale.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="govuk-grid-column-one-half">
          <h3 className="govuk-heading-m">Concerns</h3>
          <ul className="govuk-list govuk-list--bullet">
            {(rationale.concerns || []).map((c: string, i: number) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>

      <h3 className="govuk-heading-m">Recommended next steps</h3>
      <ul className="govuk-list govuk-list--bullet">
        {(rationale.recommended_next_steps || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ul>

      <div className="no-print" style={{ marginTop: "30px" }}>
        <button className="govuk-button govuk-button--secondary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
    </GovukLayout>
  );
}
