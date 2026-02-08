const User = require("../models/User");
const Complaint = require("../models/Complaint");

/* ======================================================
   AUTHORITY: VIEW PENDING WORKERS
   ====================================================== */
exports.getPendingWorkers = async (req, res) => {
  try {
    const workers = await User.find({
      role: "worker",
      approvalStatus: "Pending"
    }).select("-password");

    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending workers" });
  }
};

/* ======================================================
   AUTHORITY: APPROVE / REJECT WORKER
   ====================================================== */
exports.updateWorkerApproval = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { status } = req.body; // Approved | Rejected

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Optional validation: must have at least one skill
    if (status === "Approved" && worker.workerSkills.length === 0) {
      return res.status(400).json({
        message: "Worker must have at least one skill before approval"
      });
    }

    worker.approvalStatus = status;
    await worker.save();

    res.json({
      message: `Worker ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update worker approval" });
  }
};

/* ======================================================
   AUTHORITY: VIEW WORK REQUESTS FOR A COMPLAINT
   ====================================================== */
exports.getWorkRequestsForComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId)
      .populate("workRequests.worker", "name email workerSkills");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint.workRequests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch work requests" });
  }
};

/* ======================================================
   AUTHORITY: APPROVE A WORK REQUEST (ASSIGN WORKER)
   ====================================================== */
exports.approveWorkRequest = async (req, res) => {
  try {
    const { complaintId, workerId } = req.params;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker) {
      return res.status(400).json({ message: "Complaint already assigned" });
    }

    // Assign worker
    complaint.assignedWorker = workerId;
    complaint.workerStatus = "Not Started";

    // Update complaint status
    complaint.status.statusName = "Work In Progress";

    // Update request statuses
    complaint.workRequests.forEach((req) => {
      if (req.worker.toString() === workerId) {
        req.status = "Approved";
      } else {
        req.status = "Rejected";
      }
    });

    await complaint.save();

    res.json({ message: "Worker assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve work request" });
  }
};

/* ======================================================
   AUTHORITY: DIRECTLY ASSIGN WORKER (NO REQUEST)
   ====================================================== */
exports.assignWorkerDirectly = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { workerId } = req.body;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker) {
      return res.status(400).json({ message: "Complaint already assigned" });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker" || worker.approvalStatus !== "Approved") {
      return res.status(400).json({ message: "Invalid or unapproved worker" });
    }

    complaint.assignedWorker = workerId;
    complaint.workerStatus = "Not Started";
    complaint.status.statusName = "Work In Progress";

    await complaint.save();

    res.json({ message: "Worker assigned directly" });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign worker" });
  }
};

/* ======================================================
   AUTHORITY: VERIFY PROOF & RESOLVE COMPLAINT
   ====================================================== */
exports.verifyAndResolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.workerStatus !== "Work Completed") {
      return res.status(400).json({
        message: "Worker has not completed the work yet"
      });
    }

    if (!complaint.workerProofImage) {
      return res.status(400).json({
        message: "No proof uploaded by worker"
      });
    }

    complaint.status.statusName = "Resolved";
    await complaint.save();

    res.json({ message: "Complaint resolved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
};
