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

    /* ================= AI ================= */
    aiPrediction: {
      issueType: { type: String, default: "unknown" },
      confidence: { type: Number, default: null }
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
        enum: ["Submitted", "In Progress", "Resolved"],
        default: "Submitted"
      }
    },

    /* ================= WORKER FLOW (NEW) ================= */

    // Assigned worker
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Worker progress status
    workerStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "Work Completed"],
      default: "Not Started"
    },

    // Worker proof image (after completion)
    workerProofImage: {
      type: String,
      default: null
    },

    workerCompletedAt: {
      type: Date,
      default: null
    },

    // Workers requesting this complaint
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
