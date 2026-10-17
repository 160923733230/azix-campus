
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const USERS_KEY = "studenthub_demo_users";
const SESSION_KEY = "studenthub_demo_session";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
      );

      const users = Array.isArray(savedUsers) ? savedUsers : [];
      const enteredEmail = email.trim().toLowerCase();

      const user = users.find(
        (item) =>
          item.email?.trim().toLowerCase() === enteredEmail &&
          item.password === password
      );

      if (!user) {
        setError(
          "Account not found or password is incorrect. Please register first."
        );
        setLoading(false);
        return;
      }

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new Event("auth-change"));

      navigate("/students", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to log in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <div className="auth-brand">
          <div className="auth-brand-icon">AX</div>

          <div className="auth-brand-name">
            AZIX <span>CAMPUS</span>
          </div>

          <p>STUDENT MANAGEMENT SYSTEM</p>
        </div>

        <div className="auth-heading">
          <h1>Welcome Back!</h1>
          <p className="auth-subtitle">
            Sign in to your AZIX Campus account
          </p>
        </div>

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="login-email">Email Address</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In to AZIX Campus"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>

        <div className="auth-footer">
          © 2026 AZIX Campus · Smarter Campus. Better Management.
        </div>
      </div>
    </div>
  );
}

export default Login;
