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

const { authenticateUser } = require("../middleware/authMiddleware");
const { isAuthority } = require("../middleware/roleMiddleware");

/* ================= AUTHORITY ROUTES ================= */

// ✅ ORDER MATTERS: authenticateUser → isAuthority

router.get(
  "/workers/pending",
  authenticateUser,
  isAuthority,
  getPendingWorkers
);

router.put(
  "/workers/:workerId/approval",
  authenticateUser,
  isAuthority,
  updateWorkerApproval
);

router.get(
  "/complaints/:complaintId/requests",
  authenticateUser,
  isAuthority,
  getWorkRequestsForComplaint
);

router.put(
  "/complaints/:complaintId/approve/:workerId",
  authenticateUser,
  isAuthority,
  approveWorkRequest
);

router.put(
  "/complaints/:complaintId/assign",
  authenticateUser,
  isAuthority,
  assignWorkerDirectly
);

router.put(
  "/complaints/:complaintId/resolve",
  authenticateUser,
  isAuthority,
  verifyAndResolveComplaint
);

module.exports = router;
