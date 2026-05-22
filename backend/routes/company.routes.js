const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const companyController = require("../controllers/company.controller");

// COMPANY PROFILE
router.post("/profile", verifyToken, companyController.createCompanyProfile);

// DASHBOARD STATS
router.get("/dashboard-stats", verifyToken, companyController.getDashboardStats);

// APPLICANTS
router.get("/applicants", verifyToken, companyController.getCompanyApplicants);

// UPDATE STATUS
router.put(
  "/applications/:application_id/status",
  verifyToken,
  companyController.updateApplicationStatus
);

// INVITES
router.get("/invites", verifyToken, companyController.getCompanyInvites);

// ACCEPT
router.post("/accept-invite", verifyToken, companyController.acceptInvite);

// REJECT
router.post("/reject-invite", verifyToken, companyController.rejectInvite);

//create drive
router.post("/create-job-drive", verifyToken, companyController.createJobFromDrive);

module.exports = router;