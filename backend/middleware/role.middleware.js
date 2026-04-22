exports.allowTPO = (req, res, next) => {
  if (!req.user || req.user.role !== "tpo") {
    return res.status(403).json({
      message: "Access denied. TPO only"
    });
  }
  next();
};