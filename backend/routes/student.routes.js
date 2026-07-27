const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload");
const studentController = require("../controllers/student.controller");

// Create profile
router.post("/profile", verifyToken, studentController.createStudentProfile);

// Get profile
router.get("/profile", verifyToken, studentController.getStudentProfile);

// update profile
router.put("/profile", verifyToken, upload.single('avatar'), studentController.updateProfile);

// student preferences
router.get("/preferences", verifyToken, studentController.getPreferences);
router.put("/preferences", verifyToken, studentController.updatePreferences);

// saved / hidden jobs
router.post('/saved/:jobId', verifyToken, studentController.saveJob);
router.post('/hidden/:jobId', verifyToken, studentController.hideJob);
router.get('/saved', verifyToken, studentController.getSavedJobs);
router.get('/hidden', verifyToken, studentController.getHiddenJobs);
router.delete('/saved/:jobId', verifyToken, studentController.removeSavedJob);

module.exports = router;