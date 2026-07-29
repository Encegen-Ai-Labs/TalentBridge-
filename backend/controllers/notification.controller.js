const db = require("../config/db");

exports.getNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const [notifications] = await db.promise().query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    const unread_count = notifications.filter(n => !n.is_read).length;
    res.status(200).json({ notifications, unread_count });
  } catch (err) {
    console.error("Error in getNotifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { notification_id } = req.params;
    await db.promise().query(
      "UPDATE notifications SET is_read = true WHERE notification_id = ? AND user_id = ?",
      [notification_id, user_id]
    );
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Error in markAsRead:", err);
    res.status(500).json({ message: "Failed to mark notification as read", error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    await db.promise().query(
      "UPDATE notifications SET is_read = true WHERE user_id = ?",
      [user_id]
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error in markAllAsRead:", err);
    res.status(500).json({ message: "Failed to mark all as read", error: err.message });
  }
};
