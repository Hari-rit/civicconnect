const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createComplaint,
  getComplaintsByUser,
  getAllComplaints,
  updateComplaintStatus
} = require("../controllers/complaintController");

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("media"), createComplaint);
router.get("/user/:userId", getComplaintsByUser);
router.get("/", getAllComplaints);
router.put("/:id/status", updateComplaintStatus);

module.exports = router;
