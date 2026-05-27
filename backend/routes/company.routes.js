const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const companyController = require("../controllers/company.controller");
const multerConfig = require("../config/multer");

// COMPANY PROFILE
router.post("/profile", verifyToken, companyController.createCompanyProfile);
// Get full company profile
router.get("/profile", verifyToken, companyController.getCompanyProfile);
// Update company profile (with file uploads)
router.put(
  "/profile",
  verifyToken,
  multerConfig.fields([
    { name: 'gst_certificate', maxCount: 1 },
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'company_logo', maxCount: 1 }
  ]),
  companyController.updateCompanyProfile
);

// PROFILE STATUS
router.get("/profile-status", verifyToken, companyController.getProfileStatus);

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