const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const studentController = require("../controllers/student.controller");

// Create profile
router.post("/profile", verifyToken, studentController.createStudentProfile);

module.exports = router;