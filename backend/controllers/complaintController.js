const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const mediaType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    const complaint = new Complaint({
      userId: req.body.userId,
      location: { area: req.body.area },
      media: {
        type: mediaType,
        path: `/uploads/${req.file.filename}`
      }
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

exports.getComplaintsByUser = async (req, res) => {
  const complaints = await Complaint.find({
    userId: req.params.userId
  }).sort({ createdAt: -1 });
  res.json(complaints);
};

exports.getAllComplaints = async (req, res) => {
  const complaints = await Complaint.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json(complaints);
};

exports.updateComplaintStatus = async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, {
    status: {
      statusName: req.body.statusName
    }
  });
  res.json({ message: "Status updated" });
};
