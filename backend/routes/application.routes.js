const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const applicationController = require("../controllers/application.controller");

// APPLY JOB
router.post("/apply", verifyToken, applicationController.applyJob);
// My Applications (Student)
router.get("/my", verifyToken, applicationController.getMyApplications);

module.exports = router;