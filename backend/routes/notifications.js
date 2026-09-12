import express from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notifications - mine, newest first
router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("actor", "username profilePic")
      .populate("post", "title images")
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ recipient: req.userId, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Could not load notifications", error: err.message });
  }
});

// POST /api/notifications/read-all - mark everything as read
router.post("/read-all", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.userId, read: false }, { $set: { read: true } });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Could not update notifications", error: err.message });
  }
});

export default router;
