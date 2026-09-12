import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import CollectionPicker from "./CollectionPicker.jsx";
import ReactionPicker from "./ReactionPicker.jsx";
import ArtImage from "./ArtImage.jsx";

const CATEGORY_COLORS = {
  Sketch: "#A78BFA",
  Painting: "#FF5C6C",
  "Digital Art": "#4C5FFF",
  Watercolor: "#22B8CF",
  Pencil: "#6B6B76",
  Charcoal: "#4A4458",
  Mandala: "#C147E9",
  Anime: "#FF7AB6",
  Sculpture: "#FFB627",
};

const PostCard = ({ post, index = 0, onChange }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(user ? post.likes?.includes(user.id) : false);
  const [saved, setSaved] = useState(user ? post.savedBy?.includes(user.id) : false);
  const [pop, setPop] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const toggleLike = async () => {
    if (!user) return;
    const { data } = await api.post(`/posts/${post._id}/like`);
    setLiked(data.liked);
    setLikeCount(data.likeCount);
    if (data.liked) {
      setPop(true);
      setTimeout(() => setPop(false), 350);
    }
    if (onChange) onChange();
  };

  const toggleSave = async () => {
    if (!user) return;
    const { data } = await api.post(`/posts/${post._id}/save`);
    setSaved(data.saved);
  };

  const share = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard");
    } catch {
      showToast(url);
    }
  };

  const dabColor = CATEGORY_COLORS[post.category] || "#4C5FFF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
      className="art-card bg-surface p-3 pb-4 shadow-sm border border-ink/10 relative rounded-sm"
    >
      {/* museum-frame double border around the artwork */}
      <div className="border-[3px] border-ink p-1">
        <div className="border border-ink/30 aspect-square">
          <Link to={`/post/${post._id}`} className="block w-full h-full">
            <ArtImage src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>

      {/* paint-dab category badge, sits on the frame's corner */}
      <div
        className="absolute top-5 right-5 w-9 h-9 rounded-full border-2 border-canvas shadow flex items-center justify-center"
        style={{ backgroundColor: dabColor }}
        title={post.category}
      >
        <span className="sr-only">{post.category}</span>
      </div>

      <div className="pt-3 px-1 font-body">
        <Link to={`/post/${post._id}`} className="font-display font-semibold text-ink text-lg leading-tight">
          {post.title}
        </Link>
        <Link
          to={`/profile/${post.user?.username}`}
          className="block text-sm text-ink/60 hover:text-violet mt-0.5"
        >
          by {post.user?.username}
        </Link>

        <div className="flex items-center justify-between mt-2 text-sm">
          <motion.button
            onClick={toggleLike}
            whileTap={{ scale: 0.85 }}
            className={`flex items-center gap-1 ${liked ? "text-alizarin" : "text-ink/50"} hover:text-alizarin`}
          >
            <span className={pop ? "heart-pop inline-block" : "inline-block"}>{liked ? "♥" : "♡"}</span>
            <span className="font-mono">{likeCount}</span>
          </motion.button>

          <span className="flex items-center gap-1 text-cadmium font-mono">
            ★ {post.averageRating ? post.averageRating.toFixed(1) : "—"}
          </span>

          <ReactionPicker post={post} />

          <Link to={`/post/${post._id}`} className="text-ink/50 hover:text-violet font-mono">
            comments
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <motion.button
            onClick={toggleSave}
            whileTap={{ scale: 0.85 }}
            className={`${saved ? "text-cadmium" : "text-ink/40"} hover:text-cadmium`}
            title="Save"
          >
            {saved ? "🔖" : "📑"}
          </motion.button>

          {user && (
            <button
              onClick={() => setPickerOpen(true)}
              className="text-ink/40 hover:text-violet text-xs font-mono"
              title="Add to collection"
            >
              + collection
            </button>
          )}

          <button onClick={share} className="text-ink/40 hover:text-sage text-xs font-mono ml-auto" title="Share">
            share
          </button>
        </div>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((t) => (
              <Link
                key={t}
                to={`/?tag=${t}`}
                className="text-xs font-mono text-ultramarine/80 hover:text-ultramarine"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {pickerOpen && <CollectionPicker postId={post._id} onClose={() => setPickerOpen(false)} />}
    </motion.div>
  );
};

export default PostCard;
