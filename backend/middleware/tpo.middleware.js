const db = require("../config/db");

exports.getTPO = (req, res, next) => {
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized user" });
  }

  db.query("SELECT * FROM tpo WHERE user_id = ?", [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (!result.length) {
      return res.status(404).json({ message: "TPO not found" });
    }

    req.tpo = result[0]; // attach TPO globally
    next();
  });
};