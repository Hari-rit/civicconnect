const express = require("express");
const router = express.Router();

const {
  getWorkerProfile,
  updateWorkerProfile,
  getAssignedComplaints,
  requestComplaint,
  updateWorkStatus,
  uploadWorkProof,
  getAvailableComplaints
} = require("../controllers/workerController");

const upload = require("../middleware/upload");

/* ================= WORKER ROUTES ================= */

// 🔑 GET worker profile
router.get(
  "/profile",
  getWorkerProfile
);

// 🔑 Update worker profile (skills)
router.put(
  "/profile",
  updateWorkerProfile
);

// 🔑 Get assigned complaints  🔥 THIS WAS BLOCKED BEFORE
router.get(
  "/complaints",
  getAssignedComplaints
);

// 🔑 Get available complaints
router.get(
  "/available-complaints",
  getAvailableComplaints
);

// 🔑 Request a complaint
router.post(
  "/complaints/:complaintId/request",
  requestComplaint
);

// 🔑 Update work status
router.put(
  "/complaints/:complaintId/status",
  updateWorkStatus
);

// 🔑 Upload work proof
router.post(
  "/complaints/:complaintId/proof",
  upload.single("proof"),
  uploadWorkProof
);

module.exports = router;
