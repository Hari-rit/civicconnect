const Complaint = require("../models/Complaint");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const exifParser = require("exif-parser");

/* =====================================================
   CREATE COMPLAINT (Citizen)
===================================================== */
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const ISSUE_REFERENCE = {
  "Pothole": "pothole deep hole road surface crack damaged asphalt cavity",
  "Road Damage": "broken road uneven pavement collapsed surface crack",
  "Garbage Dumping": "garbage trash waste litter dumped pile roadside dirty",
  "Drain Blockage": "blocked drain clogged drainage stagnant water overflow",
  "Water Leakage": "water leak leaking pipe burst pipeline flowing water",
  "Sewage Overflow": "sewage overflow dirty wastewater bad smell drain",
  "Streetlight Failure": "streetlight not working no light broken lamp post",
  "Electrical Hazard": "exposed wire electric pole sparking dangerous electricity",
  "Damaged Road Sign": "broken road sign bent signboard missing signage",
  "Traffic Signal Issue": "traffic signal not working red light malfunction junction",
  "Fallen Tree": "fallen tree blocking road obstruction storm damage",
  "Stray Animals": "stray dog cattle animal road obstruction traffic hazard",
  "Construction Debris": "construction waste debris sand bricks rubble road blockage",
  "Open Manhole": "open manhole uncovered drain open pit dangerous hole",
  "Road Accident": "road accident vehicle collision crash damaged vehicle obstruction"
};

function classifyIssue(caption) {
  const tfidf = new TfIdf();
  const documents = [caption];

  Object.values(ISSUE_REFERENCE).forEach(desc => {
    documents.push(desc);
  });

  documents.forEach(doc => tfidf.addDocument(doc));

  let highestScore = 0;
  let detectedIssue = "Pending Review";

  Object.keys(ISSUE_REFERENCE).forEach((issue, index) => {
    const score = tfidf.tfidf(ISSUE_REFERENCE[issue], 0);
    if (score > highestScore) {
      highestScore = score;
      detectedIssue = issue;
    }
  });

  return { issueType: detectedIssue, similarityScore: highestScore };
}

function detectPriority(caption) {
  caption = caption.toLowerCase();

  if (
    caption.includes("hospital") ||
    caption.includes("school") ||
    caption.includes("main road") ||
    caption.includes("highway")
  ) {
    return "High";
  }

  if (caption.includes("residential") || caption.includes("market")) {
    return "Medium";
  }

  return "Low";
}

exports.createComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media file required" });
    }

    const mediaType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    let caption = "";
    let issueType = "Pending Review";
    let similarityScore = 0;
    let priority = "Low";

    let locationData = {
      area: req.body.area || "Not provided",
      landmark: req.body.landmark || null,
      latitude: null,
      longitude: null,
      address: null,
      source: "MANUAL"
    };

    if (req.body.latitude && req.body.longitude) {
      locationData.latitude = Number(req.body.latitude);
      locationData.longitude = Number(req.body.longitude);
      locationData.source = "DEVICE";
    }

    if (mediaType === "image") {
      try {
        const form = new FormData();
        form.append(
          "image",
          fs.createReadStream(path.join(__dirname, "..", req.file.path))
        );

        const mlResponse = await axios.post(
          "http://127.0.0.1:5001/generate-caption",
          form,
          { headers: form.getHeaders(), timeout: 20000 }
        );

        caption = mlResponse.data.caption;

        const classification = classifyIssue(caption);
        issueType = classification.issueType;
        similarityScore = classification.similarityScore;

        priority = detectPriority(caption);

      } catch (err) {
        console.log("Caption generation failed:", err.message);
      }
    }

    const complaint = new Complaint({
      userId: req.body.userId,
      location: locationData,
      media: {
        type: mediaType,
        path: `/uploads/${req.file.filename}`
      },
      caption,
      issueType,
      similarityScore,
      priority,
      status: {
        statusName: "Submitted"
      }
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted",
      complaint
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* =====================================================
   GET COMPLAINTS (Citizen)
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
   🔥 FULL POPULATION FOR ASSIGN WORKER
===================================================== */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email")
      .populate("workRequests.worker", "name email workerSkills")
      .populate("assignedWorker", "name email workerSkills")
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
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch available works" });
  }
};

/* =====================================================
   WORKER: REQUEST WORK (FIXED + POPULATABLE)
===================================================== */
exports.requestWork = async (req, res) => {
  try {
    const { workerId } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker) {
      return res.status(400).json({
        message: "Work already assigned"
      });
    }

    const alreadyRequested = complaint.workRequests.some(
      (r) => r.worker.toString() === workerId
    );

    if (alreadyRequested) {
      return res.status(400).json({
        message: "You already requested this work"
      });
    }

    complaint.workRequests.push({
      worker: workerId,
      requestedAt: new Date(),
      status: "Pending"
    });

    await complaint.save();

    res.json({ message: "Work request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request work" });
  }
};
