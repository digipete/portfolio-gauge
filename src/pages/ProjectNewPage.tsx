import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";

const STAGES = ["Idea", "Discovery", "Alpha", "Beta", "Live"];
const DELIVERY_MODELS = ["Internal", "Supplier", "Hybrid"];
const COST_BANDS = ["S", "M", "L"];

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    sponsoring_area: "",
    service_or_journey: "",
    stage: "Idea",
    delivery_model: "Internal",
    estimated_cost_band: "M",
    dependencies: "",
    risks: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("Enter a project name");
    if (errs.length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("projects")
      .insert([form])
      .select()
      .single();

    if (error) {
      setErrors([error.message]);
      setSaving(false);
      return;
    }

    navigate(`/projects/${data.id}`);
  }

  return (
    <GovukLayout>
      <a href="#/projects" className="govuk-back-link" onClick={(e) => { e.preventDefault(); navigate("/projects"); }}>
        Back to projects
      </a>

      <h1 className="govuk-heading-xl" style={{ marginTop: "15px" }}>Create a new project</h1>

      {errors.length > 0 && (
        <div className="govuk-error-summary" data-module="govuk-error-summary">
          <div role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                {errors.map((e, i) => (
                  <li key={i}><a href="#name">{e}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="name">Project name</label>
          <input className="govuk-input" id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="desc">Short description</label>
          <textarea className="govuk-textarea" id="desc" rows={3} value={form.short_description} onChange={(e) => update("short_description", e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="sponsor">Sponsoring area</label>
          <input className="govuk-input" id="sponsor" value={form.sponsoring_area} onChange={(e) => update("sponsoring_area", e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="service">Service or journey</label>
          <input className="govuk-input" id="service" value={form.service_or_journey} onChange={(e) => update("service_or_journey", e.target.value)} />
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="stage">Stage</label>
              <select className="govuk-select" id="stage" value={form.stage} onChange={(e) => update("stage", e.target.value)}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="delivery">Delivery model</label>
              <select className="govuk-select" id="delivery" value={form.delivery_model} onChange={(e) => update("delivery_model", e.target.value)}>
                {DELIVERY_MODELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--m" htmlFor="cost">Cost band</label>
              <select className="govuk-select" id="cost" value={form.estimated_cost_band} onChange={(e) => update("estimated_cost_band", e.target.value)}>
                {COST_BANDS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="deps">Dependencies</label>
          <textarea className="govuk-textarea" id="deps" rows={2} value={form.dependencies} onChange={(e) => update("dependencies", e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="risks">Risks</label>
          <textarea className="govuk-textarea" id="risks" rows={2} value={form.risks} onChange={(e) => update("risks", e.target.value)} />
        </div>

        <button type="submit" className="govuk-button" disabled={saving}>
          {saving ? "Saving…" : "Create project"}
        </button>
      </form>
    </GovukLayout>
  );
}
