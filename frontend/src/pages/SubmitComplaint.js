import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubmitComplaint() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    if (selected.type.startsWith("image")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file || !location.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("area", location);
      formData.append("userId", user.id);

      await axios.post(
        "http://localhost:5000/complaints",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit complaint");
    }
  };

  if (!user) return null;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="mb-3">Submit Civic Complaint</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                <strong>Upload Image / Video *</strong>
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                className="form-control"
                onChange={handleFileChange}
                required
              />
            </div>

            {preview && (
              <div className="mb-3">
                <img
                  src={preview}
                  alt="preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "250px" }}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                <strong>Location *</strong>
              </label>
              <input
                type="text"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter area / ward / panchayat"
                required
              />
            </div>

            <button className="btn btn-primary">
              Submit Complaint
            </button>
          </form>
        ) : (
          <div className="alert alert-success">
            <h5>Complaint Submitted Successfully</h5>
            <p>Status: Submitted</p>
            <p>Track updates in Status tab.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitComplaint;
