
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const USERS_KEY = "studenthub_demo_users";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();

      if (!name || !email || !form.password) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
      }

      if (form.password.length < 6) {
        setError("Password must contain at least 6 characters.");
        setLoading(false);
        return;
      }

      const savedUsers = JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
      );

      const users = Array.isArray(savedUsers) ? savedUsers : [];

      if (
        users.some(
          (user) => user.email?.trim().toLowerCase() === email
        )
      ) {
        setError("This email is already registered. Please log in.");
        setLoading(false);
        return;
      }

      users.push({
        id: Date.now(),
        name,
        email,
        password: form.password,
      });

      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      setMessage("Account created successfully! Redirecting to Login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Could not create the demo account. Please try again.");
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
          <h1>Create Account</h1>

          <p className="auth-subtitle">
            Join AZIX Campus to manage student records
          </p>
        </div>

        {error && <p role="alert">{error}</p>}

        {message && <p role="status">{message}</p>}

        <form onSubmit={handleRegister}>
          <label htmlFor="register-name">Full Name</label>

          <input
            id="register-name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">Email Address</label>

          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            placeholder="Create a password (minimum 6 characters)"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            autoComplete="new-password"
            minLength={6}
            required
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create AZIX Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>

        <div className="auth-footer">
          © 2026 AZIX Campus · Smarter Campus. Better Management.
        </div>
      </div>
    </div>
  );
}

export default Register;
