const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const studentController = require("../controllers/student.controller");

// Create profile
router.post("/profile", verifyToken, studentController.createStudentProfile);

// Get profile
router.get("/profile", verifyToken, studentController.getStudentProfile);

// get shared jobs
router.get("/shared-jobs", verifyToken, studentController.getSharedJobs);

// update profile
router.put("/profile", verifyToken, studentController.updateProfile);

// student preferences
router.get("/preferences", verifyToken, studentController.getPreferences);
router.put("/preferences", verifyToken, studentController.updatePreferences);

module.exports = router;