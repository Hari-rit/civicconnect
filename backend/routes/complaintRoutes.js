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
  requestWork,
  submitFeedback,
  getFeedbackAnalytics
} = require("../controllers/complaintController");

/* ===============================
   Citizen Routes
=============================== */

// Create complaint
router.post("/", upload.single("media"), createComplaint);

// Get complaints by logged-in user
router.get("/user/:userId", getComplaintsByUser);

// Submit feedback
router.post("/:id/feedback", submitFeedback);


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

// Update complaint status
router.put("/:id/status", updateComplaintStatus);

// Verify complaint
router.put("/:id/verify", verifyComplaint);

// 🔹 Feedback analytics for dashboard
router.get("/feedback/analytics", getFeedbackAnalytics);


module.exports = router;