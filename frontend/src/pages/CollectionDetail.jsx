import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import PostCard from "../components/PostCard.jsx";

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get(`/collections/${id}`)
      .then(({ data }) => setCollection(data.collection))
      .catch(() => setCollection(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const deleteCollection = async () => {
    if (!window.confirm("Delete this collection? Posts inside will stay in your gallery.")) return;
    await api.delete(`/collections/${id}`);
    navigate("/collections");
  };

  const removePost = async (postId) => {
    await api.delete(`/collections/${id}/posts/${postId}`);
    load();
  };

  if (loading) return <p className="max-w-5xl mx-auto px-6 py-10 text-ink/50 font-body">Loading...</p>;
  if (!collection) return <p className="max-w-5xl mx-auto px-6 py-10 text-ink/50 font-body">Collection not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-3xl">
          <span className="text-gradient font-semibold">{collection.name}</span>
        </h1>
        <button onClick={deleteCollection} className="text-alizarin text-sm font-body hover:underline">
          Delete collection
        </button>
      </div>
      <p className="text-ink/60 font-body text-sm mb-6">{collection.posts.length} artworks</p>

      {collection.posts.length === 0 ? (
        <p className="text-ink/50 font-body">
          Nothing in this collection yet — use "+ collection" on any post to add it here.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.posts.map((post, i) => (
            <div key={post._id} className="relative">
              <PostCard post={post} index={i} />
              <button
                onClick={() => removePost(post._id)}
                className="absolute top-2 left-2 bg-ink/70 text-canvas text-xs px-2 py-1 rounded-full hover:bg-alizarin"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetail;
