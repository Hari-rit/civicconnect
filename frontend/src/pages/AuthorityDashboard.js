import React, { useEffect, useState } from "react";
import axios from "axios";
import AssignWorkerModal from "../components/AssignWorkerModal";

const ITEMS_PER_PAGE = 5;

function AuthorityDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [reviewComplaint, setReviewComplaint] = useState(null);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [zoomMedia, setZoomMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignComplaint, setAssignComplaint] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= API ACTIONS ================= */

const handleVerify = async () => {
  await axios.put(
    `http://localhost:5000/complaints/${reviewComplaint._id}/verify`,
    {
      category: reviewComplaint.authorityDecision.category,
      priority: reviewComplaint.authorityDecision.priority,
      statusName: reviewComplaint.status.statusName 
    }
  );

  fetchComplaints();
  setReviewComplaint(null);
};




  const handleStatusUpdate = async () => {
    await axios.put(
      `http://localhost:5000/complaints/${reviewComplaint._id}/status`,
      { statusName: reviewComplaint.status.statusName }
    );

    fetchComplaints();
    setReviewComplaint(null);
  };


  /* ================= HELPERS ================= */

  const priorityBadge = (p) =>
    p === "High" ? "danger" : p === "Medium" ? "warning" : "success";

  const statusBadge = (s) =>
    s === "Resolved"
      ? "success"
      : s === "In Progress"
      ? "warning"
      : "secondary";

  /* ================= ANALYTICS ================= */

  const total = complaints.length;
  const submitted = complaints.filter(
    (c) => c.status.statusName === "Submitted"
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status.statusName === "In Progress"
  ).length;
  const resolved = complaints.filter(
    (c) => c.status.statusName === "Resolved"
  ).length;
  const verifiedCount = complaints.filter(
    (c) => c.authorityDecision?.verified
  ).length;

  /* ================= FILTERING ================= */

  const filtered = complaints.filter((c) => {
    const statusOk =
      statusFilter === "All" ||
      c.status.statusName === statusFilter;

    const categoryOk =
      categoryFilter === "All" ||
      c.authorityDecision?.category === categoryFilter;

    return statusOk && categoryOk;
  });
  /* ================= MAP HELPER (Swiggy-style fallback) ================= */
const openInMaps = (complaint) => {
  const lat = complaint?.location?.latitude;
  const lon = complaint?.location?.longitude;
  const area = complaint?.location?.area;

  // Case 1: Exact GPS available → open pin
  if (lat && lon) {
    window.open(
      `https://www.google.com/maps?q=${lat},${lon}`,
      "_blank"
    );
    return;
  }

  // Case 2: GPS missing but area available → area search (Swiggy/Zomato style)
  if (area && area !== "Not provided") {
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(area)}`,
      "_blank"
    );
    return;
  }

  // Case 3: Nothing available
  alert("Location information not available for this complaint.");
};

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="container mt-4 alert alert-info">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">Authority Dashboard</h3>


      {/* ================= ANALYTICS ================= */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total", value: total },
          { label: "Submitted", value: submitted },
          { label: "In Progress", value: inProgress },
          { label: "Resolved", value: resolved },
          { label: "Verified", value: verifiedCount }
        ].map((item, i) => (
          <div className="col-md-2" key={i}>
            <div className="card shadow-sm text-center">
              <div className="card-body">
                <h6 className="text-muted">{item.label}</h6>
                <h4 className="fw-bold">{item.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= FILTERS ================= */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>Submitted</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>Pothole</option>
            <option>Garbage</option>
            <option>Water Leakage</option>
            <option>Electrical</option>
            <option>Road Sign</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Media</th>
              <th>Location</th>
              <th>AI</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((c, i) => (
              <tr key={c._id}>
                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>

                <td>
                  <img
                    src={`http://localhost:5000${c.media.path}`}
                    alt="thumb"
                    width="60"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setZoomMedia(`http://localhost:5000${c.media.path}`)
                    }
                  />
                </td>
                    
 <td>
  <strong>{c.location.area}</strong>

  {c.location?.landmark && (
    <>
      <br />
      <small className="text-muted">
        Landmark: {c.location.landmark}
      </small>
    </>
  )}
</td>



                <td>
                  <span className="badge bg-info text-dark">
                    {c.aiPrediction?.issueType || "N/A"}
                  </span>
                </td>

                <td>
                  <span className={`badge bg-${statusBadge(c.status.statusName)}`}>
                    {c.status.statusName}
                  </span>
                </td>

                <td>
                  {c.authorityDecision?.priority && (
                    <span
                      className={`badge bg-${priorityBadge(
                        c.authorityDecision.priority
                      )}`}
                    >
                      {c.authorityDecision.priority}
                    </span>
                  )}
                </td>

                <td>
                  {c.authorityDecision?.verified ? (
                    <span className="badge bg-success">Verified</span>
                  ) : (
                    <span className="badge bg-secondary">Pending</span>
                  )}
                </td>

                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setViewComplaint(c)}
                    >
                      View
                    </button>
                    <button className="btn btn-sm btn-outline-success"title="Open in Google Maps"onClick={() => openInMaps(c)}>Map📍</button>
                    {c.status?.statusName === "Submitted" && (
  <button
    className="btn btn-sm btn-warning"
    onClick={() => setAssignComplaint(c)}
  >
    Assign
  </button>
)}



                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                       setReviewComplaint({
  ...c,
  authorityDecision: {
    category: c.authorityDecision?.category || "Pothole",
    priority: c.authorityDecision?.priority || "Medium",
    verified: c.authorityDecision?.verified || false
  },
  status: {
    statusName: c.status?.statusName || "Submitted"
  }
})
                      }
                    >
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="d-flex justify-content-center gap-3 mt-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span className="align-self-center">
          Page {page} of {totalPages}
        </span>

        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
{/* ================= VIEW MODAL ================= */}
{viewComplaint && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100"
    style={{
      background: "rgba(0,0,0,0.6)",
      zIndex: 1050,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <div
      className="card p-3"
      style={{
        width: "720px",
        maxWidth: "95%",
        height: "90vh",
        overflowY: "auto"
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Complaint Details</h5>
        <button
          className="btn-close"
          onClick={() => setViewComplaint(null)}
        />
      </div>

      <img
        src={`http://localhost:5000${viewComplaint.media.path}`}
        alt="complaint"
        style={{
          width: "100%",
          maxHeight: "40vh",
          objectFit: "contain",
          marginBottom: "12px"
        }}
      />

      <p>
        <strong>Location:</strong> {viewComplaint.location.area}
      </p>

      <button
        className="btn btn-outline-primary w-100 mb-3"
        onClick={() => openInMaps(viewComplaint)}
      >
        View Location on Map
      </button>

      <p>
        <strong>Status:</strong> {viewComplaint.status.statusName}
      </p>

      <p>
        <strong>AI:</strong> {viewComplaint.aiPrediction?.issueType}
      </p>

      {viewComplaint.assignedWorker && (
        <>
          <hr />
          <h6 className="fw-bold">Assigned Worker</h6>

          <p className="mb-1">
            <strong>Name:</strong> {viewComplaint.assignedWorker.name}
          </p>

          <p className="mb-1">
            <strong>Email:</strong> {viewComplaint.assignedWorker.email}
          </p>

          <div className="mt-1">
            <strong>Skills:</strong>{" "}
            {viewComplaint.assignedWorker.workerSkills?.length > 0 ? (
              viewComplaint.assignedWorker.workerSkills.map((skill) => (
                <span
                  key={skill}
                  className="badge bg-info text-dark me-1"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-muted">No skills listed</span>
            )}
          </div>
          <div className="mt-2">
  <strong>Worker Status:</strong>{" "}
  {viewComplaint.workerStatus ? (
    <span
      className={`badge ms-1 ${
        viewComplaint.workerStatus === "Work Completed"
          ? "bg-success"
          : viewComplaint.workerStatus === "In Progress"
          ? "bg-warning text-dark"
          : "bg-secondary"
      }`}
    >
      {viewComplaint.workerStatus}
    </span>
  ) : (
    <span className="text-muted">Not Assigned</span>
  )}
</div>

        </>
      )}

      <button
        className="btn btn-secondary w-100 mt-3"
        onClick={() => setViewComplaint(null)}
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* ================= REVIEW MODAL ================= */}
{reviewComplaint && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100"
    style={{ background: "rgba(0,0,0,0.6)", zIndex: 1050 }}
  >
    <div className="d-flex justify-content-center align-items-center h-100">
      <div
        className="card d-flex flex-column"
        style={{
          width: "720px",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div className="d-flex justify-content-between mb-3">
          <h5>Review Complaint</h5>
          <button
            className="btn-close"
            onClick={() => setReviewComplaint(null)}
          />
        </div>

        <img
          src={`http://localhost:5000${reviewComplaint.media.path}`}
          alt="complaint"
          className="img-fluid rounded mb-3"
          style={{
            maxHeight: "45vh",
            objectFit: "contain"
          }}
        />

        {reviewComplaint.assignedWorker && (
          <>
            <hr />
            <h6 className="fw-bold">Assigned Worker</h6>

            <p className="mb-1">
              <strong>Name:</strong> {reviewComplaint.assignedWorker.name}
            </p>

            <p className="mb-1">
              <strong>Email:</strong> {reviewComplaint.assignedWorker.email}
            </p>

            <div className="mt-1">
              <strong>Skills:</strong>{" "}
              {reviewComplaint.assignedWorker.workerSkills?.length > 0 ? (
                reviewComplaint.assignedWorker.workerSkills.map((skill) => (
                  <span
                    key={skill}
                    className="badge bg-info text-dark me-1"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-muted">No skills listed</span>
              )}
            </div>
            <div className="mt-2">
  <strong>Worker Status:</strong>{" "}
  {reviewComplaint.workerStatus ? (
    <span
      className={`badge ms-1 ${
        reviewComplaint.workerStatus === "Work Completed"
          ? "bg-success"
          : reviewComplaint.workerStatus === "In Progress"
          ? "bg-warning text-dark"
          : "bg-secondary"
      }`}
    >
      {reviewComplaint.workerStatus}
    </span>
  ) : (
    <span className="text-muted">Not Assigned</span>
  )}
</div>

          </>
        )}

{/* ================= WORKER PROOF ================= */}
{reviewComplaint.workerProofImage ? (
  <div className="mt-3">
    <h6>Worker Completion Proof</h6>
    <img
      src={`http://localhost:5000/${reviewComplaint.workerProofImage}`}
      alt="Worker Proof"
      className="rounded w-100"
      style={{
        maxHeight: "500px",
        objectFit: "cover"
      }}
    />
  </div>
) : (
  <p className="text-muted mt-3">
    No completion proof uploaded by worker.
  </p>
)}



              {!reviewComplaint.authorityDecision.verified && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={reviewComplaint.authorityDecision.category}
                      onChange={(e) =>
                        setReviewComplaint({
                          ...reviewComplaint,
                          authorityDecision: {
                            ...reviewComplaint.authorityDecision,
                            category: e.target.value
                          }
                        })
                      }
                    >
                      <option>Pothole</option>
                      <option>Garbage</option>
                      <option>Water Leakage</option>
                      <option>Electrical</option>
                      <option>Road Sign</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={reviewComplaint.authorityDecision.priority}
                      onChange={(e) =>
                        setReviewComplaint({
                          ...reviewComplaint,
                          authorityDecision: {
                            ...reviewComplaint.authorityDecision,
                            priority: e.target.value
                          }
                        })
                      }
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={reviewComplaint.status.statusName}
                  onChange={(e) =>
                    setReviewComplaint({
                      ...reviewComplaint,
                      status: { statusName: e.target.value }
                    })
                  }
                >
                  <option>Submitted</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>

              <div className="d-flex gap-2 mt-4">
<button
  className="btn btn-secondary btn-sm"
  style={{ minWidth: "120px", height: "36px" }}
  onClick={() => setReviewComplaint(null)}
>
  Cancel
</button>

{!reviewComplaint.authorityDecision.verified && (
  <button
    className="btn btn-primary btn-sm"
    style={{ minWidth: "160px", height: "36px" }}
    onClick={handleVerify}
  >
    Verify Complaint
  </button>
)}

<button
  className="btn btn-outline-primary btn-sm"
  style={{ minWidth: "160px", height: "36px" }}
  onClick={handleStatusUpdate}
>
  Update Status
</button>



</div>

            </div>
          </div>
        </div>
      )}

{/* ================= ZOOM (FIXED SIZE) ================= */}
{zoomMedia && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100"
    style={{
      background: "rgba(0,0,0,0.6)",
      zIndex: 2000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <div
      className="card p-3"
      style={{
        width: "600px",
        maxWidth: "95%",
        maxHeight: "80vh",
        overflow: "auto"
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Media Preview</h6>
        <button
          className="btn-close"
          onClick={() => setZoomMedia(null)}
        />
      </div>

      {/* Image */}
      <img
        src={zoomMedia}
        alt="zoom"
        style={{
          width: "100%",
          maxHeight: "65vh",
          objectFit: "contain"
        }}
      />
    </div>
  </div>
)}
{/* ================= ASSIGN WORKER MODAL ================= */}
{assignComplaint && (
  <AssignWorkerModal
    complaint={assignComplaint}
    onClose={() => setAssignComplaint(null)}
    onAssigned={() => {
      fetchComplaints();
      setAssignComplaint(null);
    }}
  />
)}


    </div>
  );
}

export default AuthorityDashboard;
