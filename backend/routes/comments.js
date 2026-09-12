import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

// GET /api/comments/:postId - all comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username profilePic")
      .sort({ createdAt: 1 });
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Could not load comments", error: err.message });
  }
});

// POST /api/comments/:postId - add a comment (or reply, if parentComment is passed)
router.post("/:postId", requireAuth, async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const comment = await Comment.create({
      post: req.params.postId,
      user: req.userId,
      text: text.trim(),
      parentComment: parentComment || null,
    });
    const populated = await comment.populate("user", "username profilePic");

    const post = await Post.findById(req.params.postId).select("user");
    if (post) {
      await notify({ recipient: post.user, actor: req.userId, type: "comment", post: post._id });
    }

    res.status(201).json({ comment: populated });
  } catch (err) {
    res.status(500).json({ message: "Could not add comment", error: err.message });
  }
});

// DELETE /api/comments/:postId/:commentId - delete your own comment (and any replies to it)
router.delete("/:postId/:commentId", requireAuth, async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, post: req.params.postId });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete comment", error: err.message });
  }
});

export default router;
