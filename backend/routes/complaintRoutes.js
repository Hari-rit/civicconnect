const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaintsByUser
} = require("../controllers/complaintController");

router.post("/complaints", createComplaint);
router.get("/complaints/:userId", getComplaintsByUser);

module.exports = router;
