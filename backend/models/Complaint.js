const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    imageName: { type: String, required: true },
    location: {
      area: { type: String, required: true },
      ward: String,
      panchayat: String
    },
    status: {
      statusId: { type: Number, default: 1 },
      statusName: { type: String, default: "Submitted" }
    },
    category: { type: String, default: "Pending" }, // AI later
    priority: { type: String, default: "Pending" }  // AI later
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
