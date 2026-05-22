const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const driveController = require("../controllers/drive.controller");

// Create round
router.post("/round/create", verifyToken, driveController.createRound);

// Get rounds
router.get("/round/:drive_id", verifyToken, driveController.getDriveRounds);

// Update round
router.put("/round/update/:round_id", verifyToken, driveController.updateRound);

// Delete round
router.delete("/round/:round_id", verifyToken, driveController.deleteRound);

module.exports = router;