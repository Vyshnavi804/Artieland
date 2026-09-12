import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import CommentSection from "../components/CommentSection.jsx";
import CollectionPicker from "../components/CollectionPicker.jsx";
import ReactionPicker from "../components/ReactionPicker.jsx";
import ArtImage from "../components/ArtImage.jsx";
import BackButton from "../components/BackButton.jsx";

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = () => {
    api.get(`/posts/${id}`).then(({ data }) => setPost(data.post));
  };

  useEffect(load, [id]);

  const toggleLike = async () => {
    if (!user) return;
    await api.post(`/posts/${id}/like`);
    load();
  };

  const toggleSave = async () => {
    if (!user) return;
    await api.post(`/posts/${id}/save`);
    load();
  };

  const rate = async (stars) => {
    if (!user) return;
    setMyRating(stars);
    await api.post(`/posts/${id}/rate`, { stars });
    load();
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard");
    } catch {
      showToast(url);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Delete this artwork? This can't be undone.")) return;
    try {
      await api.delete(`/posts/${id}`);
      showToast("Post deleted");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete post — try logging in again");
    }
  };

  if (!post) return <p className="max-w-3xl mx-auto px-6 py-10 text-ink/50 font-body">Loading...</p>;

  const liked = user ? post.likes.includes(user.id) : false;
  const saved = user ? post.savedBy?.includes(user.id) : false;
  const isOwner = user && user.username === post.user.username;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-6 py-10"
    >
      <BackButton />

      <div className="border-[3px] border-ink p-1 mb-4 aspect-square">
        <div className="border border-ink/30 w-full h-full">
          <ArtImage src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">{post.title}</h1>
          <Link to={`/profile/${post.user.username}`} className="text-ink/60 hover:text-violet font-body">
            by {post.user.username}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-ink/40 mt-2">{post.category}</span>
          {isOwner && (
            <>
              <Link to={`/post/${id}/edit`} className="text-xs font-mono text-violet hover:underline mt-2">
                edit
              </Link>
              <button onClick={deletePost} className="text-xs font-mono text-alizarin hover:underline mt-2">
                delete
              </button>
            </>
          )}
        </div>
      </div>

      {post.description && (
        <p className="text-ink/80 font-body mt-3 leading-relaxed">{post.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-6 mt-4 font-body">
        <motion.button
          onClick={toggleLike}
          whileTap={{ scale: 0.85 }}
          className={`flex items-center gap-1 text-lg ${liked ? "text-alizarin" : "text-ink/50"} hover:text-alizarin`}
        >
          {liked ? "♥" : "♡"} <span className="text-sm font-mono">{post.likes.length} likes</span>
        </motion.button>

        <ReactionPicker post={post} />

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => rate(n)}
              className={`text-lg ${n <= myRating ? "text-cadmium" : "text-ink/20"} hover:text-cadmium`}
            >
              ★
            </button>
          ))}
          <span className="text-sm font-mono text-ink/50 ml-1">
            {post.averageRating ? post.averageRating.toFixed(1) : "—"} avg
          </span>
        </div>

        <motion.button
          onClick={toggleSave}
          whileTap={{ scale: 0.85 }}
          className={`text-lg ${saved ? "text-cadmium" : "text-ink/40"} hover:text-cadmium`}
          title="Save"
        >
          {saved ? "🔖" : "📑"}
        </motion.button>

        {user && (
          <button
            onClick={() => setPickerOpen(true)}
            className="text-ink/50 hover:text-violet text-sm font-mono"
          >
            + collection
          </button>
        )}

        <button onClick={share} className="text-ink/50 hover:text-sage text-sm font-mono">
          share
        </button>
      </div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
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

      <hr className="my-6 border-ink/10" />

      <CommentSection postId={id} />

      {pickerOpen && <CollectionPicker postId={id} onClose={() => setPickerOpen(false)} />}
    </motion.div>
  );
};

export default PostDetail;
