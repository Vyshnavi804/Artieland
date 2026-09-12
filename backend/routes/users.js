import express from "express";
import multer from "multer";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { getLevel, calculatePoints, calculateBadges } from "../utils/gamification.js";
import { notify } from "../utils/notify.js";
import { avatarStorage } from "../config/cloudinary.js";

const router = express.Router();

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// GET /api/users/:username - public profile
router.get("/:username", optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
    const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalRatings = posts.reduce((sum, p) => sum + p.ratings.length, 0);
    const points = calculatePoints({ postCount: posts.length, totalLikes, totalRatings });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
        favoriteStyle: user.favoriteStyle,
        instagram: user.instagram,
        website: user.website,
        location: user.location,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        isFollowedByMe: req.userId ? user.followers.some((f) => f.toString() === req.userId) : false,
        isMe: req.userId === user._id.toString(),
      },
      stats: {
        postCount: posts.length,
        totalLikes,
        level: getLevel(points),
        points,
        badges: calculateBadges({ postCount: posts.length, totalLikes, posts }),
      },
      posts,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load profile", error: err.message });
  }
});

// PUT /api/users/me/update - update my own profile
router.put("/me/update", requireAuth, async (req, res) => {
  try {
    const { bio, profilePic, favoriteStyle, instagram, website, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { bio, profilePic, favoriteStyle, instagram, website, location } },
      { new: true }
    ).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Could not update profile", error: err.message });
  }
});

// POST /api/users/me/avatar - upload a new profile picture
router.post("/me/avatar", requireAuth, avatarUpload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const profilePic = req.file.path;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profilePic } },
      { new: true }
    ).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Could not upload avatar", error: err.message });
  }
});

// POST /api/users/:username/follow - toggle follow
router.post("/:username/follow", requireAuth, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const alreadyFollowing = targetUser.followers.some((f) => f.toString() === req.userId);

    if (alreadyFollowing) {
      targetUser.followers.pull(req.userId);
      await targetUser.save();
      await User.findByIdAndUpdate(req.userId, { $pull: { following: targetUser._id } });
    } else {
      targetUser.followers.push(req.userId);
      await targetUser.save();
      await User.findByIdAndUpdate(req.userId, { $addToSet: { following: targetUser._id } });
      await notify({ recipient: targetUser._id, actor: req.userId, type: "follow" });
    }

    res.json({ following: !alreadyFollowing, followerCount: targetUser.followers.length });
  } catch (err) {
    res.status(500).json({ message: "Could not update follow status", error: err.message });
  }
});

export default router;
