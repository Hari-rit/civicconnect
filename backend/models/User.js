const mongoose = require("mongoose");

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

  // 🔥 REQUIRED FOR SKILLS FLOW
  workerSkills: {
    type: [String],
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
