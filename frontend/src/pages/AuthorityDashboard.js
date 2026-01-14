import React, { useEffect, useState } from "react";
import axios from "axios";

function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [zoomMedia, setZoomMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/complaints");
      setComplaints(res.data);
    } catch {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, statusName) => {
    await axios.put(
      `http://localhost:5000/complaints/${id}/status`,
      { statusName }
    );
    fetchComplaints();
  };

  const badge = (s) =>
    s === "Resolved" ? "success" : s === "In Progress" ? "warning" : "secondary";

  if (loading)
    return <div className="container mt-4 alert alert-info">Loading…</div>;

  if (!complaints.length)
    return (
      <div className="container mt-4 alert alert-warning">
        No complaints submitted yet
      </div>
    );

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Authority Dashboard</h3>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Media</th>
              <th>Location</th>
              <th>Citizen</th>
              <th>Status</th>
              <th>Update</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((c, i) => (
              <tr key={c._id}>
                <td>{i + 1}</td>

                {/* THUMBNAIL WITH HOVER */}
                <td>
                  {c.media?.type === "image" ? (
                    <img
                      src={`http://localhost:5000${c.media.path}`}
                      alt="thumb"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "transform 0.2s"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.6)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onClick={() =>
                        setZoomMedia(
                          `http://localhost:5000${c.media.path}`
                        )
                      }
                    />
                  ) : (
                    <span className="text-muted">Video</span>
                  )}
                </td>

                <td>{c.location?.area}</td>

                <td>
                  {c.userId?.name}
                  <br />
                  <small className="text-muted">{c.userId?.email}</small>
                </td>

                <td>
                  <span className={`badge bg-${badge(c.status.statusName)}`}>
                    {c.status.statusName}
                  </span>
                </td>

                <td>
                  <select
                    className="form-select"
                    value={c.status.statusName}
                    onChange={(e) =>
                      handleStatusChange(c._id, e.target.value)
                    }
                  >
                    <option>Submitted</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </td>

                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedComplaint(c)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {selectedComplaint && (
        <div className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="card p-4" style={{ width: "700px" }}>
              <div className="d-flex justify-content-between mb-2">
                <h5>Complaint Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedComplaint(null)}
                />
              </div>

              <img
                src={`http://localhost:5000${selectedComplaint.media.path}`}
                className="img-fluid mb-3 rounded"
                alt="full"
                style={{ cursor: "zoom-in" }}
                onClick={() =>
                  setZoomMedia(
                    `http://localhost:5000${selectedComplaint.media.path}`
                  )
                }
              />

              <a
                href={`http://localhost:5000${selectedComplaint.media.path}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary btn-sm mb-3"
              >
                Open in New Tab
              </a>

              <p><strong>Location:</strong> {selectedComplaint.location.area}</p>
              <p><strong>Status:</strong> {selectedComplaint.status.statusName}</p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(selectedComplaint.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= ZOOM OVERLAY ================= */}
      {zoomMedia && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.9)", zIndex: 2000 }}
          onClick={() => setZoomMedia(null)}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <img
              src={zoomMedia}
              alt="zoom"
              className="img-fluid rounded"
              style={{ maxHeight: "90%", maxWidth: "90%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorityDashboard;
