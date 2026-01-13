import React, { useState } from "react";
import axios from "axios";

function SubmitComplaint() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!image || !location) {
      setError("Please upload an image and enter location");
      return;
    }

    try {
      await axios.post("http://localhost:5000/complaints", {
        userId: user.id,
        imageName: image.name,
        location: {
          area: location
        }
      });

      // ✅ Mark that user has submitted a complaint
      localStorage.setItem("hasComplaint", "true");

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit complaint. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="mb-3">Submit Civic Complaint</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="mb-3">
              <label className="form-label">
                <strong>Upload Issue Image *</strong>
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="mb-3">
                <p className="mb-1">Image Preview:</p>
                <img
                  src={preview}
                  alt="preview"
                  className="img-thumbnail"
                  style={{ maxWidth: "250px" }}
                />
              </div>
            )}

            {/* Location Input */}
            <div className="mb-3">
              <label className="form-label">
                <strong>Location *</strong>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter area / ward / panchayat"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <small className="text-muted">
                If location is not detected automatically from image metadata,
                please enter it manually.
              </small>
            </div>

            <button className="btn btn-primary">
              Submit Complaint
            </button>
          </form>
        ) : (
          <div className="alert alert-success">
            <h5>Complaint Submitted Successfully</h5>
            <p><strong>Status:</strong> Submitted</p>
            <p><strong>Location:</strong> {location}</p>
            <p>
              You can now track the complaint status from the <strong>Status</strong> tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitComplaint;
