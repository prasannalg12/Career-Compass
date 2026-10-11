
import { useState } from "react";
import { api, setToken } from "../api.js";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  function updateField(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function switchMode() {
    setMode(isLogin ? "register" : "login");
    setError("");
    setShowPassword(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/auth/login"
        : "/auth/register";

      const payload = isLogin
        ? {
            email: form.email.trim(),
            password: form.password
          }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password
          };

      const data = await api(endpoint, {
        method: "POST",
        body: payload
      });

      if (!data.token || !data.user) {
        throw new Error("Invalid authentication response.");
      }

      setToken(data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cc-auth-page">
      <div className="cc-auth-layout">

        <section className="cc-auth-brand">
          <div className="cc-auth-logo">
            <span className="cc-logo-icon">✦</span>
            <span>CareerCompass</span>
          </div>

          <div className="cc-auth-intro">
            <span className="cc-auth-eyebrow">
              YOUR CAREER. YOUR DIRECTION.
            </span>

            <h1>
              Your future starts
              <br />
              with a <em>direction.</em>
            </h1>

            <p>
              Discover career opportunities, understand
              your strengths, and follow a personalized
              roadmap that grows with you.
            </p>

            <div className="cc-auth-benefits">
              <div>✓ Explore career opportunities</div>
              <div>✓ Discover your skill gaps</div>
              <div>✓ Follow personalized roadmaps</div>
              <div>✓ Track your learning progress</div>
            </div>
          </div>

          <div className="cc-auth-brand-footer">
            Explore. Learn. Grow.
          </div>
        </section>

        <section className="cc-auth-form-side">
          <div className="cc-auth-form-box">

            <div className="cc-auth-heading">
              <span className="cc-auth-welcome">
                {isLogin
                  ? "WELCOME BACK"
                  : "START YOUR JOURNEY"}
              </span>

              <h2>
                {isLogin
                  ? "Sign in to CareerCompass"
                  : "Create your account"}
              </h2>

              <p>
                {isLogin
                  ? "Continue building your career journey."
                  : "Create your profile and explore career possibilities."}
              </p>
            </div>

            <form onSubmit={submit} className="cc-auth-form">

              {!isLogin && (
                <label>
                  Full name
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={updateField}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <div className="cc-password-field">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={updateField}
                    autoComplete={
                      isLogin
                        ? "current-password"
                        : "new-password"
                    }
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="cc-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {!isLogin && (
                <p className="cc-password-hint">
                  Use at least 8 characters.
                </p>
              )}

              {error && (
                <div className="cc-auth-error" role="alert">
                  {error}
                </div>
              )}

              <button
                className="cc-auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign in →"
                  : "Create account →"}
              </button>
            </form>

            <div className="cc-auth-switch">
              <span>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>

              <button type="button" onClick={switchMode}>
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>

            <p className="cc-auth-note">
              Build your future, one skill at a time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
