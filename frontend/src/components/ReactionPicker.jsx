import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const REACTIONS = [
  { type: "amazing", emoji: "👏", label: "Amazing" },
  { type: "creative", emoji: "🎨", label: "Creative" },
  { type: "inspiring", emoji: "🔥", label: "Inspiring" },
  { type: "beautiful_colors", emoji: "✨", label: "Beautiful Colors" },
];

const initialCounts = (reactions = []) => {
  const c = {};
  reactions.forEach((r) => {
    c[r.type] = (c[r.type] || 0) + 1;
  });
  return c;
};

// Small popover of "appreciation" reactions - a step up from a plain Like.
const ReactionPicker = ({ post }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState(() => initialCounts(post.reactions));
  const [mine, setMine] = useState(() =>
    user ? post.reactions?.find((r) => (r.user?._id || r.user) === user.id)?.type || null : null
  );

  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  const pick = async (type) => {
    if (!user) return;
    const { data } = await api.post(`/posts/${post._id}/react`, { type });
    setCounts(data.reactions);
    setMine(data.myReaction);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => user && setOpen((o) => !o)}
        className={`text-xs font-mono ${mine ? "text-violet" : "text-ink/40"} hover:text-violet`}
        title="Appreciate this artwork"
      >
        {mine ? REACTIONS.find((r) => r.type === mine)?.emoji : "👏"} {total > 0 && total}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 bg-surface border border-ink/10 rounded-full shadow-lg px-2 py-1.5 flex gap-1 z-20"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => pick(r.type)}
                title={r.label}
                className={`text-lg hover:scale-125 transition-transform ${mine === r.type ? "scale-125" : ""}`}
              >
                {r.emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionPicker;
