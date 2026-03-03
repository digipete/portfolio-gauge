import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";
import { GovukTag } from "@/components/govuk/GovukTag";

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFrameworks();
  }, []);

  async function loadFrameworks() {
    setLoading(true);
    const { data } = await supabase
      .from("frameworks")
      .select("*, framework_versions(*)")
      .order("name");
    if (data) setFrameworks(data);
    setLoading(false);
  }

  const statusColour = (s: string) => {
    if (s === "published") return "green" as const;
    if (s === "draft") return "grey" as const;
    return "orange" as const;
  };

  return (
    <GovukLayout>
      <h1 className="govuk-heading-xl">Frameworks</h1>

      {loading ? (
        <p className="govuk-body">Loading…</p>
      ) : frameworks.length === 0 ? (
        <p className="govuk-body">No frameworks configured.</p>
      ) : (
        frameworks.map((fw) => (
          <div key={fw.id} style={{ marginBottom: "40px" }}>
            <h2 className="govuk-heading-l">{fw.name}</h2>
            {fw.description && <p className="govuk-body">{fw.description}</p>}

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="col">Version</th>
                  <th className="govuk-table__header" scope="col">Status</th>
                  <th className="govuk-table__header" scope="col">Created</th>
                  <th className="govuk-table__header" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {(fw.framework_versions || [])
                  .sort((a: any, b: any) => b.version_label.localeCompare(a.version_label))
                  .map((fv: any) => (
                    <tr key={fv.id} className="govuk-table__row">
                      <td className="govuk-table__cell">{fv.version_label}</td>
                      <td className="govuk-table__cell">
                        <GovukTag colour={statusColour(fv.status)}>{fv.status}</GovukTag>
                      </td>
                      <td className="govuk-table__cell">
                        {new Date(fv.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="govuk-table__cell">
                        <Link to={`/frameworks/${fw.id}/versions/${fv.id}`} className="govuk-link">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </GovukLayout>
  );
}
