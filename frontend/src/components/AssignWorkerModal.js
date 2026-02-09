import React, { useState } from "react";
import axios from "axios";

function AssignWorkerModal({ complaint, onClose, onAssigned }) {
  const [assigning, setAssigning] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  if (!complaint) return null;

  const workRequests = complaint.workRequests || [];

  const handleAssign = async () => {
    if (!selectedWorkerId) {
      alert("Please select a worker to assign.");
      return;
    }

    try {
      setAssigning(true);

      // 🔗 Backend endpoint
      await axios.put(
        `http://localhost:5000/authority/complaints/${complaint._id}/assign`,
        {
          workerId: selectedWorkerId
        }
      );

      alert("Worker assigned successfully");

      onAssigned(); // refresh parent data
      onClose();    // close modal
    } catch (error) {
      console.error(error);
      alert("Failed to assign worker");
    } finally {
      setAssigning(false);
    }
  };

  return (
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
          width: "720px",
          maxWidth: "95%",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        {/* ================= HEADER ================= */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Assign Worker</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        {/* ================= IMAGE ================= */}
        {complaint.media?.path && (
          <img
            src={`http://localhost:5000${complaint.media.path}`}
            alt="complaint"
            style={{
              width: "100%",
              maxHeight: "40vh",
              objectFit: "contain",
              marginBottom: "12px"
            }}
          />
        )}

        {/* ================= DETAILS ================= */}
        <p>
          <strong>Location:</strong> {complaint.location?.area}
        </p>

        <p>
          <strong>Category:</strong>{" "}
          {complaint.authorityDecision?.category}
        </p>

        <p>
          <strong>Priority:</strong>{" "}
          {complaint.authorityDecision?.priority}
        </p>

        <hr />

        {/* ================= WORKER REQUESTS ================= */}
        <h6 className="mb-2">Workers Requested</h6>

        {workRequests.length === 0 ? (
          <p className="text-muted">
            No workers have requested this complaint yet.
          </p>
        ) : (
          <div className="list-group mb-3">
            {workRequests.map((req, index) => {
              const worker = req.worker;

              return (
                <label
                  key={index}
                  className={`list-group-item d-flex justify-content-between align-items-center ${
                    selectedWorkerId === worker?._id
                      ? "active"
                      : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <input
                      type="radio"
                      name="assignWorker"
                      className="form-check-input me-2"
                      checked={selectedWorkerId === worker?._id}
                      onChange={() =>
                        setSelectedWorkerId(worker?._id)
                      }
                    />

                    <strong>{worker?.name}</strong>
                    <br />

                    <small className="text-muted">
                      {worker?.email}
                    </small>

                    {/* 🔥 SKILLS ADDED (NON-DESTRUCTIVE) */}
                    <div className="mt-1">
                      {worker?.workerSkills &&
                      worker.workerSkills.length > 0 ? (
                        worker.workerSkills.map((skill) => (
                          <span
                            key={skill}
                            className="badge bg-info text-dark me-1"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="badge bg-secondary">
                    {req.status || "Pending"}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* ================= ACTIONS ================= */}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={assigning}
          >
            Cancel
          </button>

          <button
            className="btn btn-success"
            onClick={handleAssign}
            disabled={assigning || !selectedWorkerId}
          >
            {assigning ? "Assigning..." : "Assign Worker"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignWorkerModal;
