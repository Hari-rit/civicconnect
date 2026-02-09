
const express = require("express");
const router = express.Router();

const {
  getPendingWorkers,
  updateWorkerApproval,
  getWorkRequestsForComplaint,
  approveWorkRequest,
  assignWorkerDirectly,
  verifyAndResolveComplaint,
  getApprovedWorkers // 🔥 NEW
} = require("../controllers/authorityWorkerController");

const { authenticateUser } = require("../middleware/authMiddleware");
const { isAuthority } = require("../middleware/roleMiddleware");

/* ================= AUTHORITY ROUTES ================= */
/* 🔒 ORDER MATTERS: authenticateUser → isAuthority */

// 🔹 View workers waiting for approval
router.get(
  "/workers/pending",
  authenticateUser,
  isAuthority,
  getPendingWorkers
);

// 🔹 View all approved workers (🔥 for Direct Assign)
router.get(
  "/workers/approved",
  authenticateUser,
  isAuthority,
  getApprovedWorkers
);

// 🔹 Approve or reject worker
router.put(
  "/workers/:workerId/approval",
  authenticateUser,
  isAuthority,
  updateWorkerApproval
);

// 🔹 View worker requests for a complaint
router.get(
  "/complaints/:complaintId/requests",
  authenticateUser,
  isAuthority,
  getWorkRequestsForComplaint
);

// 🔹 Approve a worker request (assign from requests)
router.put(
  "/complaints/:complaintId/approve/:workerId",
  authenticateUser,
  isAuthority,
  approveWorkRequest
);

// 🔹 Directly assign a worker (even without request)
router.put(
  "/complaints/:complaintId/assign",
  authenticateUser,
  isAuthority,
  assignWorkerDirectly
);

// 🔹 Verify worker proof & resolve complaint
router.put(
  "/complaints/:complaintId/resolve",
  authenticateUser,
  isAuthority,
  verifyAndResolveComplaint
);

module.exports = router;
