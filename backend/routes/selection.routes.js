const express = require("express");
const router = express.Router();

const controller = require("../controllers/selection.controller");
const verifyToken = require("../middleware/auth.middleware");

// view applicants
router.get("/applicants/:job_id", verifyToken, controller.getApplicants);

// update round
router.put("/update-status", verifyToken, controller.updateRoundStatus);

module.exports = router;