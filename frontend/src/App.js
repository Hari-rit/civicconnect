import React from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";

/* =======================
   PAGES
   ======================= */
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitComplaint from "./pages/SubmitComplaint";
import ComplaintStatus from "./pages/ComplaintStatus";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerManagement from "./pages/WorkerManagement";

/* =======================
   Helper: get logged user
   ======================= */
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/* =======================
   Protected Route
   ======================= */
const ProtectedRoute = ({ children, role }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* =======================
   Role Redirect (root)
   ======================= */
const RoleRedirect = () => {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "citizen") return <Navigate to="/submit" replace />;
  if (user.role === "authority") return <Navigate to="/authority" replace />;
  if (user.role === "worker") return <Navigate to="/worker" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <Link className="navbar-brand" to="/">
          CivicConnect
        </Link>

        {/* LEFT NAV */}
        {user?.role === "citizen" && (
          <div className="navbar-nav">
            <Link className="nav-link" to="/submit">Submit</Link>
            <Link className="nav-link" to="/status">Status</Link>
          </div>
        )}

        {user?.role === "authority" && (
          <div className="navbar-nav">
            <Link className="nav-link" to="/authority">
              Dashboard
            </Link>
            <Link className="nav-link" to="/authority/workers">
              Workers
            </Link>
          </div>
        )}

        {user?.role === "worker" && (
          <div className="navbar-nav">
            <Link className="nav-link" to="/worker">
              Worker Dashboard
            </Link>
          </div>
        )}

        {/* RIGHT NAV */}
        <div className="ms-auto navbar-nav">
          {!user ? (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          ) : (
            <>
              <span className="navbar-text text-light me-3">
                {user.name} ({user.role})
              </span>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ================= ROUTES ================= */}
      <Routes>
        {/* Root */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Auth */}
        <Route
          path="/login"
          element={user ? <RoleRedirect /> : <Login />}
        />
        <Route path="/register" element={<Register />} />

        {/* Citizen */}
        <Route
          path="/submit"
          element={
            <ProtectedRoute role="citizen">
              <SubmitComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status"
          element={
            <ProtectedRoute role="citizen">
              <ComplaintStatus />
            </ProtectedRoute>
          }
        />

        {/* Authority */}
        <Route
          path="/authority"
          element={
            <ProtectedRoute role="authority">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authority/workers"
          element={
            <ProtectedRoute role="authority">
              <WorkerManagement />
            </ProtectedRoute>
          }
        />

        {/* Worker */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute role="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
