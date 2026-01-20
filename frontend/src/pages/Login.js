import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
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
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        form
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(
        res.data.user.role === "authority" ? "/authority" : "/submit"
      );
    } catch {
      setError("Invalid email or password");
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
        style={{ width: "420px", borderRadius: "12px" }}
      >
        <div className="card-body p-4">
          <h3 className="text-center fw-bold mb-1">
            Welcome Back
          </h3>
          <p className="text-center text-muted mb-4">
            Login to submit and track civic issues
          </p>

          {error && (
            <div className="alert alert-danger text-center py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                placeholder="you@example.com"
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
                placeholder="••••••••"
                required
              />
            </div>

            <button className="btn btn-success w-100 fw-semibold py-2">
              Login
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted">New user?</span>{" "}
            <Link to="/register" className="fw-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
