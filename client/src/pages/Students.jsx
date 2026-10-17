
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Students.css";

const STUDENTS_KEY = "studenthub_demo_students";
const SESSION_KEY = "studenthub_demo_session";

const SAMPLE_STUDENTS = [
  { id: 1, rollNumber: "STU001", name: "Aarav Sharma", email: "aarav@example.com", course: "CSE" },
  { id: 2, rollNumber: "STU002", name: "Priya Reddy", email: "priya@example.com", course: "IT" },
  { id: 3, rollNumber: "STU003", name: "Rahul Verma", email: "rahul@example.com", course: "ECE" },
  { id: 4, rollNumber: "STU004", name: "Sneha Khan", email: "sneha@example.com", course: "CSE" },
  { id: 5, rollNumber: "STU005", name: "Arjun Patel", email: "arjun@example.com", course: "EEE" },
];

function readStudents() {
  try {
    const saved = localStorage.getItem(STUDENTS_KEY);

    if (saved === null) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(SAMPLE_STUDENTS));
      return SAMPLE_STUDENTS;
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : SAMPLE_STUDENTS;
  } catch {
    return SAMPLE_STUDENTS;
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function Students() {
  const navigate = useNavigate();

  const [session] = useState(readSession);
  const [students, setStudents] = useState(readStudents);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "CSE",
  });

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
    }
  }, [session, navigate]);

  function saveStudents(updated) {
    setStudents(updated);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("auth-change"));
    navigate("/", { replace: true });
  }

  function openAddForm() {
    setForm({ name: "", email: "", course: "CSE" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(student) {
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
    });

    setEditingId(student.id);
    setError("");
    setShowForm(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.course) {
      setError("Please fill in all fields.");
      return;
    }

    const duplicate = students.some(
      (student) =>
        student.email.toLowerCase() === email &&
        student.id !== editingId
    );

    if (duplicate) {
      setError("A student with this email already exists.");
      return;
    }

    if (editingId !== null) {
      const updated = students.map((student) =>
        student.id === editingId
          ? { ...student, name, email, course: form.course }
          : student
      );

      saveStudents(updated);
    } else {
      const nextNumber =
        students.reduce((max, student) => {
          const number = Number(
            String(student.rollNumber || "").replace("STU", "")
          );

          return Number.isFinite(number) ? Math.max(max, number) : max;
        }, 0) + 1;

      const newStudent = {
        id: Date.now(),
        rollNumber: `STU${String(nextNumber).padStart(3, "0")}`,
        name,
        email,
        course: form.course,
      };

      saveStudents([...students, newStudent]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", email: "", course: "CSE" });
  }

  function deleteStudent(id) {
    const student = students.find((item) => item.id === id);
    if (!student) return;

    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      saveStudents(students.filter((item) => item.id !== id));
    }
  }

  const courses = useMemo(
    () => ["All", ...new Set(students.map((student) => student.course))],
    [students]
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.rollNumber.toLowerCase().includes(term);

      const matchesCourse =
        courseFilter === "All" || student.course === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [students, search, courseFilter]);

  if (!session) return null;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand">
          <span className="brand-icon">AX</span>
          <span className="brand-name">
            AZIX <span className="brand-accent">CAMPUS</span>
          </span>
        </Link>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link">
            <span>⌂</span> Home
          </Link>

          <a href="#dashboard" className="sidebar-link active">
            <span>▦</span> Dashboard
          </a>

          <a href="#student-records" className="sidebar-link">
            <span>♙</span> Students
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">AX</div>
            <strong>AZIX Campus</strong>
            <p>Manage your student records with ease.</p>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
          >
            <span>↪</span> Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main" id="dashboard">
        <header className="dashboard-topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Student Dashboard</h1>
          </div>

          <div className="profile-area">
            <div className="profile-avatar">
              {(session.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>{session.name || "AZIX Campus User"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        {/* Centered welcome banner without the star */}
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-eyebrow">YOUR WORKSPACE</span>

            <h2>
              Welcome back, {(session.name || "User").split(" ")[0]}!
            </h2>

            <p>Here’s an overview of your student records.</p>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon stat-indigo">♙</div>
            <p>Total Students</p>
            <h3>{students.length}</h3>
            <span className="stat-caption">Records in your workspace</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-blue">▤</div>
            <p>Courses</p>
            <h3>{new Set(students.map((student) => student.course)).size}</h3>
            <span className="stat-caption">Unique courses represented</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon stat-green">✓</div>
            <p>Filtered Results</p>
            <h3>{filteredStudents.length}</h3>
            <span className="stat-caption">Matching current filters</span>
          </article>
        </section>

        <section className="records-card" id="student-records">
          <div className="records-heading">
            <div>
              <h2>Student Records</h2>
              <p>View, search and manage student information.</p>
            </div>

            <button
              type="button"
              className="add-student-button"
              onClick={openAddForm}
            >
              <span>＋</span> Add Student
            </button>
          </div>

          <div className="table-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search name, email or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search students"
              />
            </div>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              aria-label="Filter by course"
              className="course-filter"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course === "All" ? "All Courses" : course}
                </option>
              ))}
            </select>
          </div>

          <div className="table-scroll">
            <table className="students-table">
              <thead>
                <tr>
                  <th>ROLL NUMBER</th>
                  <th>STUDENT</th>
                  <th>EMAIL ADDRESS</th>
                  <th>COURSE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className="roll-badge">{student.rollNumber}</span>
                    </td>

                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>

                    <td className="student-email">{student.email}</td>

                    <td>
                      <span className="course-badge">{student.course}</span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="edit-action"
                          onClick={() => openEditForm(student)}
                          aria-label={`Edit ${student.name}`}
                          title="Edit student"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-action"
                          onClick={() => deleteStudent(student.id)}
                          aria-label={`Delete ${student.name}`}
                          title="Delete student"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <div>⌕</div>
                      <strong>No students found</strong>
                      <p>Try another search or add a new student.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            <strong>{students.length}</strong> students
          </div>
        </section>

        <footer className="dashboard-footer">
          © 2026 AZIX CAMPUS <span>•</span> Student Management System
          <p>Smarter Campus. Better Management.</p>
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <section
            className="student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-form-title"
          >
            <div className="modal-heading">
              <div>
                <span className="modal-eyebrow">STUDENT DETAILS</span>
                <h2 id="student-form-title">
                  {editingId !== null ? "Edit Student" : "Add New Student"}
                </h2>
                <p>Enter the student information below.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="student-form">
              <label htmlFor="student-name">Full Name</label>
              <input
                id="student-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
                required
                autoFocus
              />

              <label htmlFor="student-email">Email Address</label>
              <input
                id="student-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@example.com"
                required
              />

              <label htmlFor="student-course">Course</label>
              <select
                id="student-course"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                required
              >
                {["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AI & DS"].map(
                  (course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  )
                )}
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-student-button">
                  {editingId !== null ? "Save Changes" : "Add Student"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Students;
