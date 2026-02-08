const express = require("express");
const router = express.Router();

const {
  updateWorkerProfile,
  getAssignedComplaints,
  requestComplaint,
  updateWorkStatus
} = require("../controllers/workerController");

// Middleware
const { authenticateUser } = require("../middleware/authMiddleware");
const { isWorker } = require("../middleware/roleMiddleware");

/* ======================================================
   WORKER ROUTES
   ====================================================== */

// Update worker profile (skills + gender)
router.put(
  "/profile",
  authenticateUser,
  isWorker,
  updateWorkerProfile
);

// Get complaints assigned to this worker
router.get(
  "/complaints",
  authenticateUser,
  isWorker,
  getAssignedComplaints
);

// Request a verified complaint
router.post(
  "/complaints/:complaintId/request",
  authenticateUser,
  isWorker,
  requestComplaint
);

// Update worker work status
router.put(
  "/complaints/:complaintId/status",
  authenticateUser,
  isWorker,
  updateWorkStatus
);

module.exports = router;
