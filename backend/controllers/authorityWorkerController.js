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
    console.error(error);
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

    worker.approvalStatus = status;
    await worker.save();

    res.json({
      message: `Worker ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update worker approval" });
  }
};

/* ======================================================
   AUTHORITY: VIEW WORK REQUESTS FOR A COMPLAINT
   🔥 POPULATES NAME + EMAIL + SKILLS
====================================================== */
exports.getWorkRequestsForComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId).populate(
      "workRequests.worker",
      "name email workerSkills approvalStatus"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint.workRequests);
  } catch (error) {
    console.error(error);
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

    // Mark selected request as approved, others rejected
    complaint.workRequests = complaint.workRequests.map((req) => {
      if (req.worker.toString() === workerId) {
        return { ...req.toObject(), status: "Approved" };
      }
      return { ...req.toObject(), status: "Rejected" };
    });

    complaint.assignedWorker = workerId;
    complaint.workerStatus = "Not Started";
    complaint.status.statusName = "In Progress";

    await complaint.save();

    res.json({ message: "Worker assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to approve work request" });
  }
};

/* ======================================================
   AUTHORITY: DIRECT ASSIGN WORKER
   🔥 DOES NOT REQUIRE A REQUEST
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
    if (
      !worker ||
      worker.role !== "worker" ||
      worker.approvalStatus !== "Approved"
    ) {
      return res.status(400).json({ message: "Invalid or unapproved worker" });
    }

    complaint.assignedWorker = workerId;
    complaint.workerStatus = "Not Started";
    complaint.status.statusName = "In Progress";

    await complaint.save();

    res.json({ message: "Worker assigned directly" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign worker" });
  }
};

/* ======================================================
   AUTHORITY: VERIFY & RESOLVE
====================================================== */
exports.verifyAndResolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.workerStatus !== "Work Completed") {
      return res.status(400).json({ message: "Work not completed yet" });
    }

    if (!complaint.workerProofImage) {
      return res.status(400).json({ message: "No proof uploaded" });
    }

    complaint.status.statusName = "Resolved";
    await complaint.save();

    res.json({ message: "Complaint resolved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
};
