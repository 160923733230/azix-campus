
import { useState, useEffect } from "react";
import {
  Link,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Students from "./pages/Students.jsx";
import "./App.css";

const SESSION_KEY = "studenthub_demo_session";

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function ProtectedRoute() {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Students />;
}

function Home() {
  const [session, setSession] = useState(getSession);
  const navigate = useNavigate();

  useEffect(() => {
    function updateSession() {
      setSession(getSession());
    }

    window.addEventListener("storage", updateSession);
    window.addEventListener("auth-change", updateSession);

    return () => {
      window.removeEventListener("storage", updateSession);
      window.removeEventListener("auth-change", updateSession);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSession(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/", { replace: true });
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="home-brand">
          <span className="home-brand-icon">AX</span>

          <span className="home-brand-text">
            AZIX <span>CAMPUS</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/login">Login</Link>

          <Link to="/register" className="nav-button">
            Register
          </Link>

          {session && (
            <button
              type="button"
              onClick={handleLogout}
              className="secondary-button"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <p className="tagline">STUDENT MANAGEMENT SYSTEM</p>

          <h1>
            Manage Students.
            <br />
            <span>Simplify Campus.</span>
          </h1>

          <p className="description">
            Manage student information in one place.
            Add, view, update and delete student records
            with a simple and professional interface.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                if (getSession()) {
                  navigate("/students");
                } else {
                  navigate("/login");
                }
              }}
            >
              Manage Students →
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>

          <div className="features">
            <div>
              <h3>Students</h3>
              <p>Student Records</p>
            </div>

            <div>
              <h3>Academic</h3>
              <p>Organized Information</p>
            </div>

            <div>
              <h3>Efficient</h3>
              <p>Easy Management</p>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-header">
            <div>
              <p className="card-label">AZIX CAMPUS PORTAL</p>
              <h2>Welcome!</h2>
            </div>

            <div className="icon-box">🎓</div>
          </div>

          <div className="student-illustration">
            <div className="illustration-circle">🎓</div>

            <h3>Your Campus, One Place</h3>

            <p>Simple. Organized. Efficient.</p>
          </div>

          <div className="card-footer">
            <span>AZIX Campus</span>
            <span className="status-dot">● Ready</span>
          </div>
        </div>
      </main>

      <footer>
        © 2026 AZIX Campus | Student Management Portal
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/students" element={<ProtectedRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
