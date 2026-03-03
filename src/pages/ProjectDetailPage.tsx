import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { StageTag, OutcomeTag } from "@/components/govuk/GovukTag";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    const [projRes, runsRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase
        .from("test_runs")
        .select("*, framework_versions(version_label, frameworks(name))")
        .eq("project_id", id)
        .order("assessed_at", { ascending: false }),
    ]);
    if (projRes.data) setProject(projRes.data);
    if (runsRes.data) setRuns(runsRes.data);
    setLoading(false);
  }

  if (loading) {
    return (
      <GovukLayout>
        <p className="govuk-body">Loading…</p>
      </GovukLayout>
    );
  }

  if (!project) {
    return (
      <GovukLayout>
        <h1 className="govuk-heading-xl">Project not found</h1>
        <Link to="/projects" className="govuk-link">Back to projects</Link>
      </GovukLayout>
    );
  }

  return (
    <GovukLayout>
      <Link to="/projects" className="govuk-back-link">Back to projects</Link>

      <h1 className="govuk-heading-xl" style={{ marginTop: "15px" }}>
        {project.name}
      </h1>

      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Stage</dt>
          <dd className="govuk-summary-list__value"><StageTag stage={project.stage} /></dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Description</dt>
          <dd className="govuk-summary-list__value">{project.short_description || "—"}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Sponsoring area</dt>
          <dd className="govuk-summary-list__value">{project.sponsoring_area || "—"}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Service / Journey</dt>
          <dd className="govuk-summary-list__value">{project.service_or_journey || "—"}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Delivery model</dt>
          <dd className="govuk-summary-list__value">{project.delivery_model || "—"}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Cost band</dt>
          <dd className="govuk-summary-list__value">{project.estimated_cost_band || "—"}</dd>
        </div>
      </dl>

      <h2 className="govuk-heading-l">Assessment history</h2>

      <Link to={`/assessments/new?project=${id}`} className="govuk-button" style={{ marginBottom: "20px" }}>
        Run new assessment
      </Link>

      {runs.length === 0 ? (
        <p className="govuk-body">No assessments yet.</p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">Date</th>
              <th className="govuk-table__header" scope="col">Checkpoint</th>
              <th className="govuk-table__header" scope="col">Framework</th>
              <th className="govuk-table__header" scope="col">Outcome</th>
              <th className="govuk-table__header govuk-table__header--numeric" scope="col">Score</th>
              <th className="govuk-table__header" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {runs.map((run: any) => (
              <tr key={run.id} className="govuk-table__row">
                <td className="govuk-table__cell">
                  {new Date(run.assessed_at).toLocaleDateString("en-GB")}
                </td>
                <td className="govuk-table__cell">{run.checkpoint}</td>
                <td className="govuk-table__cell">
                  {run.framework_versions?.frameworks?.name} {run.framework_versions?.version_label}
                </td>
                <td className="govuk-table__cell">
                  <OutcomeTag outcome={run.outcome} />
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {run.overall_score}
                </td>
                <td className="govuk-table__cell">
                  <Link to={`/assessments/${run.id}`} className="govuk-link">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GovukLayout>
  );
}
