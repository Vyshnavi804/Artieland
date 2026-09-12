import mongoose from "mongoose";

const CATEGORIES = [
  "Sketch",
  "Painting",
  "Digital Art",
  "Watercolor",
  "Pencil",
  "Charcoal",
  "Mandala",
  "Anime",
  "Sculpture",
];

const REACTION_TYPES = ["amazing", "creative", "inspiring", "beautiful_colors"];

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String, required: true }],
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, enum: CATEGORIES, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        stars: { type: Number, min: 1, max: 5 },
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: REACTION_TYPES },
      },
    ],
  },
  { timestamps: true }
);

postSchema.virtual("averageRating").get(function () {
  if (!this.ratings.length) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.stars, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export const POST_CATEGORIES = CATEGORIES;
export const REACTION_LABELS = {
  amazing: "👏 Amazing",
  creative: "🎨 Creative",
  inspiring: "🔥 Inspiring",
  beautiful_colors: "✨ Beautiful Colors",
};
export default mongoose.model("Post", postSchema);
