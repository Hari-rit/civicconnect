import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ComplaintStatus() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    // 🔐 Session check
    if (!user || !user.id) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    // 📡 Fetch complaints for this user
    axios
      .get(`http://localhost:5000/complaints/${user.id}`)
      .then((res) => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load complaints");
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">My Complaint Status</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {complaints.length === 0 ? (
        <div className="alert alert-warning">
          You have not submitted any complaints yet.
        </div>
      ) : (
        complaints.map((complaint) => (
          <div key={complaint._id} className="card shadow p-3 mb-3">
            <p>
              <strong>Image:</strong> {complaint.imageName}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {complaint.location?.area || "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-primary">
                {complaint.status?.statusName}
              </span>
            </p>
            <p>
              <strong>Category:</strong> {complaint.category}
            </p>
            <p>
              <strong>Priority:</strong> {complaint.priority}
            </p>

            {/* Citizen is READ-ONLY */}
            <div className="alert alert-info mb-0">
              Status updates will be performed by the concerned authority.
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ComplaintStatus;
