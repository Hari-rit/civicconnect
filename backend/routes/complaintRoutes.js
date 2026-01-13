const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaintsByUser
} = require("../controllers/complaintController");

// POST http://localhost:5000/complaints
router.post("/", createComplaint);

// GET http://localhost:5000/complaints/:userId
router.get("/:userId", getComplaintsByUser);

module.exports = router;
