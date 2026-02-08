const express = require("express");
const router = express.Router();

const {
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

router.put(
  "/profile",
  authenticateUser,
  isWorker,
  updateWorkerProfile
);

router.get(
  "/complaints",
  authenticateUser,
  isWorker,
  getAssignedComplaints
);

router.get(
  "/available-complaints",
  authenticateUser,
  isWorker,
  getAvailableComplaints
);

router.post(
  "/complaints/:complaintId/request",
  authenticateUser,
  isWorker,
  requestComplaint
);

router.put(
  "/complaints/:complaintId/status",
  authenticateUser,
  isWorker,
  updateWorkStatus
);

router.post(
  "/complaints/:complaintId/proof",
  authenticateUser,
  isWorker,
  upload.single("proof"),
  uploadWorkProof
);

module.exports = router;
