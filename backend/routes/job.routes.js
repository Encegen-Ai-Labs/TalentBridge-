const express = require("express");
const router = express.Router();

const jobController = require("../controllers/job.controller");
const verifyToken = require("../middleware/auth.middleware");

// Create job
router.post("/create", verifyToken, jobController.createJob);
router.get("/", jobController.getAllJobs);
router.get("/internships", jobController.getCompanyInternships);
module.exports = router;