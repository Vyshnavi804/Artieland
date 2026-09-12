import express from "express";
import Collection from "../models/Collection.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/collections/mine - my collections (with post counts + cover image)
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.userId })
      .populate("posts", "images title")
      .sort({ createdAt: -1 });
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ message: "Could not load collections", error: err.message });
  }
});

// POST /api/collections - create a new collection
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required" });
    }
    const collection = await Collection.create({ user: req.userId, name: name.trim() });
    res.status(201).json({ collection });
  } catch (err) {
    res.status(500).json({ message: "Could not create collection", error: err.message });
  }
});

// GET /api/collections/:id - a single collection (only the owner can view for now)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.userId }).populate({
      path: "posts",
      populate: { path: "user", select: "username profilePic" },
    });
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    res.json({ collection });
  } catch (err) {
    res.status(500).json({ message: "Could not load collection", error: err.message });
  }
});

// POST /api/collections/:id/posts - add a post to a collection
router.post("/:id/posts", requireAuth, async (req, res) => {
  try {
    const { postId } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, user: req.userId });
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    if (!collection.posts.some((p) => p.toString() === postId)) {
      collection.posts.push(postId);
      await collection.save();
    }
    res.json({ collection });
  } catch (err) {
    res.status(500).json({ message: "Could not add to collection", error: err.message });
  }
});

// DELETE /api/collections/:id/posts/:postId - remove a post from a collection
router.delete("/:id/posts/:postId", requireAuth, async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.userId });
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    collection.posts.pull(req.params.postId);
    await collection.save();
    res.json({ collection });
  } catch (err) {
    res.status(500).json({ message: "Could not remove from collection", error: err.message });
  }
});

// DELETE /api/collections/:id - delete a whole collection
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    res.json({ message: "Collection deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete collection", error: err.message });
  }
});

export default router;
