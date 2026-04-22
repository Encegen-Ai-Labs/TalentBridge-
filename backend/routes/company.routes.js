const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const companyController = require("../controllers/company.controller");

// COMPANY PROFILE
router.post("/profile", verifyToken, companyController.createCompanyProfile);

// APPLICANTS
router.get("/applicants", verifyToken, companyController.getCompanyApplicants);

// UPDATE STATUS
router.put("/:application_id/status", verifyToken, companyController.updateApplicationStatus);

// INVITES
router.get("/invites", verifyToken, companyController.getCompanyInvites);

// ACCEPT
router.post("/accept-invite", verifyToken, companyController.acceptInvite);

// REJECT
router.post("/reject-invite", verifyToken, companyController.rejectInvite);

module.exports = router;