import React from "react";

function ComplaintStatus() {
  // For now, static data (will be DB-driven later)
  const complaint = {
    issue: "Road Damage",
    location: "Sample Area",
    status: "Submitted"
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="mb-3">Complaint Status</h3>

        <div className="mb-3">
          <p>
            <strong>Issue:</strong> {complaint.issue}
          </p>
          <p>
            <strong>Location:</strong> {complaint.location}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-primary">{complaint.status}</span>
          </p>
        </div>

        {/* Citizen is READ-ONLY */}
        <div className="alert alert-info">
          You can track the progress of your complaint here.  
          Status updates will be performed by the concerned authority.
        </div>
      </div>
    </div>
  );
}

export default ComplaintStatus;
