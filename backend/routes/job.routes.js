// routes/job.routes.js
const express = require("express");
const router = express.Router();

const jobController = require("../controllers/job.controller");
const verifyToken = require("../middleware/auth.middleware");

// Public routes
router.get("/", jobController.getAllJobs);
router.get("/search", jobController.searchJobs);
router.get("/internships", jobController.getCompanyInternships);
router.get("/:jobId", jobController.getJobById);

// Protected routes (require authentication)
router.post("/create", verifyToken, jobController.createJob);
router.put("/:jobId", verifyToken, jobController.updateJob);
router.delete("/:jobId", verifyToken, jobController.deleteJob);
router.post("/:jobId/close", verifyToken, jobController.closeJob);
router.get("/:jobId/applications", verifyToken, jobController.getJobApplications);

module.exports = router;