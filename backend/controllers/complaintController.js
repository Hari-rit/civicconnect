const Complaint = require("../models/Complaint");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

/* =====================================================
   CREATE COMPLAINT (Citizen)
   - ML prediction is OPTIONAL
   - Complaint must succeed even if ML fails
===================================================== */
exports.createComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media file required" });
    }

    const mediaType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    // Default AI values (safe)
    let issueType = "Pending Review";
    let confidence = null;

    /* ---------- ML CALL (IMAGE ONLY) ---------- */
    if (mediaType === "image") {
      try {
        const form = new FormData();
        form.append(
          "image",
          fs.createReadStream(
            path.join(__dirname, "..", req.file.path)
          )
        );

        const mlResponse = await axios.post(
          "http://127.0.0.1:5001/predict",
          form,
          {
            headers: form.getHeaders(),
            timeout: 10000
          }
        );

        issueType = mlResponse.data.issueType;
        confidence = mlResponse.data.confidence;

      } catch (mlError) {
        console.error("ML service failed:", mlError.message);
      }
    }

    /* ---------- SAVE COMPLAINT ---------- */
    const complaint = new Complaint({
      userId: req.body.userId,
      location: { area: req.body.area },
      media: {
        type: mediaType,
        path: `/uploads/${req.file.filename}`
      },

      aiPrediction: {
        issueType,
        confidence
      },

      authorityDecision: {
        category: "Pending",
        priority: "Pending",
        verified: false
      }
    });

    await complaint.save();

    return res.status(201).json({
      message: "Complaint submitted successfully",
      aiPrediction: complaint.aiPrediction,
      complaint
    });

  } catch (error) {
    console.error("Complaint creation error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

/* =====================================================
   GET COMPLAINTS BY USER (Citizen)
===================================================== */
exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

/* =====================================================
   GET ALL COMPLAINTS (Authority)
===================================================== */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

/* =====================================================
   UPDATE STATUS (Authority)
===================================================== */
exports.updateComplaintStatus = async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, {
      status: {
        statusName: req.body.statusName
      }
    });

    res.json({ message: "Status updated" });
  } catch {
    res.status(500).json({ message: "Status update failed" });
  }
};

/* =====================================================
   AUTHORITY: VERIFY & CATEGORIZE AI RESULT
===================================================== */
exports.verifyComplaint = async (req, res) => {
  try {
    const { category, priority } = req.body;

    await Complaint.findByIdAndUpdate(req.params.id, {
      authorityDecision: {
        category,
        priority,
        verified: true
      }
    });

    res.json({ message: "Complaint verified successfully" });
  } catch {
    res.status(500).json({ message: "Verification failed" });
  }
};
