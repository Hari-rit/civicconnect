import React, { useState } from "react";

function AuthorityDashboard() {
  const [status, setStatus] = useState("Submitted");

  return (
    <div style={{ padding: "20px" }}>
      <h2>Authority Dashboard</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Road Damage</td>
            <td>Sample Area</td>
            <td>High</td>
            <td>{status}</td>
            <td>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Submitted</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      {status === "Resolved" && (
        <div style={{ marginTop: "15px" }}>
          <strong>Resolution Remarks:</strong>
          <p>Issue resolved by maintenance team.</p>
        </div>
      )}
    </div>
  );
}

export default AuthorityDashboard;
