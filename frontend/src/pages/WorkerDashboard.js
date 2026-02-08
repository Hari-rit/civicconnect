import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const ALL_SKILLS = [
  "Garbage",
  "Pothole",
  "Water Leakage",
  "Electrical",
  "Road Sign"
];

const WorkerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("skills");

  /* ================= SKILLS ================= */
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsLoaded, setSkillsLoaded] = useState(false);

  /* ================= ASSIGNED WORKS ================= */
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintError, setComplaintError] = useState("");

  const [proofFiles, setProofFiles] = useState({});

  /* ================= LOAD WORKER PROFILE ================= */
  const fetchWorkerProfile = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/worker/profile",
        {
          headers: { "x-user-id": user?.id }
        }
      );

      setSelectedSkills(res.data.workerSkills || []);
      setSkillsLoaded(true);
    } catch {
      console.error("Failed to load worker profile");
    }
  }, [user]);

  /* ================= LOAD ASSIGNED COMPLAINTS ================= */
  const fetchAssignedComplaints = useCallback(async () => {
    try {
      setLoadingComplaints(true);
      setComplaintError("");

      const res = await axios.get(
        "http://localhost:5000/worker/complaints",
        {
          headers: { "x-user-id": user?.id }
        }
      );

      setComplaints(res.data);
    } catch {
      setComplaintError("Failed to load assigned complaints");
    } finally {
      setLoadingComplaints(false);
    }
  }, [user]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchWorkerProfile();
    fetchAssignedComplaints();
  }, [fetchWorkerProfile, fetchAssignedComplaints]);

  /* ================= SAVE SKILLS ================= */
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const saveSkills = async () => {
    if (selectedSkills.length === 0) {
      alert("Select at least one skill");
      return;
    }

    try {
      setSavingSkills(true);
      await axios.put(
        "http://localhost:5000/worker/profile",
        { workerSkills: selectedSkills },
        { headers: { "x-user-id": user?.id } }
      );
      alert("Skills saved successfully");
    } catch {
      alert("Failed to save skills");
    } finally {
      setSavingSkills(false);
    }
  };

  /* ================= UPDATE WORK STATUS ================= */
  const updateStatus = async (id, status) => {
    await axios.put(
      `http://localhost:5000/worker/complaints/${id}/status`,
      { workerStatus: status },
      { headers: { "x-user-id": user?.id } }
    );
    fetchAssignedComplaints();
  };

  /* ================= UPLOAD PROOF ================= */
  const uploadProof = async (id) => {
    const formData = new FormData();
    formData.append("proof", proofFiles[id]);

    await axios.post(
      `http://localhost:5000/worker/complaints/${id}/proof`,
      formData,
      {
        headers: {
          "x-user-id": user?.id,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    fetchAssignedComplaints();
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h3>Worker Dashboard</h3>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            My Skills
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Works
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "available" ? "active" : ""}`}
            onClick={() => setActiveTab("available")}
          >
            Available Works
          </button>
        </li>
      </ul>

      {/* ================= SKILLS TAB ================= */}
      {activeTab === "skills" && skillsLoaded && (
        <div className="card p-3">
          <h5>Select Your Skills</h5>
          {ALL_SKILLS.map((skill) => (
            <div key={skill} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedSkills.includes(skill)}
                onChange={() => toggleSkill(skill)}
              />
              <label className="form-check-label">{skill}</label>
            </div>
          ))}
          <button
            className="btn btn-primary mt-3"
            disabled={savingSkills}
            onClick={saveSkills}
          >
            {savingSkills ? "Saving..." : "Save Skills"}
          </button>
        </div>
      )}

      {/* ================= ASSIGNED WORKS ================= */}
      {activeTab === "assigned" && (
        <>
          {loadingComplaints && <p>Loading assigned complaints...</p>}
          {complaintError && <p className="text-danger">{complaintError}</p>}

          {!loadingComplaints && complaints.length === 0 && (
            <p>No works assigned yet.</p>
          )}

          {complaints.map((c) => (
            <div key={c._id} className="card p-3 mb-3">
              <strong>{c.location.area}</strong>
              <p>Status: {c.workerStatus}</p>

              <select
                className="form-select mb-2"
                value={c.workerStatus}
                onChange={(e) => updateStatus(c._id, e.target.value)}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Work Completed</option>
              </select>

              {c.workerStatus === "Work Completed" && (
                <>
                  <input
                    type="file"
                    className="form-control mb-2"
                    onChange={(e) =>
                      setProofFiles({ ...proofFiles, [c._id]: e.target.files[0] })
                    }
                  />
                  <button
                    className="btn btn-success"
                    onClick={() => uploadProof(c._id)}
                  >
                    Upload Proof
                  </button>
                </>
              )}
            </div>
          ))}
        </>
      )}

      {/* ================= AVAILABLE WORKS ================= */}
      {activeTab === "available" && (
        <div className="alert alert-info">
          Available works listing will appear here once authority publishes requests.
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
