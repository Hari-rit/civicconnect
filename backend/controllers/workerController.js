const User = require("../models/User");
const Complaint = require("../models/Complaint");

/* ======================================================
   HELPER: EXTRACT USER ID FROM AUTH HEADER
   Authorization: Bearer <userId>
====================================================== */
const getUserIdFromAuthHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return null;

  return parts[1]; // <userId>
};

/* ======================================================
   WORKER: GET PROFILE
====================================================== */
exports.getWorkerProfile = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);
    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      workerSkills: worker.workerSkills || [],
      approvalStatus: worker.approvalStatus
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch worker profile" });
  }
};

/* ======================================================
   WORKER: CREATE / UPDATE PROFILE (SKILLS ONLY)
====================================================== */
exports.updateWorkerProfile = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);
    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { workerSkills } = req.body;
    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!Array.isArray(workerSkills) || workerSkills.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one skill is required" });
    }

    worker.workerSkills = workerSkills;
    await worker.save();

    res.json({
      message: "Worker skills updated successfully",
      workerSkills: worker.workerSkills,
      approvalStatus: worker.approvalStatus
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update worker profile" });
  }
};

/* ======================================================
   WORKER: VIEW AVAILABLE COMPLAINTS (SKILL BASED)
====================================================== */
exports.getAvailableComplaints = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);

    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (worker.approvalStatus !== "Approved") {
      return res.json([]);
    }

    if (!worker.workerSkills || worker.workerSkills.length === 0) {
      return res.json([]);
    }

    /* ================= ISSUE → SKILL MAP ================= */

    const ISSUE_SKILL_MAP = {
      "Pothole": "Road Maintenance",
      "Road Damage": "Road Maintenance",

      "Garbage Dumping": "Waste Management",
      "Construction Debris": "Waste Management",

      "Drain Blockage": "Drainage & Sewage",
      "Sewage Overflow": "Drainage & Sewage",

      "Water Leakage": "Water Supply",

      "Streetlight Failure": "Electrical Maintenance",
      "Electrical Hazard": "Electrical Maintenance",

      "Traffic Signal Issue": "Traffic & Signals",
      "Road Accident": "Traffic & Signals",

      "Fallen Tree": "Tree & Obstruction Removal",

      "Stray Animals": "Animal Control",

      "Damaged Road Sign": "Public Infrastructure Repair",
      "Open Manhole": "Public Infrastructure Repair"
    };

    /* ================= FIND ISSUES MATCHING WORKER SKILLS ================= */

    const allowedIssues = Object.keys(ISSUE_SKILL_MAP).filter(issue =>
      worker.workerSkills.includes(ISSUE_SKILL_MAP[issue])
    );

    /* ================= FETCH MATCHING COMPLAINTS ================= */

    const complaints = await Complaint.find({
      issueType: { $in: allowedIssues },
      "authorityDecision.verified": true,
      "status.statusName": "Submitted",
      assignedWorker: null,
      "workRequests.worker": { $ne: worker._id }
    }).sort({ createdAt: -1 });

    res.json(complaints);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch available works" });
  }
};

/* ======================================================
   WORKER: REQUEST A COMPLAINT
====================================================== */
exports.requestComplaint = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);
    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { complaintId } = req.params;
    const worker = await User.findById(workerId);

    if (worker.approvalStatus !== "Approved") {
      return res
        .status(403)
        .json({ message: "Worker not approved yet" });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker) {
      return res
        .status(400)
        .json({ message: "Complaint already assigned" });
    }

    const alreadyRequested = complaint.workRequests.some(
      (r) => r.worker.toString() === workerId
    );

    if (alreadyRequested) {
      return res
        .status(400)
        .json({ message: "You already requested this complaint" });
    }

    complaint.workRequests.push({
      worker: workerId,
      status: "Pending"
    });

    await complaint.save();

    res.json({ message: "Work request submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to request complaint" });
  }
};

/* ======================================================
   WORKER: VIEW ASSIGNED COMPLAINTS (🔥 THIS WAS THE BUG)
====================================================== */
exports.getAssignedComplaints = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);

    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const complaints = await Complaint.find({
      assignedWorker: workerId
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assigned complaints" });
  }
};

/* ======================================================
   WORKER: UPDATE WORK STATUS
====================================================== */
exports.updateWorkStatus = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);
    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { complaintId } = req.params;
    const { workerStatus } = req.body;

    const allowedStatuses = [
      "Not Started",
      "In Progress",
      "Work Completed"
    ];

    if (!allowedStatuses.includes(workerStatus)) {
      return res.status(400).json({ message: "Invalid worker status" });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      assignedWorker: workerId
    });

    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Complaint not assigned to you" });
    }

    complaint.workerStatus = workerStatus;

    if (workerStatus === "Work Completed") {
      complaint.workerCompletedAt = new Date();
    }

    await complaint.save();

    res.json({ message: "Worker status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update work status" });
  }
};

/* ======================================================
   WORKER: UPLOAD WORK COMPLETION PROOF
====================================================== */
exports.uploadWorkProof = async (req, res) => {
  try {
    const workerId = getUserIdFromAuthHeader(req);
    if (!workerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { complaintId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Proof image is required" });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      assignedWorker: workerId
    });

    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Complaint not assigned to you" });
    }

    if (complaint.workerStatus !== "Work Completed") {
      return res.status(400).json({
        message: "Complete the work before uploading proof"
      });
    }

    complaint.workerProofImage = req.file.path;
    await complaint.save();

    res.json({ message: "Work proof uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload work proof" });
  }
};
