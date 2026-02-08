/* ======================================================
   ROLE-BASED ACCESS CONTROL MIDDLEWARE
   ====================================================== */

exports.isAuthority = (req, res, next) => {
  if (!req.user || req.user.role !== "authority") {
    return res.status(403).json({
      message: "Access denied: Authority only"
    });
  }
  next();
};

exports.isWorker = (req, res, next) => {
  if (!req.user || req.user.role !== "worker") {
    return res.status(403).json({
      message: "Access denied: Worker only"
    });
  }
  next();
};
