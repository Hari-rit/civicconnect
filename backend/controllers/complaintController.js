const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    console.log("🔥 Complaint API HIT");
    console.log(req.body);

    const complaint = new Complaint({
      userId: req.body.userId,
      imageName: req.body.imageName,
      location: req.body.location,
      status: {
        statusId: 1,
        statusName: "Submitted"
      },
      category: "Pending",
      priority: "Pending"
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint stored successfully",
      complaint
    });
  } catch (error) {
    console.error("❌ Save error:", error);
    res.status(500).json({ message: "Failed to store complaint" });
  }
};

exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};
