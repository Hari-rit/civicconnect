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
      area: { type: String, default: "Not provided" },
      landmark: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: null },
      source: {
        type: String,
        enum: ["EXIF", "DEVICE", "MANUAL"],
        default: "MANUAL"
      }
    },

    /* ================= AI ANALYSIS ================= */
    caption: {
      type: String,
      default: ""
    },

    issueType: {
      type: String,
      default: "Pending Review"
    },

    similarityScore: {
      type: Number,
      default: 0
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },

    /* ================= DUPLICATE DETECTION ================= */

    duplicate: {
      type: Boolean,
      default: false
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null
    },

    /* ================= AUTHORITY ================= */
    authorityDecision: {
      category: { type: String, default: "Pending" },
      priority: { type: String, default: "Pending" },
      verified: { type: Boolean, default: false }
    },

    /* ================= CITIZEN STATUS ================= */
    status: {
    statusName: {
      type: String,
      enum: ["Submitted", "In Progress", "Resolved", "Duplicate", "Rejected"],
      default: "Submitted"
    }
  },

    /* ================= WORKER FLOW ================= */

    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    workerStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "Work Completed"],
      default: "Not Started"
    },

    workerProofImage: {
      type: String,
      default: null
    },

    workerCompletedAt: {
      type: Date,
      default: null
    },

    workRequests: [
      {
        worker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending"
        },
        requestedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);