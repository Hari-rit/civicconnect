import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function WorkerManagement() {
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= FETCH PENDING WORKERS ================= */
  const fetchPendingWorkers = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/authority/workers/pending",
        {
          headers: {
            "x-user-id": user?.id
          }
        }
      );
      setPendingWorkers(res.data);
    } catch (err) {
      console.error("Failed to fetch workers");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingWorkers();
  }, [fetchPendingWorkers]);

  /* ================= APPROVE / REJECT ================= */
  const updateApproval = async (workerId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/authority/workers/${workerId}/approval`,
        { status },
        {
          headers: {
            "x-user-id": user?.id
          }
        }
      );
      fetchPendingWorkers();
    } catch (err) {
      alert("Failed to update worker status");
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading workers...</div>;
  }

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Pending Worker Registrations</h4>

      {pendingWorkers.length === 0 ? (
        <p className="text-muted">No pending workers.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingWorkers.map((w) => (
              <tr key={w._id}>
                <td>{w.name}</td>
                <td>{w.email}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => updateApproval(w._id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => updateApproval(w._id, "Rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WorkerManagement;
