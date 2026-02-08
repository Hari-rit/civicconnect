const User = require("../models/User");
const Complaint = require("../models/Complaint");

/* ======================================================
   WORKER: COMPLETE / UPDATE PROFILE (Skills + Gender)
   ====================================================== */
exports.updateWorkerProfile = async (req, res) => {
  try {
    const workerId = req.user.id;
    const { workerSkills, gender } = req.body;

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (worker.approvalStatus !== "Approved") {
      return res.status(403).json({
        message: "Worker not approved by authority yet"
      });
    }

    // Update profile fields
    if (Array.isArray(workerSkills)) {
      worker.workerSkills = workerSkills;
    }

    if (gender) {
      worker.gender = gender;
    }

    await worker.save();

    res.json({
      message: "Worker profile updated successfully",
      worker: {
        name: worker.name,
        workerSkills: worker.workerSkills,
        gender: worker.gender
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
    const workerId = req.user.id;

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
    const workerId = req.user.id;
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.assignedWorker) {
      return res.status(400).json({ message: "Complaint already assigned" });
    }

    // Prevent duplicate requests
    const alreadyRequested = complaint.workRequests.some(
      (req) => req.worker.toString() === workerId
    );

    if (alreadyRequested) {
      return res
        .status(400)
        .json({ message: "You have already requested this complaint" });
    }

    complaint.workRequests.push({
      worker: workerId
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
    const workerId = req.user.id;
    const { complaintId } = req.params;
    const { workerStatus } = req.body;

    const allowedStatuses = ["Not Started", "In Progress", "Work Completed"];

    if (!allowedStatuses.includes(workerStatus)) {
      return res.status(400).json({ message: "Invalid worker status" });
    }

    const complaint = await Complaint.findOne({
      _id: complaintId,
      assignedWorker: workerId
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not assigned to you" });
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
