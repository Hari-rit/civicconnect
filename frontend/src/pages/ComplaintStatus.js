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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");


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
      } catch {
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
  if (status === "Rejected") return "danger";
  if (status === "Duplicate") return "dark"; 
  return "secondary";
};
const submitFeedback = async () => {

  if (!rating) {
    alert("Please select a rating");
    return;
  }

  try {

    await axios.post(
      `http://localhost:5000/complaints/${selectedComplaint._id}/feedback`,
      {
        rating,
        comment
      }
    );

    alert("Feedback submitted successfully");

    setRating(0);
    setComment("");

    setSelectedComplaint(null);

    window.location.reload();

  } catch (err) {

    alert("Failed to submit feedback");

  }

};
  if (loading) {
    return (
      <div className="container mt-4 alert alert-info">
        Loading complaints...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 alert alert-danger">{error}</div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="container mt-4 alert alert-warning">
        No complaints found.
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
                  alt="complaint"
                  style={{
                    height: "180px",
                    width: "100%",
                    objectFit: "cover"
                  }}
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
                {c.status?.statusName === "Duplicate" && (
  <div className="alert alert-warning mt-2 p-2 small">
    ⚠ This issue has already been reported and is being handled.
  </div>
)}
              </div>

              <div className="card-footer bg-white border-0 text-muted small">
                <div>
                  Submitted on{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
                {c.updatedAt !== c.createdAt && (
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
          style={{
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            overflowY: "auto"   // ✅ SCROLL ENABLED
          }}
          onClick={() => setSelectedComplaint(null)}
        >
          <div className="d-flex justify-content-center align-items-start py-5">
            <div
              className="card shadow-lg border-0"
              style={{
                width: "100%",
                maxWidth: "720px",
                maxHeight: "90vh",
                overflowY: "auto"   // ✅ SCROLL INSIDE CARD
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="fw-bold">Complaint Details</h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedComplaint(null)}
                  />
                </div>

                {selectedComplaint.media?.type === "image" && (
                  <img
                    src={`http://localhost:5000${selectedComplaint.media.path}`}
                    alt="complaint"
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      cursor: "zoom-in"
                    }}
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
                    style={{ width: "100%", maxHeight: "300px" }}
                  />
                )}

                <hr />

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
                {selectedComplaint.status?.statusName === "Duplicate" && (
  <div className="alert alert-warning mt-2">
    ⚠ This issue has already been reported.
    <br />
    You have been linked to the existing complaint.
  </div>
)}

                <p className="text-muted mb-1">
                  <strong>Submitted:</strong>{" "}
                  {new Date(
                    selectedComplaint.createdAt
                  ).toLocaleString()}
                </p>

                {selectedComplaint.updatedAt !==
                  selectedComplaint.createdAt && (
                    
                  <p className="text-muted">
                    <strong>Last updated:</strong>{" "}
                    {new Date(
                      selectedComplaint.updatedAt
                    ).toLocaleString()}
                  </p>
                )}
                {/* ================= FEEDBACK SECTION ================= */}

{selectedComplaint.status?.statusName === "Resolved" &&
 !selectedComplaint.feedback?.rating && (

<div className="mt-4">

<hr />

<h6 className="fw-bold">Rate Resolution</h6>

<div className="mb-2">

{[1,2,3,4,5].map((star) => (
<span
key={star}
style={{
fontSize: "22px",
cursor: "pointer",
color: star <= rating ? "#ffc107" : "#ccc"
}}
onClick={() => setRating(star)}
>
★
</span>
))}

</div>

<textarea
className="form-control mb-2"
placeholder="Write your feedback..."
value={comment}
onChange={(e) => setComment(e.target.value)}
/>

<button
className="btn btn-primary btn-sm"
onClick={submitFeedback}
>
Submit Feedback
</button>

</div>

)}
{selectedComplaint.feedback?.rating && (

<div className="alert alert-success mt-3">

<strong>Your Feedback</strong>

<br/>

Rating: {"⭐".repeat(selectedComplaint.feedback.rating)}

{selectedComplaint.feedback.comment && (
<p className="mb-0">
{selectedComplaint.feedback.comment}
</p>
)}

</div>

)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MEDIA ZOOM ================= */}
      {zoomMedia && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0,0,0,0.85)",
            zIndex: 3000
          }}
          onClick={() => setZoomMedia(null)}
        >
          <div className="d-flex justify-content-center align-items-center h-100">
            <img
              src={zoomMedia}
              alt="zoom"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintStatus;
