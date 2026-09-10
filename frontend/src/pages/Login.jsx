// src/pages/Login.jsx
// Official sign-in screen. Visuals live here; authentication lives in
// src/services/api.js. Behavior is preserved: a successful sign-in
// continues to the Admin Dashboard. No credentials are hardcoded,
// nothing secret is stored, and errors stay generic.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const identity = email.trim();
    if (!identity || !password) {
      setError("Enter your official email and password to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login({ email: identity, password });
      navigate("/admin");
    } catch (err) {
      console.error("Sign-in failed:", err);
      setError("Sign in failed. Check your details and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-identity">
        <div className="login-identity__crest" aria-hidden="true">◈</div>
        <p className="login-identity__eyebrow">Government of India</p>
        <h1>PAIMANA</h1>
        <p className="login-identity__full">
          Project Assessment, Intelligence, Monitoring &amp; National Analytics
        </p>
        <ul className="login-identity__points">
          <li>National infrastructure project monitoring</li>
          <li>Portfolio status, risk, geography and delivery progress</li>
          <li>Restricted to authorised government users</li>
        </ul>
      </div>
      <div className="login-form">
        <h2>Sign in</h2>
        <p className="meta">Use your official credentials to access the monitoring dashboard.</p>
        {error ? (
          <p className="login-error" role="alert">{error}</p>
        ) : null}
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="login-email">Official email</label>
          <input
            id="login-email"
            className="input login-form__input"
            type="email"
            placeholder="name@gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            disabled={submitting}
          />
          <label className="label" htmlFor="login-password">Password</label>
          <div className="password-row">
            <input
              id="login-password"
              className="input password-row__input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={submitting}
            />
            <button
              type="button"
              className="btn btn--secondary password-row__toggle"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className="btn btn--primary btn--block login-form__submit"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign In →"}
          </button>
        </form>
        <p className="login-form__note">
          Demonstration build — authentication is not connected.
        </p>
      </div>
    </div>
  );
}

export default Login;
