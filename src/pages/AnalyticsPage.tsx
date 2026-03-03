import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { OutcomeTag } from "@/components/govuk/GovukTag";
import type { DimensionScore } from "@/lib/scoring-engine";

export default function AnalyticsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from("test_runs")
      .select("*, projects(name, stage)")
      .order("assessed_at", { ascending: false });
    if (data) setRuns(data);
    setLoading(false);
  }

  // Get latest run per project
  const latestByProject = new Map<string, any>();
  for (const run of runs) {
    if (!latestByProject.has(run.project_id)) {
      latestByProject.set(run.project_id, run);
    }
  }
  const latestRuns = Array.from(latestByProject.values());

  // Distribution counts
  const distribution = { IN: 0, CONDITIONAL: 0, OUT: 0 };
  for (const r of latestRuns) {
    if (r.outcome in distribution) {
      distribution[r.outcome as keyof typeof distribution]++;
    }
  }

  function exportCsv() {
    const headers = ["Project", "Score", "Outcome", "Checkpoint", "Date"];
    const rows = latestRuns.map((r) => [
      r.projects?.name || "",
      r.overall_score,
      r.outcome,
      r.checkpoint,
      new Date(r.assessed_at).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <GovukLayout><p className="govuk-body">Loading…</p></GovukLayout>;

  return (
    <GovukLayout>
      <h1 className="govuk-heading-xl">Portfolio analytics</h1>

      <div className="no-print" style={{ marginBottom: "20px" }}>
        <button className="govuk-button govuk-button--secondary" onClick={exportCsv} style={{ marginRight: "10px" }}>
          Export CSV
        </button>
        <button className="govuk-button govuk-button--secondary" onClick={() => window.print()}>
          Print / PDF
        </button>
      </div>

      {/* Distribution */}
      <h2 className="govuk-heading-l">Portfolio distribution (latest run per project)</h2>
      <div className="govuk-grid-row" style={{ marginBottom: "40px" }}>
        {(["IN", "CONDITIONAL", "OUT"] as const).map((outcome) => (
          <div key={outcome} className="govuk-grid-column-one-third">
            <div style={{
              textAlign: "center",
              padding: "20px",
              background: "hsl(var(--govuk-light-grey))",
              borderTop: `4px solid ${outcome === "IN" ? "hsl(var(--govuk-green))" : outcome === "OUT" ? "hsl(var(--govuk-red))" : "hsl(var(--govuk-orange))"}`,
            }}>
              <p className="govuk-heading-xl" style={{ marginBottom: "5px" }}>
                {distribution[outcome]}
              </p>
              <OutcomeTag outcome={outcome} />
            </div>
          </div>
        ))}
      </div>

      {/* Dimension heatmap */}
      <h2 className="govuk-heading-l">Dimension heatmap</h2>
      {latestRuns.length > 0 && latestRuns[0].dimension_scores_json ? (
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="col">Project</th>
                {(latestRuns[0].dimension_scores_json as DimensionScore[]).map((d) => (
                  <th className="govuk-table__header" scope="col" key={d.dimension_key}>{d.dimension_name}</th>
                ))}
                <th className="govuk-table__header govuk-table__header--numeric" scope="col">Overall</th>
                <th className="govuk-table__header" scope="col">Outcome</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {latestRuns.map((r) => {
                const ds: DimensionScore[] = r.dimension_scores_json || [];
                return (
                  <tr key={r.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{r.projects?.name}</td>
                    {ds.map((d) => {
                      const pct = Math.round(d.percentage);
                      const bg = pct >= 65 ? "hsl(164 100% 25% / 0.15)" : pct >= 45 ? "hsl(50 100% 50% / 0.2)" : "hsl(0 70% 45% / 0.15)";
                      return (
                        <td key={d.dimension_key} className="govuk-table__cell" style={{ background: bg, textAlign: "center" }}>
                          {pct}%
                        </td>
                      );
                    })}
                    <td className="govuk-table__cell govuk-table__cell--numeric">{r.overall_score}</td>
                    <td className="govuk-table__cell"><OutcomeTag outcome={r.outcome} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="govuk-body">No assessment data to display.</p>
      )}

      {/* All runs table */}
      <h2 className="govuk-heading-l">All assessment runs</h2>
      <table className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th className="govuk-table__header" scope="col">Project</th>
            <th className="govuk-table__header" scope="col">Checkpoint</th>
            <th className="govuk-table__header" scope="col">Date</th>
            <th className="govuk-table__header govuk-table__header--numeric" scope="col">Score</th>
            <th className="govuk-table__header" scope="col">Outcome</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {runs.map((r) => (
            <tr key={r.id} className="govuk-table__row">
              <td className="govuk-table__cell">{r.projects?.name}</td>
              <td className="govuk-table__cell">{r.checkpoint}</td>
              <td className="govuk-table__cell">{new Date(r.assessed_at).toLocaleDateString("en-GB")}</td>
              <td className="govuk-table__cell govuk-table__cell--numeric">{r.overall_score}</td>
              <td className="govuk-table__cell"><OutcomeTag outcome={r.outcome} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </GovukLayout>
  );
}
