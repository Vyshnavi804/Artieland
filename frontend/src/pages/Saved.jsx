import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.get("/posts/saved/mine").then(({ data }) => setPosts(data.posts)).finally(() => setLoading(false));
  }, [user, navigate]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl mb-1">
        <span className="text-gradient font-semibold">Saved Artwork</span>
      </h1>
      <p className="text-ink/60 font-body text-sm mb-6">Everything you've bookmarked, in one place.</p>

      {loading ? (
        <p className="text-ink/50 font-body">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-ink/50 font-body">Nothing saved yet — tap the bookmark icon on any post.</p>
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

export default Saved;
