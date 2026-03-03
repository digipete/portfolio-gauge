import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { GovukTag } from "@/components/govuk/GovukTag";

export default function FrameworkVersionDetailPage() {
  const { frameworkId, versionId } = useParams();
  const [version, setVersion] = useState<any>(null);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!versionId) return;
    loadData();
  }, [versionId]);

  async function loadData() {
    setLoading(true);
    const [vRes, dRes, tRes] = await Promise.all([
      supabase.from("framework_versions").select("*, frameworks(name)").eq("id", versionId).single(),
      supabase.from("dimensions").select("*").eq("framework_version_id", versionId).order("sort_order"),
      supabase.from("tests").select("*").eq("framework_version_id", versionId).order("sort_order"),
    ]);
    if (vRes.data) setVersion(vRes.data);
    if (dRes.data) setDimensions(dRes.data);
    if (tRes.data) setTests(tRes.data);
    setLoading(false);
  }

  if (loading) return <GovukLayout><p className="govuk-body">Loading…</p></GovukLayout>;
  if (!version) return <GovukLayout><h1 className="govuk-heading-xl">Version not found</h1></GovukLayout>;

  const testsByDim = new Map<string, any[]>();
  for (const t of tests) {
    const list = testsByDim.get(t.dimension_id) || [];
    list.push(t);
    testsByDim.set(t.dimension_id, list);
  }

  return (
    <GovukLayout>
      <Link to="/frameworks" className="govuk-back-link">Back to frameworks</Link>

      <h1 className="govuk-heading-xl" style={{ marginTop: "15px" }}>
        {version.frameworks?.name} — {version.version_label}
      </h1>

      <p className="govuk-body">
        Status: <GovukTag colour={version.status === "published" ? "green" : "grey"}>{version.status}</GovukTag>
      </p>

      {dimensions.map((dim) => {
        const dimTests = testsByDim.get(dim.id) || [];
        return (
          <div key={dim.id} style={{ marginBottom: "40px" }}>
            <h2 className="govuk-heading-l">{dim.name} <span className="govuk-body">(weight: {dim.weight})</span></h2>
            {dim.description && <p className="govuk-body">{dim.description}</p>}

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">#</th>
                  <th className="govuk-table__header" scope="col">Label</th>
                  <th className="govuk-table__header" scope="col">Weight</th>
                  <th className="govuk-table__header" scope="col">Gate</th>
                  <th className="govuk-table__header" scope="col">Scale</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {dimTests.map((t, i) => (
                  <tr key={t.id} className="govuk-table__row">
                    <td className="govuk-table__cell">{i + 1}</td>
                    <td className="govuk-table__cell">
                      <strong>{t.label}</strong>
                      {t.description && <div className="govuk-hint" style={{ marginBottom: 0 }}>{t.description}</div>}
                    </td>
                    <td className="govuk-table__cell">{t.weight}</td>
                    <td className="govuk-table__cell">
                      {t.is_gate ? <GovukTag colour="red">Gate</GovukTag> : "—"}
                    </td>
                    <td className="govuk-table__cell">{t.scale_min}–{t.scale_max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </GovukLayout>
  );
}
