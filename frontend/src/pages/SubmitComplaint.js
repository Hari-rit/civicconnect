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

  // ML result states
  const [issueType, setIssueType] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    if (!file || !location.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("area", location);
      formData.append("userId", user.id);

      const response = await axios.post(
        "http://localhost:5000/complaints",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setIssueType(response.data.issueType);
      setConfidence(response.data.confidence);
      setSubmitted(true);
    } catch {
      setError("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-1">
                Submit Civic Complaint
              </h3>
              <p className="text-muted mb-4">
                Upload an image or video and let AI classify the issue
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Left: Form */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Upload Image / Video
                        </label>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="form-control"
                          onChange={handleFileChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Location
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Area / ward / panchayat"
                          required
                        />
                      </div>

                      <button
                        className="btn btn-primary px-4"
                        disabled={loading}
                      >
                        {loading ? "Analyzing..." : "Submit Complaint"}
                      </button>
                    </div>

                    {/* Right: Preview */}
                    <div className="col-md-6">
                      {preview ? (
                        <div className="border rounded p-3 text-center bg-white">
                          <p className="fw-semibold mb-2">
                            Image Preview
                          </p>
                          <img
                            src={preview}
                            alt="preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: "250px" }}
                          />
                        </div>
                      ) : (
                        <div className="border rounded p-4 text-muted text-center">
                          Preview will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              ) : (
                <div className="alert alert-success">
                  <h5 className="fw-bold mb-2">
                    Complaint Submitted Successfully
                  </h5>

                  <p className="mb-2">
                    <strong>Status:</strong> Submitted
                  </p>

                  {issueType && (
                    <div className="mt-3 p-3 border rounded bg-white">
                      <h6 className="fw-bold mb-2">
                        AI Detected Issue
                      </h6>

                      <p className="mb-1">
                        <strong>Issue Type:</strong>{" "}
                        <span className="badge bg-info text-dark">
                          {issueType.replace(/_/g, " ")}
                        </span>
                      </p>

                      {confidence !== null && (
                        <p className="mb-0">
                          <strong>Confidence:</strong>{" "}
                          {(confidence * 100).toFixed(2)}%
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-3 mb-0">
                    Track updates in the <strong>Status</strong> tab.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitComplaint;
