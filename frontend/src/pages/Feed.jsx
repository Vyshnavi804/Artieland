import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api.js";
import PostCard from "../components/PostCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import TrendingTags from "../components/TrendingTags.jsx";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get("tag");

  useEffect(() => {
    setLoading(true);
    const params = tag ? { tag } : {};
    api
      .get("/posts", { params })
      .then(({ data }) => setPosts(data.posts))
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink">
          {tag ? (
            <>
              Artwork tagged <span className="text-gradient font-semibold">#{tag}</span>
            </>
          ) : (
            <span className="text-gradient font-semibold">The Gallery Wall</span>
          )}
        </h1>
        <p className="text-ink/60 font-body text-sm mt-1">
          Fresh work from artists on ArtieLand.
        </p>
      </div>

      {!tag && <TrendingTags />}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-ink/50 font-body">
          Nothing here yet — be the first to post something.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <PostCard key={post._id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
