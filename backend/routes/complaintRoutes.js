const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createComplaint,
  getComplaintsByUser,
  getAllComplaints,
  updateComplaintStatus,
  verifyComplaint
} = require("../controllers/complaintController");

/* ===============================
   Citizen Routes
=============================== */

// Create complaint 
router.post("/", upload.single("media"), createComplaint);

// Get complaints by logged-in user
router.get("/user/:userId", getComplaintsByUser);

/* ===============================
   Authority Routes
=============================== */

// Get all complaints
router.get("/", getAllComplaints);

// Update complaint status (Submitted  In Progress  Resolved)
router.put("/:id/status", updateComplaintStatus);

//   verify ai prediction set category priority
router.put("/:id/verify", verifyComplaint);

module.exports = router;
