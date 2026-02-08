const User = require("../models/User");

exports.authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // 🔥 THIS IS THE KEY
    next();
  } catch (err) {
    return res.status(500).json({ message: "Authentication failed" });
  }
};
