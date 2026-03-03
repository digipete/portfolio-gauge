import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { StageTag, OutcomeTag } from "@/components/govuk/GovukTag";

interface Project {
  id: string;
  name: string;
  short_description: string;
  stage: string;
  sponsoring_area: string;
  delivery_model: string;
  estimated_cost_band: string;
  latest_outcome?: string;
  latest_score?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("name");

    if (!error && data) {
      // Get latest test run for each project
      const { data: runs } = await supabase
        .from("test_runs")
        .select("project_id, overall_score, outcome, assessed_at")
        .order("assessed_at", { ascending: false });

      const latestRuns = new Map<string, { outcome: string; score: number }>();
      if (runs) {
        for (const run of runs) {
          if (!latestRuns.has(run.project_id)) {
            latestRuns.set(run.project_id, {
              outcome: run.outcome,
              score: run.overall_score,
            });
          }
        }
      }

      setProjects(
        data.map((p) => ({
          ...p,
          latest_outcome: latestRuns.get(p.id)?.outcome,
          latest_score: latestRuns.get(p.id)?.score,
        }))
      );
    }
    setLoading(false);
  }

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || p.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <GovukLayout>
      <h1 className="govuk-heading-xl">Projects</h1>

      <div className="govuk-grid-row" style={{ marginBottom: "20px" }}>
        <div className="govuk-grid-column-one-half">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="search">
              Search projects
            </label>
            <input
              className="govuk-input"
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="stage-filter">
              Stage
            </label>
            <select
              className="govuk-select"
              id="stage-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="">All stages</option>
              {["Idea", "Discovery", "Alpha", "Beta", "Live"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter" style={{ paddingTop: "30px" }}>
          <Link to="/projects/new" className="govuk-button">
            Create project
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="govuk-body">Loading projects…</p>
      ) : filtered.length === 0 ? (
        <p className="govuk-body">No projects found.</p>
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">Name</th>
              <th className="govuk-table__header" scope="col">Stage</th>
              <th className="govuk-table__header" scope="col">Sponsoring area</th>
              <th className="govuk-table__header" scope="col">Cost band</th>
              <th className="govuk-table__header" scope="col">Latest outcome</th>
              <th className="govuk-table__header govuk-table__header--numeric" scope="col">Score</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {filtered.map((p) => (
              <tr key={p.id} className="govuk-table__row">
                <td className="govuk-table__cell">
                  <Link to={`/projects/${p.id}`} className="govuk-link">
                    {p.name}
                  </Link>
                </td>
                <td className="govuk-table__cell">
                  <StageTag stage={p.stage} />
                </td>
                <td className="govuk-table__cell">{p.sponsoring_area || "—"}</td>
                <td className="govuk-table__cell">{p.estimated_cost_band || "—"}</td>
                <td className="govuk-table__cell">
                  {p.latest_outcome ? <OutcomeTag outcome={p.latest_outcome} /> : "—"}
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {p.latest_score != null ? p.latest_score : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GovukLayout>
  );
}
