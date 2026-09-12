import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";

const TrendingTags = () => {
  const [tags, setTags] = useState(null);

  useEffect(() => {
    api.get("/posts/tags/trending").then(({ data }) => setTags(data.tags));
  }, []);

  if (tags && tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 font-body">
      <span className="text-ink/50 text-sm">Trending:</span>
      {!tags
        ? Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="skeleton h-6 w-16 rounded-full inline-block" />
          ))
        : tags.map(({ tag, count }) => (
            <Link
              key={tag}
              to={`/?tag=${tag}`}
              className="text-xs font-mono bg-surface border border-ink/10 px-3 py-1 rounded-full text-violet hover:bg-paint-gradient hover:text-white transition-colors"
            >
              #{tag} <span className="opacity-60">({count})</span>
            </Link>
          ))}
    </div>
  );
};

export default TrendingTags;
