const Complaint = require("../models/Complaint");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const exifParser = require("exif-parser");

/* =====================================================
   CREATE COMPLAINT (Citizen)
===================================================== */
exports.createComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media file required" });
    }

    const mediaType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    let issueType = "Pending Review";
    let confidence = null;

    let locationData = {
      area: req.body.area || "Not provided",
      landmark: req.body.landmark || null,
      latitude: null,
      longitude: null,
      address: null,
      source: "MANUAL"
    };

    /* DEVICE GPS (TOP PRIORITY) */
    if (req.body.latitude && req.body.longitude) {
      locationData.latitude = Number(req.body.latitude);
      locationData.longitude = Number(req.body.longitude);
      locationData.source = "DEVICE";
    }

    /* ML + EXIF */
    if (mediaType === "image") {
      try {
        const form = new FormData();
        form.append(
          "image",
          fs.createReadStream(path.join(__dirname, "..", req.file.path))
        );

        const mlResponse = await axios.post(
          "http://127.0.0.1:5001/predict",
          form,
          { headers: form.getHeaders(), timeout: 10000 }
        );

        issueType = mlResponse.data.issueType;
        confidence = mlResponse.data.confidence;
      } catch {
        // ML failure should not block complaint creation
      }

      /* EXIF fallback */
      if (!locationData.latitude) {
        try {
          const imageBuffer = fs.readFileSync(
            path.join(__dirname, "..", req.file.path)
          );
          const result = exifParser.create(imageBuffer).parse();

          if (result.tags?.GPSLatitude && result.tags?.GPSLongitude) {
            locationData.latitude = result.tags.GPSLatitude;
            locationData.longitude = result.tags.GPSLongitude;
            locationData.source = "EXIF";
          }
        } catch {}
      }
    }

    const complaint = new Complaint({
      userId: req.body.userId,
      location: locationData,
      media: {
        type: mediaType,
        path: `/uploads/${req.file.filename}`
      },
      aiPrediction: { issueType, confidence },
      authorityDecision: {
        category: "Pending",
        priority: "Pending",
        verified: false
      },
      status: {
        statusName: "Submitted"
      }
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* =====================================================
   GET COMPLAINTS
===================================================== */
exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

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
   UPDATE STATUS ONLY (Worker / Authority)
===================================================== */
exports.updateComplaintStatus = async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, {
      $set: {
        "status.statusName": req.body.statusName
      }
    });

    res.json({ message: "Status updated successfully" });
  } catch {
    res.status(500).json({ message: "Status update failed" });
  }
};

/* =====================================================
   AUTHORITY: VERIFY + CATEGORY + PRIORITY + STATUS
===================================================== */
exports.verifyComplaint = async (req, res) => {
  try {
    const { category, priority, statusName } = req.body;

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        authorityDecision: {
          category,
          priority,
          verified: true
        },
        status: {
          statusName
        }
      },
      { new: true }
    );

    res.json({
      message: "Complaint verified successfully",
      complaint: updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* =====================================================
   AVAILABLE WORKS (Worker)
===================================================== */
exports.getAvailableWorks = async (req, res) => {
  try {
    const complaints = await Complaint.find({
  "authorityDecision.verified": true,
  "status.statusName": "Submitted",
  assignedWorker: null
})


    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch available works" });
  }
};


