const mongoose = require("mongoose");

/* ===========================================
   STANDARDIZED WORKER SKILLS (LOCKED ENUM)
=========================================== */

const WORKER_SKILLS = [
  "Road Maintenance",
  "Waste Management",
  "Drainage & Sewage",
  "Water Supply",
  "Electrical Maintenance",
  "Traffic & Signals",
  "Tree & Obstruction Removal",
  "Animal Control",
  "Public Infrastructure Repair"
];

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["citizen", "authority", "worker"],
    default: "citizen"
  },

  /* ================= WORKER SKILLS ================= */

  workerSkills: {
    type: [
      {
        type: String,
        enum: WORKER_SKILLS
      }
    ],
    default: []
  },

  approvalStatus: {
    type: String,
    enum: ["Pending", "Approved"],
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);