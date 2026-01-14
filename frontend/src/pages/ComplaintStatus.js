import React, { useEffect, useState } from "react";
import axios from "axios";

function ComplaintStatus() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id || storedUser?._id;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">Loading complaints...</div>
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (complaints.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          No complaints found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">My Complaint Status</h3>

      {complaints.map((c, index) => (
        <div className="card shadow-sm mb-4" key={c._id}>
          <div className="card-body">
            <h5 className="mb-3">Complaint #{index + 1}</h5>

            {/* ================= MEDIA ================= */}
            {c.media ? (
              <div className="mb-3">
                {c.media.type === "image" ? (
                  <>
                    <img
                      src={`http://localhost:5000${c.media.path}`}
                      alt="complaint"
                      className="img-thumbnail"
                      style={{
                        maxWidth: "250px",
                        cursor: "zoom-in"
                      }}
                      onClick={() =>
                        setZoomMedia(
                          `http://localhost:5000${c.media.path}`
                        )
                      }
                    />

                    <div className="mt-2">
                      <a
                        href={`http://localhost:5000${c.media.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Open in New Tab
                      </a>
                    </div>
                  </>
                ) : (
                  <video
                    src={`http://localhost:5000${c.media.path}`}
                    controls
                    className="w-100"
                  />
                )}
              </div>
            ) : (
              <div className="alert alert-secondary">
                No media available
              </div>
            )}

            <p><strong>Location:</strong> {c.location?.area || "N/A"}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge bg-${getStatusBadge(
                  c.status?.statusName
                )}`}
              >
                {c.status?.statusName}
              </span>
            </p>

            <p><strong>Category:</strong> Pending</p>
            <p><strong>Priority:</strong> Pending</p>

            <hr />

            <p className="text-muted mb-1">
              <strong>Submitted:</strong>{" "}
              {new Date(c.createdAt).toLocaleString()}
            </p>
            <p className="text-muted">
              <strong>Last Updated:</strong>{" "}
              {new Date(c.updatedAt).toLocaleString()}
            </p>

            <div className="alert alert-info mt-3 mb-0">
              Status updates are handled by the concerned authority.
            </div>
          </div>
        </div>
      ))}

      {/* ================= MEDIA ZOOM OVERLAY ================= */}
      {zoomMedia && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0,0,0,0.85)",
            zIndex: 2000
          }}
          onClick={() => setZoomMedia(null)}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <img
              src={zoomMedia}
              alt="zoom"
              className="img-fluid rounded"
              style={{
                maxWidth: "90%",
                maxHeight: "90%"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintStatus;
