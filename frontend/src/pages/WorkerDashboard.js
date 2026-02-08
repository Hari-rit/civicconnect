import React, { useEffect, useState } from "react";
import axios from "axios";

const WorkerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logged-in user details (stored during login)
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAssignedComplaints();
    // eslint-disable-next-line
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/worker/complaints",
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      setComplaints(response.data);
      setLoading(false);
    } catch (err) {
      setError("Unable to fetch assigned complaints.");
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/worker/complaints/${complaintId}/status`,
        { workerStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      fetchAssignedComplaints();
    } catch (err) {
      alert("Failed to update work status.");
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading assigned complaints...</div>;
  }

  if (error) {
    return <div className="container mt-4 text-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Worker Dashboard</h3>

      {complaints.length === 0 ? (
        <p>No complaints have been assigned to you yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Complaint Image</th>
                <th>Location / Landmark</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Work Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td style={{ width: "160px" }}>
                    <img
                      src={`http://localhost:5000/${complaint.media.path}`}
                      alt="Complaint"
                      style={{
                        width: "150px",
                        height: "100px",
                        objectFit: "cover"
                      }}
                    />
                  </td>

                  <td>
                    <div>
                      <strong>Landmark:</strong>{" "}
                      {complaint.location.landmark || "Not provided"}
                    </div>
                    <div>
                      <strong>Address:</strong>{" "}
                      {complaint.location.address || "Not available"}
                    </div>
                  </td>

                  <td>
                    {complaint.authorityDecision?.category || "Pending"}
                  </td>

                  <td>
                    {complaint.authorityDecision?.priority || "Pending"}
                  </td>

                  <td>{complaint.workerStatus}</td>

                  <td>
                    <select
                      className="form-select"
                      value={complaint.workerStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          complaint._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Work Completed">Work Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
