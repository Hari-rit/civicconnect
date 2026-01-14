import React from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitComplaint from "./pages/SubmitComplaint";
import ComplaintStatus from "./pages/ComplaintStatus";
import AuthorityDashboard from "./pages/AuthorityDashboard";

// Helper: get logged-in user
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Protected Route component
const ProtectedRoute = ({ children, role }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
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
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <Link className="navbar-brand" to="/">
          CivicConnect
        </Link>

        {/* LEFT LINKS */}
        {user && user.role === "citizen" && (
          <div className="navbar-nav">
            <Link className="nav-link" to="/submit">
              Submit
            </Link>
            <Link className="nav-link" to="/status">
              Status
            </Link>
          </div>
        )}

        {user && user.role === "authority" && (
          <div className="navbar-nav">
            <Link className="nav-link" to="/authority">
              Authority
            </Link>
          </div>
        )}

        {/* RIGHT LINKS */}
        <div className="ms-auto navbar-nav">
          {!user ? (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register">
                Register
              </Link>
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

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen routes */}
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

        {/* Authority route */}
        <Route
          path="/authority"
          element={
            <ProtectedRoute role="authority">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
