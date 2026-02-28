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

  "Pothole":
    "pothole deep hole cavity road asphalt broken patch cracked surface damaged street depression",

  "Road Damage":
    "damaged road broken pavement cracked surface collapsed road uneven street destroyed asphalt repair needed",

  "Garbage Dumping":
    "garbage trash waste litter dumping dumped pile debris junk scrap plastic bags dirty roadside rubbish electronic electronics e-waste",

  "Drain Blockage":
    "blocked drain clogged drainage stagnant water overflow gutter choke waterlogging roadside drain blocked",

  "Water Leakage":
    "water leak leaking pipe burst pipeline flowing water dripping tap wet ground broken water line",

  "Sewage Overflow":
    "sewage overflow dirty wastewater drain spill bad smell contaminated water open sewer gutter overflow",

  "Streetlight Failure":
    "streetlight not working no light broken lamp post dark street night visibility issue electricity failure",

  "Electrical Hazard":
    "exposed wire electric pole sparking cable hanging loose live wire dangerous electricity damaged transformer",

  "Damaged Road Sign":
    "broken road sign bent signboard fallen sign missing signage traffic board damaged pole",

  "Traffic Signal Issue":
    "traffic signal not working red light malfunction blinking signal junction traffic light failure",

  "Fallen Tree":
    "fallen tree tree branch storm wind uprooted blocking road obstruction leaves trunk damaged roadside",

  "Stray Animals":
    "stray dog cattle cow animal roaming road obstruction traffic hazard street animal blocking vehicle",

  "Construction Debris":
    "construction waste debris sand bricks rubble cement stones building material road blockage construction site",

  "Open Manhole":
    "open manhole uncovered drain open pit dangerous hole missing cover roadside drain hazard",

  "Road Accident":
    "road accident vehicle collision crash damaged car overturned vehicle injured obstruction traffic incident"
};

function getTfIdfVector(tfidf, docIndex) {
  const terms = tfidf.listTerms(docIndex);
  const vector = {};

  terms.forEach(item => {
    vector[item.term] = item.tfidf;
  });

  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const allTerms = new Set([
    ...Object.keys(vecA),
    ...Object.keys(vecB)
  ]);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  allTerms.forEach(term => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;

    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  });

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

function classifyIssue(caption) {
  const tfidf = new TfIdf();

  tfidf.addDocument(caption);

  Object.values(ISSUE_REFERENCE).forEach(desc => {
    tfidf.addDocument(desc);
  });

  const captionVector = getTfIdfVector(tfidf, 0);

  let highestScore = 0;
  let detectedIssue = "Pending Review";

  Object.keys(ISSUE_REFERENCE).forEach((issue, index) => {
    const issueVector = getTfIdfVector(tfidf, index + 1);
    const score = cosineSimilarity(captionVector, issueVector);

    if (score > highestScore) {
      highestScore = score;
      detectedIssue = issue;
    }
  });

  return {
    issueType: detectedIssue,
    similarityScore: Number(highestScore.toFixed(4))
  };
}

function detectPriority(caption, issueType) {
  caption = caption.toLowerCase();

  // 🔴 Always High Risk Issues
  const highRiskIssues = [
    "Road Accident",
    "Electrical Hazard",
    "Open Manhole",
    "Sewage Overflow"
  ];

  if (highRiskIssues.includes(issueType)) {
    return "High";
  }

  // 🔴 Public traffic exposure keywords
  if (
    caption.includes("road") ||
    caption.includes("street") ||
    caption.includes("traffic") ||
    caption.includes("junction") ||
    caption.includes("bus") ||
    caption.includes("vehicle") ||
    caption.includes("crowded")
  ) {
    return "High";
  }

  // 🟡 Moderate exposure
  if (
    caption.includes("residential") ||
    caption.includes("market") ||
    caption.includes("area")
  ) {
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
