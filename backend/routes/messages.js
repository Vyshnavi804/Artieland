import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// POST /api/messages - submit a contact form message
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    await Message.create({ name, email, subject, message });
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    res.status(500).json({ message: "Could not send message", error: err.message });
  }
});

export default router;
