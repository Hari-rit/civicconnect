const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    media: {
      type: {
        type: String,
        enum: ["image", "video"],
        required: true
      },
      path: {
        type: String,
        required: true
      }
    },

    location: {
      area: { type: String, required: true }
    },

    status: {
      statusId: { type: Number, default: 1 },
      statusName: { type: String, default: "Submitted" }
    },

    category: { type: String, default: "Pending" },
    priority: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
