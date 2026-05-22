exports.getApplicants = (req, res) => {
  const { job_id } = req.params;

  const query = `
    SELECT 
      u.name,
      s.branch,
      s.year,
      a.status,
      a.applied_at
    FROM applications a
    JOIN student s ON a.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    WHERE a.job_id = ?
  `;

  db.query(query, [job_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

exports.updateRoundStatus = (req, res) => {
  const { application_id, status } = req.body;

  const query = `
    UPDATE applications
    SET status = ?
    WHERE application_id = ?
  `;

  db.query(query, [status, application_id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Status updated" });
  });
};