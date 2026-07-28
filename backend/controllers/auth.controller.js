const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ================= REGISTER =================

exports.register = async (req, res) => {
  console.log("REQ BODY:", req.body);

  try {
    const {
      name,
      email,
      password,
      mobile_number,
      work_status,
      preferences,
    } = req.body;

    // ================= VALIDATION =================

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !mobile_number?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ================= EMAIL CHECK =================

    const [existingUser] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    // ================= EMAIL EXISTS =================

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log({ name, email, mobile_number, work_status });

    // ================= INSERT QUERY =================

    const insertQuery = `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        role,
        mobile_number,
        work_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // ================= INSERT USER =================

    const [result] = await db.promise().query(
      insertQuery,
      [
        name,
        email,
        hashedPassword,
        "student",
        mobile_number,
        work_status || "fresher",
      ]
    );

    // ================= SUCCESS =================

    const userId = result.insertId;
    const prefString = preferences ? (typeof preferences === 'string' ? preferences : JSON.stringify(preferences)) : null;

    const insertStudentQuery = `
      INSERT INTO student (user_id, approval_status, preferences)
      VALUES (?, 'approved', ?)
    `;

    try {
    await db.promise().query(insertStudentQuery, [userId, prefString]);
  } catch (err) {
  console.log("INSERT STUDENT PREFERENCES ERROR:", err);
} 

return res.status(201).json({
  message: "Registration successful",
  user_id: userId,
});

    

  } catch (error) {
    console.log("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
// ================= LOGIN =================

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('LOGIN ATTEMPT:', { email });

  // ================= VALIDATION =================

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required",
    });
  }

  try {
    // ================= FIND USER =================

    const [result] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log('DB QUERY RESULT length:', result && result.length);

    // ================= USER NOT FOUND =================

    if (result.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result[0];

    // ================= PASSWORD MATCH =================

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // ================= JWT TOKEN =================

    if (!process.env.JWT_SECRET) {
      console.error('JWT secret is not configured. Set JWT_SECRET in your environment.');
      return res.status(500).json({ message: 'Server misconfiguration: JWT secret not set' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ================= SUCCESS =================

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("LOGIN SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
// ================= REGISTER COMPANY =================

// ================= REGISTER COMPANY =================

exports.registerCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile_number,
      company_name,
      industry,
    } = req.body;

    // ================= VALIDATION =================

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !mobile_number?.trim() ||
      !company_name?.trim() ||
      !industry?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ================= EMAIL CHECK =================

    const [existingUser] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    // ================= EMAIL EXISTS =================

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= INSERT USER =================

    const insertUserQuery = `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        role,
        mobile_number,
        work_status
      )
      VALUES (?, ?, ?, 'company', ?, 'fresher')
    `;

    const [userResult] = await db.promise().query(
      insertUserQuery,
      [name, email, hashedPassword, mobile_number]
    );

    const userId = userResult.insertId;

    // ================= INSERT COMPANY =================

    const insertCompanyQuery = `
      INSERT INTO company
      (
        user_id,
        company_name,
        industry,
        verified_status
      )
      VALUES (?, ?, ?, 0)
    `;

    const [companyResult] = await db.promise().query(
      insertCompanyQuery,
      [userId, company_name, industry]
    );

    return res.status(201).json({
      message: "Employer registered successfully",
      user_id: userId,
      company_id: companyResult.insertId,
    });

  } catch (error) {
    console.log("SERVER ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [userResult] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email.trim()]
    );

    if (userResult.length === 0) {
      return res.status(200).json({
        message: "If this email exists, an OTP has been sent."
      });
    }

    const otp_code = crypto.randomInt(100000, 1000000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await db.promise().query(
      "INSERT INTO otp_resets (email, otp_code, expires_at) VALUES (?, ?, ?)",
      [email.trim(), otp_code, expires_at]
    );

    return res.status(200).json({
      message: "OTP generated successfully",
      otp_code,
      expires_at
    });

  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return res.status(500).json({ message: "Database error generating OTP", error: err.message });
  }
};