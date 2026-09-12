import express from "express";
import multer from "multer";
import { postImageStorage } from "../config/cloudinary.js";
import Post, { POST_CATEGORIES, REACTION_LABELS } from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Collection from "../models/Collection.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

// --- Image upload setup: images are stored on Cloudinary, not the server's disk,
// so they survive restarts/redeploys on hosting platforms with ephemeral filesystems. ---
const upload = multer({
  storage: postImageStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// GET /api/posts/categories - list valid categories (handy for frontend dropdown)
router.get("/categories", (req, res) => res.json({ categories: POST_CATEGORIES }));

// GET /api/posts/tags/trending - most-used tags across all posts
router.get("/tags/trending", async (req, res) => {
  try {
    const results = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ tags: results.map((r) => ({ tag: r._id, count: r.count })) });
  } catch (err) {
    res.status(500).json({ message: "Could not load trending tags", error: err.message });
  }
});

// GET /api/posts - feed (everyone's posts, newest first)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { tag, category, following } = req.query;
    const filter = {};
    if (tag) filter.tags = tag.toLowerCase();
    if (category) filter.category = category;

    if (following === "true" && req.userId) {
      const me = await User.findById(req.userId);
      filter.user = { $in: [...me.following, me._id] };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username profilePic")
      .limit(50);

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Could not load feed", error: err.message });
  }
});

// GET /api/posts/search?q=...
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ posts: [], users: [] });

    const posts = await Post.find({
      $or: [{ title: { $regex: q, $options: "i" } }, { tags: q.toLowerCase() }],
    })
      .populate("user", "username profilePic")
      .limit(30);

    const users = await User.find({ username: { $regex: q, $options: "i" } })
      .select("username profilePic bio")
      .limit(10);

    res.json({ posts, users });
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

// GET /api/posts/:id - single post
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "username profilePic");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: "Could not load post", error: err.message });
  }
});

// POST /api/posts - create a post (up to 4 images)
router.post("/", requireAuth, upload.array("images", 4), async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const tagArray = tags
      ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const post = await Post.create({
      user: req.userId,
      images: req.files.map((f) => f.path),
      title,
      description,
      category,
      tags: tagArray,
    });

    const populated = await post.populate("user", "username profilePic");
    res.status(201).json({ post: populated });
  } catch (err) {
    res.status(500).json({ message: "Could not create post", error: err.message });
  }
});

// POST /api/posts/:id/like - toggle like
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);
    if (alreadyLiked) {
      post.likes.pull(req.userId);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();
    if (!alreadyLiked) {
      await notify({ recipient: post.user, actor: req.userId, type: "like", post: post._id });
    }
    res.json({ liked: !alreadyLiked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Could not update like", error: err.message });
  }
});

// POST /api/posts/:id/rate - rate 1-5 stars (one rating per user, updates if exists)
router.post("/:id/rate", requireAuth, async (req, res) => {
  try {
    const { stars } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Stars must be between 1 and 5" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = post.ratings.find((r) => r.user.toString() === req.userId);
    if (existing) {
      existing.stars = stars;
    } else {
      post.ratings.push({ user: req.userId, stars });
    }
    await post.save();
    res.json({ averageRating: post.averageRating, ratingCount: post.ratings.length });
  } catch (err) {
    res.status(500).json({ message: "Could not submit rating", error: err.message });
  }
});

// POST /api/posts/:id/save - toggle bookmark
router.post("/:id/save", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadySaved = post.savedBy.some((id) => id.toString() === req.userId);
    if (alreadySaved) {
      post.savedBy.pull(req.userId);
    } else {
      post.savedBy.push(req.userId);
    }
    await post.save();
    res.json({ saved: !alreadySaved });
  } catch (err) {
    res.status(500).json({ message: "Could not update save", error: err.message });
  }
});

// GET /api/posts/saved/mine - all posts I've bookmarked
router.get("/saved/mine", requireAuth, async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.userId })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Could not load saved artwork", error: err.message });
  }
});

// PUT /api/posts/:id - edit a post (owner only). New images are optional; if provided, they replace the old ones.
router.put("/:id", requireAuth, upload.array("images", 4), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const { title, description, category, tags } = req.body;
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) {
      post.tags = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (req.files && req.files.length > 0) {
      post.images = req.files.map((f) => f.path);
    }

    await post.save();
    const populated = await post.populate("user", "username profilePic");
    res.json({ post: populated });
  } catch (err) {
    res.status(500).json({ message: "Could not update post", error: err.message });
  }
});

// DELETE /api/posts/:id - delete a post (owner only), cleaning up comments and collection references
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await Comment.deleteMany({ post: post._id });
    await Collection.updateMany({ posts: post._id }, { $pull: { posts: post._id } });
    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete post", error: err.message });
  }
});

// POST /api/posts/:id/react - set/toggle an appreciation reaction (one per user; picking the
// same type again removes it, picking a different type switches it)
router.post("/:id/react", requireAuth, async (req, res) => {
  try {
    const { type } = req.body;
    if (!REACTION_LABELS[type]) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingIndex = post.reactions.findIndex((r) => r.user.toString() === req.userId);
    let isNewReaction = false;
    if (existingIndex >= 0 && post.reactions[existingIndex].type === type) {
      post.reactions.splice(existingIndex, 1);
    } else if (existingIndex >= 0) {
      post.reactions[existingIndex].type = type;
    } else {
      post.reactions.push({ user: req.userId, type });
      isNewReaction = true;
    }

    await post.save();
    if (isNewReaction) {
      await notify({ recipient: post.user, actor: req.userId, type: "reaction", post: post._id });
    }

    const counts = {};
    post.reactions.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    res.json({ reactions: counts, myReaction: post.reactions.find((r) => r.user.toString() === req.userId)?.type || null });
  } catch (err) {
    res.status(500).json({ message: "Could not update reaction", error: err.message });
  }
});

export default router;
