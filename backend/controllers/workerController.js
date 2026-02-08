const User = require("../models/User");
const Complaint = require("../models/Complaint");

/* ======================================================
   WORKER: CREATE / UPDATE PROFILE (SKILLS ONLY)
   ====================================================== */
exports.updateWorkerProfile = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { workerSkills } = req.body;

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Workers can add skills EVEN BEFORE approval
    if (!Array.isArray(workerSkills) || workerSkills.length === 0) {
      return res.status(400).json({
        message: "At least one skill is required"
      });
    }

    worker.workerSkills = workerSkills;
    await worker.save();

    res.json({
      message: "Worker skills updated successfully",
      worker: {
        name: worker.name,
        workerSkills: worker.workerSkills,
        approvalStatus: worker.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update worker profile" });
  }
};

/* ======================================================
   WORKER: VIEW ASSIGNED COMPLAINTS
   ====================================================== */
exports.getAssignedComplaints = async (req, res) => {
  try {
    const workerId = req.user._id;

    const complaints = await Complaint.find({
      assignedWorker: workerId
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned complaints" });
  }
};

/* ======================================================
   WORKER: REQUEST A COMPLAINT
   ====================================================== */
exports.requestComplaint = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { complaintId } = req.params;

    const worker = await User.findById(workerId);

    if (worker.approvalStatus !== "Approved") {
      return res.status(403).json({
        message: "Worker not approved yet"
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker) {
      return res.status(400).json({ message: "Complaint already assigned" });
    }

    const alreadyRequested = complaint.workRequests?.some(
      (r) => r.worker.toString() === workerId.toString()
    );

    if (alreadyRequested) {
      return res.status(400).json({
        message: "You have already requested this complaint"
      });
    }

    complaint.workRequests.push({
      worker: workerId,
      status: "Pending"
    });

    await complaint.save();

    res.json({ message: "Work request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to request complaint" });
  }
};

/* ======================================================
   WORKER: UPDATE WORK STATUS
   ====================================================== */
exports.updateWorkStatus = async (req, res) => {
  try {
    const workerId = req.user._id;
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
      return res.status(404).json({
        message: "Complaint not assigned to you"
      });
    }

    complaint.workerStatus = workerStatus;

    if (workerStatus === "Work Completed") {
      complaint.workerCompletedAt = new Date();
    }

    await complaint.save();

    res.json({ message: "Worker status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update work status" });
  }
};

/* ======================================================
   WORKER: UPLOAD WORK COMPLETION PROOF
   ====================================================== */
exports.uploadWorkProof = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { complaintId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Proof image is required" });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      assignedWorker: workerId
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not assigned to you"
      });
    }

    if (complaint.workerStatus !== "Work Completed") {
      return res.status(400).json({
        message: "Complete the work before uploading proof"
      });
    }

    complaint.workerProofImage = req.file.path;
    await complaint.save();

    res.json({ message: "Work proof uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload work proof" });
  }
};
