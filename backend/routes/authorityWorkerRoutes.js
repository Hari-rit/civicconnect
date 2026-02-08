const express = require("express");
const router = express.Router();

const {
  getPendingWorkers,
  updateWorkerApproval,
  getWorkRequestsForComplaint,
  approveWorkRequest,
  assignWorkerDirectly,
  verifyAndResolveComplaint
} = require("../controllers/authorityWorkerController");

// Middleware (assumed to already exist)
const { authenticateUser } = require("../middleware/authMiddleware");
const { isAuthority } = require("../middleware/roleMiddleware");

/* ======================================================
   AUTHORITY: WORKER MANAGEMENT ROUTES
   ====================================================== */

// View all pending worker registrations
router.get(
  "/workers/pending",
  authenticateUser,
  isAuthority,
  getPendingWorkers
);

// Approve or reject a worker
router.put(
  "/workers/:workerId/approval",
  authenticateUser,
  isAuthority,
  updateWorkerApproval
);

// View work requests for a complaint
router.get(
  "/complaints/:complaintId/requests",
  authenticateUser,
  isAuthority,
  getWorkRequestsForComplaint
);

// Approve a specific work request (assign worker)
router.put(
  "/complaints/:complaintId/approve/:workerId",
  authenticateUser,
  isAuthority,
  approveWorkRequest
);

// Directly assign a worker (no request)
router.put(
  "/complaints/:complaintId/assign",
  authenticateUser,
  isAuthority,
  assignWorkerDirectly
);

// Verify worker proof & resolve complaint
router.put(
  "/complaints/:complaintId/resolve",
  authenticateUser,
  isAuthority,
  verifyAndResolveComplaint
);

module.exports = router;
