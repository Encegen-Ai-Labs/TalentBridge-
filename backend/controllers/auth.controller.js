const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, role, college_name, location } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, userRes) => {
    if (err) return res.status(500).json(err);

    if (userRes.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      (err, userResult) => {
        if (err) return res.status(500).json(err);

        const user_id = userResult.insertId;

        // ✅ ONLY TPO FLOW
       console.log("STEP 1: User inserted");

if (role === "tpo") {
  console.log("STEP 2: TPO block entered");

  db.query("SELECT * FROM college WHERE college_name = ?", [college_name], (err, collegeRes) => {
    console.log("STEP 3: College query executed");

    if (err) {
      console.log("COLLEGE ERROR:", err);
      return res.status(500).json(err);
    }

    console.log("COLLEGE RESULT:", collegeRes);

    const insertCollege = (college_id) => {
      console.log("STEP 4: inserting TPO");

      db.query(
        "INSERT INTO tpo (user_id, college_id) VALUES (?, ?)",
        [user_id, college_id],
        (err, result) => {
          if (err) {
            console.log("TPO INSERT ERROR:", err);
            return res.status(500).json(err);
          }

          console.log("TPO INSERT SUCCESS:", result);

          return res.json({
            message: "TPO created",
            tpo_id: result.insertId
          });
        }
      );
    };

    if (collegeRes.length > 0) {
      insertCollege(collegeRes[0].college_id);
    } else {
      db.query(
        "INSERT INTO college (college_name, location) VALUES (?, ?)",
        [college_name, location || null],
        (err, result) => {
          if (err) {
            console.log("COLLEGE INSERT ERROR:", err);
            return res.status(500).json(err);
          }

          console.log("COLLEGE CREATED:", result.insertId);

          insertCollege(result.insertId);
        }
      );
    }
  });
} else {
          return res.status(201).json({
            message: "User registered successfully",
            user_id
          });
        }
      }
    );
  });
};

// helper function
function createTPO(user_id, college_id, res) {
db.query(
  "INSERT INTO tpo (user_id, college_id) VALUES (?, ?)",
  [user_id, college_id],
  (err, tpoResult) => {
    if (err) {
      console.log("TPO insert error:", err);
      return res.status(500).json(err);
    }

    return res.status(201).json({
      message: "TPO registered successfully",
      user_id,
      college_id,
      tpo_id: tpoResult.insertId
    });
  }
);
}

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  // Find user
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    try {
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          user_id: user.user_id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.user_id,
          name: user.name,
          role: user.role
        }
      });

    } catch (error) {
      return res.status(500).json(error);
    }
  });
};