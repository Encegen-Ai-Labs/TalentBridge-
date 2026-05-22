const db = require("../config/db");
exports.createRound = (req, res) => {
  const {
    drive_id,
    round_name,
    round_order,
    round_type,
    scheduled_date,
    mode
  } = req.body;

  const role = req.user.role;

  if (!drive_id || !round_name || !round_order) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const query = `
    INSERT INTO drive_rounds 
    (drive_id, round_name, round_order, round_type, scheduled_date, mode, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [drive_id, round_name, round_order, round_type, scheduled_date, mode, role],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Round created successfully",
        round_id: result.insertId
      });
    }
  );
};

exports.getDriveRounds = (req, res) => {
  const { drive_id } = req.params;

  const query = `
    SELECT * FROM drive_rounds
    WHERE drive_id = ?
    ORDER BY round_order ASC
  `;

  db.query(query, [drive_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

exports.updateRound = (req, res) => {
  const { round_id } = req.params;
  const { scheduled_date, status, mode } = req.body;

  const query = `
    UPDATE drive_rounds
    SET scheduled_date = ?, status = ?, mode = ?
    WHERE round_id = ?
  `;

  db.query(
    query,
    [scheduled_date, status, mode, round_id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Round updated successfully" });
    }
  );
};

exports.deleteRound = (req, res) => {
  const { round_id } = req.params;

  db.query(
    "DELETE FROM drive_rounds WHERE round_id = ?",
    [round_id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Round deleted" });
    }
  );
};