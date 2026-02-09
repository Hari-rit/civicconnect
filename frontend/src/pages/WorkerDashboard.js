import React, {
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import axios from "axios";
import WorkerSkillsPopup from "../components/WorkerSkillsPopup";
import WorkerNavbar from "../components/WorkerNavbar";

const WorkerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("assigned");

  /* ================= SKILLS / ONBOARDING ================= */
  const [showSkillsPopup, setShowSkillsPopup] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false); // 🔑 NEW
  const [skillsLocked, setSkillsLocked] = useState(false);   // 🔑 NEW

  /* ================= ASSIGNED WORKS ================= */
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [assignedFetched, setAssignedFetched] = useState(false);

  // 🔒 StrictMode guard
  const assignedFetchOnce = useRef(false);

  /* ================= AVAILABLE WORKS ================= */
  const [availableWorks, setAvailableWorks] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const availableFetchOnce = useRef(false);

  const [requestingId, setRequestingId] = useState(null);

  /* ================= LOAD WORKER PROFILE ================= */
  const fetchWorkerProfile = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/worker/profile",
        { headers: { "x-user-id": user?.id } }
      );

      const skills = Array.isArray(res.data.workerSkills)
        ? res.data.workerSkills
        : [];

      const completed =
        res.data.skillsCompleted === true ||
        skills.length > 0;

      if (!completed && !skillsLocked) {
        setShowSkillsPopup(true);
      } else {
        setShowSkillsPopup(false);
      }

      setProfileLoaded(true);
    } catch (err) {
      console.error("Failed to load worker profile", err);
    }
  }, [user, skillsLocked]);

  /* ================= LOAD ASSIGNED WORKS ================= */
  const fetchAssignedComplaints = useCallback(async () => {
    if (assignedFetchOnce.current) return;
    assignedFetchOnce.current = true;

    try {
      setLoadingComplaints(true);

      const res = await axios.get(
        `http://localhost:5000/complaints/user/${user?.id}`
      );

      setComplaints(res.data || []);
      setAssignedFetched(true);
    } catch (err) {
      console.error("Failed to load assigned complaints", err);
    } finally {
      setLoadingComplaints(false);
    }
  }, [user]);

  /* ================= LOAD AVAILABLE WORKS ================= */
  const fetchAvailableWorks = useCallback(async () => {
    if (availableFetchOnce.current) return;
    availableFetchOnce.current = true;

    try {
      setLoadingAvailable(true);

      const res = await axios.get(
        "http://localhost:5000/complaints/available"
      );

      const filtered = (res.data || []).filter(
        (c) =>
          c.status?.statusName === "Submitted" &&
          c.authorityDecision?.verified === true
      );

      setAvailableWorks(filtered);
    } catch (err) {
      console.error("Failed to load available works", err);
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

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

  /* ================= REQUEST WORK ================= */
  const requestWork = async (complaintId) => {
    try {
      setRequestingId(complaintId);

      await axios.post(
        `http://localhost:5000/complaints/${complaintId}/request`,
        { workerId: user.id }
      );

      setAvailableWorks((prev) =>
        prev.filter((c) => c._id !== complaintId)
      );

      alert("Work request sent to authority");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to request work"
      );
    } finally {
      setRequestingId(null);
    }
  };

  /* ================= UPDATE WORK STATUS ================= */
  const updateStatus = async (id, statusName) => {
    try {
      await axios.put(
        `http://localhost:5000/complaints/${id}/status`,
        { statusName }
      );

      assignedFetchOnce.current = false;
      setAssignedFetched(false);
      fetchAssignedComplaints();
    } catch {
      alert("Failed to update work status");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-4">
      <h3>Worker Dashboard</h3>

      {/* 🔒 SKILL POPUP (FIXED) */}
      {profileLoaded && showSkillsPopup && (
        <WorkerSkillsPopup
          userId={user.id}
          onSaved={() => {
            setSkillsLocked(true);     // 🔒 lock forever
            setShowSkillsPopup(false);
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
          {loadingComplaints && (
            <p>Loading assigned complaints...</p>
          )}

          {!loadingComplaints &&
            assignedFetched &&
            complaints.length === 0 && (
              <p>No works assigned yet.</p>
            )}

          {complaints.map((c) => (
            <div key={c._id} className="card p-3 mb-3">
              <strong className="text-capitalize">
                {c.location?.area}
              </strong>
              <p>Status: {c.status?.statusName}</p>

              <select
                className="form-select"
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
          {loadingAvailable && (
            <p>Loading available works...</p>
          )}

          {!loadingAvailable &&
            availableWorks.length === 0 && (
              <p>No available works right now.</p>
            )}

          {availableWorks.map((c) => (
            <div key={c._id} className="card mb-4 shadow-sm">
              {c.media?.path && (
                <img
                  src={`http://localhost:5000${c.media.path}`}
                  alt="complaint"
                  className="card-img-top"
                  style={{
                    maxHeight: "220px",
                    objectFit: "cover"
                  }}
                />
              )}

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 text-capitalize">
                    {c.location?.area}
                  </h5>
                  <span className="badge bg-dark">
                    {c.status?.statusName}
                  </span>
                </div>

                <p className="mb-1">
                  <strong>Category:</strong>{" "}
                  {c.authorityDecision?.category}
                </p>

                <p className="mb-1">
                  <strong>Priority:</strong>{" "}
                  {c.authorityDecision?.priority}
                </p>

                <p className="text-muted">
                  Submitted on{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>

                <button
                  className={`btn ${
                    requestingId === c._id
                      ? "btn-secondary"
                      : "btn-outline-primary"
                  } w-100`}
                  disabled={requestingId === c._id}
                  onClick={() => requestWork(c._id)}
                >
                  {requestingId === c._id
                    ? "Requesting..."
                    : "Request Work"}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default WorkerDashboard;
