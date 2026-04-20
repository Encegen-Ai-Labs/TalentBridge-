const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const companyController = require("../controllers/company.controller");


// Create company profile
router.post("/profile", verifyToken, companyController.createCompanyProfile);

// Company applicants
router.get("/applicants", verifyToken, companyController.getCompanyApplicants);
module.exports = router;

// Update status
router.put(
  "/:application_id/status",
  verifyToken,
  companyController.updateApplicationStatus
);
module.exports = router;