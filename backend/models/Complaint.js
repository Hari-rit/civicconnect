const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* ================= MEDIA ================= */
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

    /* ================= LOCATION ================= */
    location: {
      area: {
        type: String,
        default: "Not provided"
      },
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      },
      address: {
        type: String,
        default: null
      },
      source: {
        type: String,
        enum: ["EXIF", "MANUAL"],
        default: "MANUAL"
      }
    },

    /* ================= AI PREDICTION ================= */
    aiPrediction: {
      issueType: {
        type: String,
        default: "unknown"
      },
      confidence: {
        type: Number,
        default: null
      }
    },

    /* ================= AUTHORITY DECISION ================= */
    authorityDecision: {
      category: {
        type: String,
        default: "Pending"
      },
      priority: {
        type: String,
        default: "Pending"
      },
      verified: {
        type: Boolean,
        default: false
      }
    },

    /* ================= STATUS ================= */
    status: {
      statusId: { type: Number, default: 1 },
      statusName: { type: String, default: "Submitted" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
