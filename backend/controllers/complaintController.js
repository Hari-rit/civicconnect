const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    console.log("Incoming complaint:", req.body); // DEBUG

    const complaint = new Complaint({
      userId: req.body.userId,
      imageName: req.body.imageName,
      location: req.body.location
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint stored successfully",
      complaint
    });
  } catch (error) {
    console.error("Complaint save error:", error);
    res.status(500).json({ message: "Failed to store complaint" });
  }
};
