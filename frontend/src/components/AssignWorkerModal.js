import React, { useEffect, useState } from "react";
import axios from "axios";

function AssignWorkerModal({ complaint, onClose, onAssigned }) {
  const [assigning, setAssigning] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  // Approved workers for direct assign
  const [availableWorkers, setAvailableWorkers] = useState([]);

  const workRequests = complaint?.workRequests || [];

  /* ======================================================
     FETCH APPROVED WORKERS (DIRECT ASSIGN)
     - ONLY when no worker has requested
     - USE SAME AUTH HEADER AS REST OF APP
  ====================================================== */
  useEffect(() => {
    if (!complaint) return;

    if (workRequests.length === 0) {
      fetchApprovedWorkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint]);

  const fetchApprovedWorkers = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser || storedUser.role !== "authority") {
        console.error("Not authorized to fetch workers");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/authority/workers/approved",
        {
          headers: {
            "x-user-id": storedUser.id   // ✅ FIX
          }
        }
      );

      setAvailableWorkers(res.data);
    } catch (error) {
      console.error("Failed to fetch approved workers", error);
      setAvailableWorkers([]);
    }
  };

  /* ======================================================
     ASSIGN HANDLER
  ====================================================== */
  const handleAssign = async () => {
    if (!selectedWorkerId) {
      alert("Please select a worker to assign.");
      return;
    }

    try {
      setAssigning(true);

      const storedUser = JSON.parse(localStorage.getItem("user"));

      await axios.put(
        `http://localhost:5000/authority/complaints/${complaint._id}/assign`,
        { workerId: selectedWorkerId },
        {
          headers: {
            "x-user-id": storedUser.id   // ✅ FIX
          }
        }
      );

      alert("Worker assigned successfully");
      onAssigned();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to assign worker");
    } finally {
      setAssigning(false);
    }
  };

  /* ======================================================
     SAFE EXIT
  ====================================================== */
  if (!complaint) return null;

  /* ======================================================
     WORKERS TO DISPLAY
  ====================================================== */
  const workersToShow =
    workRequests.length > 0
      ? workRequests.map((r) => r.worker)
      : availableWorkers;

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
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Assign Worker</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

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

        <p><strong>Location:</strong> {complaint.location?.area}</p>
        <p><strong>Category:</strong> {complaint.authorityDecision?.category}</p>
        <p><strong>Priority:</strong> {complaint.authorityDecision?.priority}</p>

        <hr />

        <h6 className="mb-2">
          {workRequests.length > 0 ? "Workers Requested" : "Available Workers"}
        </h6>

        {workersToShow.length === 0 ? (
          <p className="text-muted">No workers available.</p>
        ) : (
          <div className="list-group mb-3">
            {workersToShow.map((worker) => (
              <label
                key={worker._id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  selectedWorkerId === worker._id ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <input
                    type="radio"
                    className="form-check-input me-2"
                    checked={selectedWorkerId === worker._id}
                    onChange={() => setSelectedWorkerId(worker._id)}
                  />

                  <strong>{worker.name}</strong><br />
                  <small className="text-muted">{worker.email}</small>

                  <div className="mt-1">
                    {worker.workerSkills?.length > 0 ? (
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
                  {workRequests.length > 0 ? "Requested" : "Direct Assign"}
                </span>
              </label>
            ))}
          </div>
        )}

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
