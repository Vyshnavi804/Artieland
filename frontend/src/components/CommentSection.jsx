import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const load = () => {
    api.get(`/comments/${postId}`).then(({ data }) => setComments(data.comments));
  };

  useEffect(load, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/comments/${postId}`, { text, parentComment: replyTo });
    setText("");
    setReplyTo(null);
    load();
  };

  const removeComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    await api.delete(`/comments/${postId}/${commentId}`);
    load();
  };

  // Newest first at the top level; replies stay in chronological order under their parent.
  const topLevel = comments
    .filter((c) => !c.parentComment)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const repliesFor = (id) => comments.filter((c) => c.parentComment === id);

  const CommentRow = ({ comment, isReply }) => {
    const isMine = user && comment.user._id === user.id;
    return (
      <div className={isReply ? "ml-8 mt-2" : "mt-4"}>
        <div className="flex items-start gap-2">
          <Link to={`/profile/${comment.user.username}`} className="font-medium text-ink text-sm hover:text-ultramarine">
            {comment.user.username}
          </Link>
          <span className="text-ink/80 text-sm font-body">{comment.text}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {user && !isReply && (
            <button
              onClick={() => setReplyTo(comment._id)}
              className="text-xs text-ink/40 hover:text-ultramarine"
            >
              Reply
            </button>
          )}
          {isMine && (
            <button
              onClick={() => removeComment(comment._id)}
              className="text-xs text-ink/40 hover:text-alizarin"
            >
              Delete
            </button>
          )}
        </div>
        {repliesFor(comment._id).map((r) => (
          <CommentRow key={r._id} comment={r} isReply />
        ))}
      </div>
    );
  };

  return (
    <div className="font-body">
      <h3 className="font-display text-lg text-ink mb-2">Comments</h3>

      {topLevel.length === 0 && <p className="text-ink/50 text-sm">No comments yet.</p>}
      {topLevel.map((c) => (
        <CommentRow key={c._id} comment={c} />
      ))}

      {user ? (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
            className="flex-1 border border-ink/20 px-3 py-1.5 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
          <button className="bg-paint-gradient text-white px-4 py-1.5 text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
            {replyTo ? "Reply" : "Post"}
          </button>
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-ink/40 text-sm px-2"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        <p className="text-sm text-ink/50 mt-4">
          <Link to="/login" className="text-ultramarine hover:underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}
    </div>
  );
};

export default CommentSection;
