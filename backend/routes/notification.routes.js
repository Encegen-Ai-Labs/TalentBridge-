const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.get("/", verifyToken, notificationController.getNotifications);
router.put("/read-all", verifyToken, notificationController.markAllAsRead);
router.put("/:notification_id/read", verifyToken, notificationController.markAsRead);

module.exports = router;
