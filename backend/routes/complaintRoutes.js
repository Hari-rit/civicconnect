const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createComplaint,
  getComplaintsByUser,
  getAllComplaints,
  updateComplaintStatus,
  verifyComplaint,
  getAvailableWorks,
  requestWork
} = require("../controllers/complaintController");

/* ===============================
   Citizen Routes
=============================== */

// Create complaint
router.post("/", upload.single("media"), createComplaint);

// Get complaints by logged-in user
router.get("/user/:userId", getComplaintsByUser);

/* ===============================
   Worker Routes
=============================== */

// Get available works for workers
router.get("/available", getAvailableWorks);

// Worker requests a complaint
router.post("/:id/request", requestWork);

/* ===============================
   Authority Routes
=============================== */

// Get all complaints
router.get("/", getAllComplaints);

// Update complaint status (Submitted / In Progress / Resolved)
router.put("/:id/status", updateComplaintStatus);

// Verify AI prediction, set category & priority
router.put("/:id/verify", verifyComplaint);

module.exports = router;
