import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import WorkerSkillsPopup from "../components/WorkerSkillsPopup";
import WorkerNavbar from "../components/WorkerNavbar";

const WorkerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("assigned");

  /* ================= SKILLS / ONBOARDING ================= */
  const [showSkillsPopup, setShowSkillsPopup] = useState(false);

  /* ================= ASSIGNED WORKS ================= */
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintError, setComplaintError] = useState("");

  /* ================= AVAILABLE WORKS ================= */
  const [availableWorks, setAvailableWorks] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [availableFetched, setAvailableFetched] = useState(false); // 🔑 FIX

  /* ================= LOAD WORKER PROFILE ================= */
  const fetchWorkerProfile = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/worker/profile",
        { headers: { "x-user-id": user?.id } }
      );

      const skills = res.data.workerSkills || [];
      setShowSkillsPopup(skills.length === 0);
    } catch (err) {
      console.error("Failed to load worker profile", err);
    }
  }, [user]);

  /* ================= LOAD ASSIGNED COMPLAINTS ================= */
  const fetchAssignedComplaints = useCallback(async () => {
    try {
      setLoadingComplaints(true);
      setComplaintError("");

      const res = await axios.get(
        `http://localhost:5000/complaints/user/${user?.id}`
      );

      setComplaints(res.data || []);
    } catch {
      setComplaintError("Failed to load assigned complaints");
    } finally {
      setLoadingComplaints(false);
    }
  }, [user]);

  /* ================= LOAD AVAILABLE WORKS (NO FLICKER) ================= */
  const fetchAvailableWorks = useCallback(async () => {
    if (availableFetched) return; // 🔒 prevents re-fetch flicker

    try {
      setLoadingAvailable(true);

      const res = await axios.get(
        "http://localhost:5000/complaints/available"
      );

      setAvailableWorks(res.data || []);
      setAvailableFetched(true); // 🔒 lock it
    } catch (err) {
      console.error("Failed to load available works", err);
    } finally {
      setLoadingAvailable(false);
    }
  }, [availableFetched]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchWorkerProfile();
    fetchAssignedComplaints();
  }, [fetchWorkerProfile, fetchAssignedComplaints]);

  /* ================= TAB-BASED FETCH ================= */
  useEffect(() => {
    if (activeTab === "available") {
      fetchAvailableWorks();
    }
  }, [activeTab, fetchAvailableWorks]);

  /* ================= UPDATE WORK STATUS ================= */
  const updateStatus = async (id, statusName) => {
    try {
      await axios.put(
        `http://localhost:5000/complaints/${id}/status`,
        { statusName }
      );
      fetchAssignedComplaints();
    } catch {
      alert("Failed to update work status");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h3>Worker Dashboard</h3>

      {/* 🔒 Skills onboarding popup */}
      {showSkillsPopup && (
        <WorkerSkillsPopup
          userId={user.id}
          onSaved={() => {
            setShowSkillsPopup(false);
            setActiveTab("assigned");
            fetchWorkerProfile();
          }}
        />
      )}

      <WorkerNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
              <strong>{c.location?.area}</strong>
              <p>Status: {c.status?.statusName}</p>

              <select
                className="form-select mb-2"
                value={c.status?.statusName}
                onChange={(e) =>
                  updateStatus(c._id, e.target.value)
                }
              >
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          ))}
        </>
      )}

      {/* ================= AVAILABLE WORKS ================= */}
      {activeTab === "available" && (
        <>
          {loadingAvailable && availableWorks.length === 0 && (
            <p>Loading available works...</p>
          )}

          {!loadingAvailable && availableWorks.length === 0 && (
            <p>No available works right now.</p>
          )}

          {availableWorks.map((c) => (
            <div key={c._id} className="card p-3 mb-3">
              <strong>{c.location?.area}</strong>
              <p>Category: {c.authorityDecision?.category}</p>
              <p>Priority: {c.authorityDecision?.priority}</p>
              <p>Status: {c.status?.statusName}</p>

              <button className="btn btn-outline-primary" disabled>
                Request Work (next)
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default WorkerDashboard;
