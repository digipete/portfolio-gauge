import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GovukLayout } from "@/components/govuk/GovukLayout";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate("/projects");
      }
    }
    setLoading(false);
  }

  return (
    <GovukLayout>
      <div style={{ maxWidth: "500px" }}>
        <h1 className="govuk-heading-xl">{isSignUp ? "Create an account" : "Sign in"}</h1>

        {error && (
          <div className="govuk-error-summary" data-module="govuk-error-summary">
            <div role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  <li>{error}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="govuk-panel govuk-panel--confirmation">
            <h2 className="govuk-panel__title">{message}</h2>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="email">Email address</label>
            <input
              className="govuk-input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="password">Password</label>
            <input
              className="govuk-input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button type="submit" className="govuk-button" disabled={loading}>
            {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="govuk-body">
          <a
            href="#"
            className="govuk-link"
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
          >
            {isSignUp ? "Already have an account? Sign in" : "No account? Create one"}
          </a>
        </p>
      </div>
    </GovukLayout>
  );
}
