import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as exifr from "exifr";

function SubmitComplaint() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState(""); // ✅ NEW
  const [locationMsg, setLocationMsg] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Coordinates sent to backend
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser.id) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  /* ======================================
     FILE CHANGE → LOCATION PRIORITY
     1) EXIF GPS (photo location)
     2) Browser GPS (fallback)
  ====================================== */
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setLocation("");
    setLandmark("");
    setLocationMsg("");
    setLatitude(null);
    setLongitude(null);

    if (selected.type.startsWith("image")) {
      setPreview(URL.createObjectURL(selected));

      let exifUsed = false;

      /* ---------- 1️⃣ EXIF GPS ---------- */
      try {
        const gps = await exifr.gps(selected);

        if (gps?.latitude && gps?.longitude) {
          exifUsed = true;
          setLatitude(gps.latitude);
          setLongitude(gps.longitude);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${gps.latitude}&lon=${gps.longitude}&format=json`,
              { headers: { "User-Agent": "CivicConnect/1.0" } }
            );

            const data = await res.json();
            if (data?.address) {
              const addr = data.address;

              const area =
                addr.suburb ||
                addr.neighbourhood ||
                addr.village ||
                addr.town ||
                addr.city_district;

              const city =
                addr.city ||
                addr.county ||
                addr.state_district;

              const state = addr.state;

              setLocation(
                [area, city, state].filter(Boolean).join(", ")
              );
              setLocationMsg("📷 Location detected from photo metadata");
            }
          } catch {
            setLocationMsg("📷 Photo location detected (address unavailable)");
          }
        }
      } catch {
        // ignore EXIF errors
      }

      /* ---------- 2️⃣ DEVICE GPS ---------- */
      if (!exifUsed && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            setLatitude(pos.coords.latitude);
            setLongitude(pos.coords.longitude);

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
                { headers: { "User-Agent": "CivicConnect/1.0" } }
              );

              const data = await res.json();
              if (data?.address) {
                const addr = data.address;

                const area =
                  addr.suburb ||
                  addr.neighbourhood ||
                  addr.village ||
                  addr.town ||
                  addr.city_district;

                const city =
                  addr.city ||
                  addr.county ||
                  addr.state_district;

                const state = addr.state;

                setLocation(
                  [area, city, state].filter(Boolean).join(", ")
                );
              }
            } catch {}

            setLocationMsg(
              "📍 Using your current device location. Edit if different."
            );
          },
          () => {
            setLocationMsg(
              "⚠️ Location not detected. Please enter manually."
            );
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } else {
      setPreview(null);
      setLocationMsg(
        "⚠️ Location cannot be extracted from videos. Please enter manually."
      );
    }
  };

  /* ======================================
     SUBMIT COMPLAINT
  ====================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!file) {
      setError("Please upload an image or video");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("area", location || "");
      formData.append("landmark", landmark || ""); // ✅ NEW
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("userId", user.id);

      await axios.post(
        "http://localhost:5000/complaints",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSubmitted(true);
    } catch (err) {
      console.error(err);
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
              <h3 className="fw-bold mb-1">Submit Civic Complaint</h3>
              <p className="text-muted mb-4">Upload an image or video</p>

              {error && <div className="alert alert-danger">{error}</div>}

              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
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

                      <div className="mb-2">
                        <label className="form-label fw-semibold">
                          Location
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Area / ward / panchayat"
                        />
                        {locationMsg && (
                          <small className="text-muted">{locationMsg}</small>
                        )}
                      </div>

                      {/* ✅ LANDMARK FIELD */}
                      <div className="mb-2">
                        <label className="form-label fw-semibold">
                          Landmark (optional)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="Near temple / school / junction"
                        />
                      </div>

                      <button
                        className="btn btn-primary px-4 mt-3"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit Complaint"}
                      </button>
                    </div>

                    <div className="col-md-6">
                      {preview ? (
                        <div className="border rounded p-3 text-center bg-white">
                          <p className="fw-semibold mb-2">Image Preview</p>
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
                  <p className="mb-0">
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
