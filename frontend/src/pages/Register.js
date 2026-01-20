import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen"
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      navigate(parsedUser.role === "authority" ? "/authority" : "/submit");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/auth/register",
        form
      );
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch {
      setError("User already exists or registration failed");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #f8f9fa, #e9ecef)"
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: "460px", borderRadius: "12px" }}
      >
        <div className="card-body p-4">
          <h3 className="text-center mb-2 fw-bold">
            Create Account
          </h3>
          <p className="text-center text-muted mb-4">
            Join CivicConnect to report and resolve issues
          </p>

          {error && (
            <div className="alert alert-danger text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Role
              </label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="citizen">
                  Citizen
                </option>
                <option value="authority">
                  Authority
                </option>
              </select>
            </div>

            <button className="btn btn-primary w-100 fw-semibold py-2">
              Register
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted">
              Already have an account?
            </span>{" "}
            <Link to="/login" className="fw-semibold">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
