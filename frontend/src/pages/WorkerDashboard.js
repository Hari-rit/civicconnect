import "./WorkerDashboard.css";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import axios from "axios";
import WorkerSkillsPopup from "../components/WorkerSkillsPopup";
import WorkerNavbar from "../components/WorkerNavbar";

const API = "http://localhost:5000/worker";

const WorkerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= GLOBAL UI STATE ================= */
  const [activeTab, setActiveTab] = useState("assigned");
  const [selectedProof, setSelectedProof] = useState(null);
  const [uploadingProofId, setUploadingProofId] = useState(null);

  // ✅ Image modal state (FIXED – inside component)
  const [selectedImage, setSelectedImage] = useState(null);

  /* ================= SKILLS / ONBOARDING ================= */
  const [showSkillsPopup, setShowSkillsPopup] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [skillsLocked, setSkillsLocked] = useState(false);

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
        `${API}/profile`,
        { headers: { Authorization: `Bearer ${user?.id}` } }
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
        `${API}/complaints`,
        { headers: { Authorization: `Bearer ${user?.id}` } }
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
        `${API}/available-complaints`,
        { headers: { Authorization: `Bearer ${user?.id}` } }
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
  }, [user]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchWorkerProfile();
    fetchAssignedComplaints();
  }, [fetchWorkerProfile, fetchAssignedComplaints]);

  /* ================= TAB CHANGE ================= */
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
        `${API}/complaints/${complaintId}/request`,
        {},
        { headers: { Authorization: `Bearer ${user?.id}` } }
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
  const updateStatus = async (id, workerStatus) => {
    try {
      await axios.put(
        `${API}/complaints/${id}/status`,
        { workerStatus },
        { headers: { Authorization: `Bearer ${user?.id}` } }
      );

      assignedFetchOnce.current = false;
      setAssignedFetched(false);
      fetchAssignedComplaints();
    } catch {
      alert("Failed to update work status");
    }
  };
  /* ================= work proof upload ================= */
const uploadProof = async (complaintId) => {
  if (!selectedProof) {
    alert("Please select an image first");
    return;
  }

  try {
    setUploadingProofId(complaintId);

    const formData = new FormData();
    formData.append("proof", selectedProof);

    await axios.post(
      `${API}/complaints/${complaintId}/proof`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${user?.id}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("Proof uploaded successfully");

    setSelectedProof(null);
    assignedFetchOnce.current = false;
    fetchAssignedComplaints();
  } catch (err) {
    alert(err.response?.data?.message || "Upload failed");
  } finally {
    setUploadingProofId(null);
  }
};

  /* ================= UI ================= */
  return (
    <div className="container mt-4 worker-dashboard">
      <h3>Worker Dashboard</h3>

      {/* 🔒 SKILLS POPUP */}
      {profileLoaded && showSkillsPopup && (
        <WorkerSkillsPopup
          userId={user.id}
          onSaved={() => {
            setSkillsLocked(true);
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
            <div key={c._id} className="worker-card">

              {/* ===== IMAGE PREVIEW (SMALL) ===== */}
              {c.media?.path && (
                <div
                  className="image-preview"
                  onClick={() =>
                    setSelectedImage(
                      `http://localhost:5000${c.media.path}`
                    )
                  }
                >
                  <img
                    src={`http://localhost:5000${c.media.path}`}
                    alt="complaint"
                  />
                  <span className="view-text">
                    Click to view
                  </span>
                </div>
              )}

              {/* ===== HEADER ===== */}
              <div className="worker-card-header">
                <h5 className="area-title">
                  {c.location?.area || "Unknown Area"}
                </h5>

                <span
                  className={`status-badge ${c.workerStatus
                    .replace(" ", "-")
                    .toLowerCase()}`}
                >
                  {c.workerStatus}
                </span>
              </div>

              {/* ===== DETAILS ===== */}
              <div className="worker-details">
               <p>
  <strong>Category:</strong>{" "}
  {c.authorityDecision?.verified
    ? c.authorityDecision.category
    : c.issueType || "N/A"}
</p>

<p>
  <strong>Priority:</strong>{" "}
  {c.authorityDecision?.verified
    ? c.authorityDecision.priority
    : c.priority || "N/A"}
</p>

                {c.location?.address && (
                  <p>
                    <strong>Address:</strong>{" "}
                    {c.location.address}
                  </p>
                )}
              </div>

              {/* ===== MAP ===== */}
              {c.location?.latitude &&
                c.location?.longitude && (
                  <div className="map-container">
                    <iframe
                      title="location-map"
                      width="100%"
                      height="200"
                      style={{
                        borderRadius: "12px",
                        border: "none"
                      }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${c.location.latitude},${c.location.longitude}&z=15&output=embed`}
                    />
                  </div>
                )}

              {/* ===== STATUS UPDATE ===== */}
              <div className="worker-card-body">
                <p className="label">
                  Update Work Status
                </p>

                <select
                  className="form-select status-select"
                  value={c.workerStatus}
                  onChange={(e) =>
                    updateStatus(c._id, e.target.value)
                  }
                >
                  <option value="Not Started">
                    Not Started
                  </option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Work Completed">
                    Work Completed
                  </option>
                </select>
              </div>
              {/* ===== PROOF UPLOAD SECTION ===== */}
{c.workerStatus === "Work Completed" && (
  <div className="proof-section">

    {c.workerProofImage ? (
      <div className="proof-preview">
        <p className="proof-label">Proof Uploaded</p>

        <div
          className="proof-image-wrapper"
          onClick={() =>
            setSelectedImage(
              `http://localhost:5000/${c.workerProofImage}`
            )
          }
        >
          <img
            src={`http://localhost:5000/${c.workerProofImage}`}
            alt="proof"
            className="proof-image"
          />
          <span className="view-text">Click to view</span>
        </div>
      </div>
    ) : (
      <>
        <p className="proof-label">Upload Work Proof</p>

        <div
          className="proof-upload-box"
          onClick={() =>
            document.getElementById(
              `proof-input-${c._id}`
            ).click()
          }
        >
          {selectedProof ? (
            <img
              src={URL.createObjectURL(selectedProof)}
              alt="preview"
              className="proof-image"
            />
          ) : (
            <span>Click to select image</span>
          )}
        </div>

        <input
          type="file"
          id={`proof-input-${c._id}`}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) =>
            setSelectedProof(e.target.files[0])
          }
        />

        {selectedProof && (
          <button
            className="btn btn-success w-100 mt-2"
            disabled={uploadingProofId === c._id}
            onClick={() => uploadProof(c._id)}
          >
            {uploadingProofId === c._id
              ? "Uploading..."
              : "Upload Proof"}
          </button>
        )}
      </>
    )}
  </div>
)}

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
            <div
              key={c._id}
              className="card mb-4 shadow-sm"
            >
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
  {c.issueType}
</p>

<p className="mb-1">
  <strong>Priority:</strong>{" "}
  {c.priority}
</p>

                <p className="text-muted">
                  Submitted on{" "}
                  {new Date(
                    c.createdAt
                  ).toLocaleDateString()}
                </p>

                <button
                  className={`btn ${
                    requestingId === c._id
                      ? "btn-secondary"
                      : "btn-outline-primary"
                  } w-100`}
                  disabled={requestingId === c._id}
                  onClick={() =>
                    requestWork(c._id)
                  }
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

      {/* ================= IMAGE MODAL ================= */}
      {selectedImage && (
        <div
          className="image-modal"
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <img
            src={selectedImage}
            alt="Full View"
          />
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
