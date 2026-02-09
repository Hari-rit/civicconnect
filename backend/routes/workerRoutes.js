const express = require("express");
const router = express.Router();

const {
  getWorkerProfile,        // 🔥 REQUIRED FOR SKILLS POPUP
  updateWorkerProfile,
  getAssignedComplaints,
  requestComplaint,
  updateWorkStatus,
  uploadWorkProof,
  getAvailableComplaints
} = require("../controllers/workerController");

const { authenticateUser } = require("../middleware/authMiddleware");
const { isWorker } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

/* ================= WORKER ROUTES ================= */

// 🔥 ORDER IS IMPORTANT: authenticateUser → isWorker

// 🔑 GET worker profile (used for skills popup check)
router.get(
  "/profile",
  authenticateUser,
  isWorker,
  getWorkerProfile
);

// 🔑 Update worker profile (skills)
router.put(
  "/profile",
  authenticateUser,
  isWorker,
  updateWorkerProfile
);

// 🔑 Get assigned complaints
router.get(
  "/complaints",
  authenticateUser,
  isWorker,
  getAssignedComplaints
);

// 🔑 Get available complaints (skill + approval based)
router.get(
  "/available-complaints",
  authenticateUser,
  isWorker,
  getAvailableComplaints
);

// 🔑 Request a complaint
router.post(
  "/complaints/:complaintId/request",
  authenticateUser,
  isWorker,
  requestComplaint
);

// 🔑 Update work status
router.put(
  "/complaints/:complaintId/status",
  authenticateUser,
  isWorker,
  updateWorkStatus
);

// 🔑 Upload work proof
router.post(
  "/complaints/:complaintId/proof",
  authenticateUser,
  isWorker,
  upload.single("proof"),
  uploadWorkProof
);

module.exports = router;
