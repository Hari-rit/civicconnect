import React, { useEffect, useState } from "react";
import axios from "axios";

function ComplaintStatus() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id || storedUser?._id;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [zoomMedia, setZoomMedia] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        if (!userId) {
          setError("User not logged in");
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/complaints/user/${userId}`
        );
        setComplaints(res.data);
      } catch (err) {
        setError("Failed to load complaint status");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userId]);

  const getStatusBadge = (status) => {
    if (status === "Submitted") return "secondary";
    if (status === "In Progress") return "warning";
    if (status === "Resolved") return "success";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">Loading complaints...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">No complaints found.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">My Complaints</h3>

      {/* ================= CARD GRID ================= */}
      <div className="row g-4">
        {complaints.map((c, index) => (
          <div className="col-md-6 col-lg-4" key={c._id}>
            <div
              className="card h-100 shadow-sm border-0"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedComplaint(c)}
            >
              {c.media?.type === "image" && (
                <img
                  src={`http://localhost:5000${c.media.path}`}
                  className="card-img-top"
                  alt="complaint"
                  style={{ height: "180px", objectFit: "cover" }}
                />
              )}

              <div className="card-body">
                <h6 className="fw-bold mb-2">
                  Complaint #{index + 1}
                </h6>

                <p className="mb-1">
                  <strong>Location:</strong>{" "}
                  {c.location?.area || "N/A"}
                </p>

                <span
                  className={`badge bg-${getStatusBadge(
                    c.status?.statusName
                  )}`}
                >
                  {c.status?.statusName}
                </span>
              </div>

              <div className="card-footer bg-white border-0 text-muted small">
                <div>
                  Submitted on{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>

                {c.updatedAt && c.updatedAt !== c.createdAt && (
                  <div>
                    Last updated{" "}
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {selectedComplaint && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 2000 }}
          onClick={() => setSelectedComplaint(null)}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <div
              className="card shadow-lg border-0"
              style={{ maxWidth: "700px", width: "95%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Complaint Details</h5>

                {selectedComplaint.media?.type === "image" && (
                  <img
                    src={`http://localhost:5000${selectedComplaint.media.path}`}
                    alt="complaint"
                    className="img-fluid rounded mb-3"
                    style={{ cursor: "zoom-in" }}
                    onClick={() =>
                      setZoomMedia(
                        `http://localhost:5000${selectedComplaint.media.path}`
                      )
                    }
                  />
                )}

                {selectedComplaint.media?.type === "video" && (
                  <video
                    src={`http://localhost:5000${selectedComplaint.media.path}`}
                    controls
                    className="w-100 mb-3"
                  />
                )}

                <p>
                  <strong>Location:</strong>{" "}
                  {selectedComplaint.location?.area}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge bg-${getStatusBadge(
                      selectedComplaint.status?.statusName
                    )}`}
                  >
                    {selectedComplaint.status?.statusName}
                  </span>
                </p>

                <p className="text-muted mb-1">
                  <strong>Submitted:</strong>{" "}
                  {new Date(
                    selectedComplaint.createdAt
                  ).toLocaleString()}
                </p>

                {selectedComplaint.updatedAt &&
                  selectedComplaint.updatedAt !==
                    selectedComplaint.createdAt && (
                    <p className="text-muted">
                      <strong>Last updated:</strong>{" "}
                      {new Date(
                        selectedComplaint.updatedAt
                      ).toLocaleString()}
                    </p>
                  )}

                <div className="text-end">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MEDIA ZOOM ================= */}
      {zoomMedia && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 3000 }}
          onClick={() => setZoomMedia(null)}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <img
              src={zoomMedia}
              alt="zoom"
              className="img-fluid rounded"
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintStatus;
