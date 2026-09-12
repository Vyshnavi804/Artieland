import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 300 },
    profilePic: { type: String, default: "" },
    favoriteStyle: { type: String, default: "" },
    instagram: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
