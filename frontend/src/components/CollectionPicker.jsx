import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api.js";
import { useToast } from "../context/ToastContext.jsx";

// Small popover: pick an existing collection to add a post to, or create a new one on the fly.
const CollectionPicker = ({ postId, onClose }) => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/collections/mine").then(({ data }) => setCollections(data.collections)).finally(() => setLoading(false));
  }, []);

  const addTo = async (collectionId) => {
    await api.post(`/collections/${collectionId}/posts`, { postId });
    showToast("Added to collection");
    onClose();
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data } = await api.post("/collections", { name: newName.trim() });
    await api.post(`/collections/${data.collection._id}/posts`, { postId });
    showToast(`Added to "${newName.trim()}"`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/40 z-40 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface border border-ink/10 rounded-lg shadow-xl w-full max-w-xs p-4 font-body"
        >
          <h3 className="font-display text-lg text-ink mb-3">Save to collection</h3>

          {loading ? (
            <p className="text-ink/50 text-sm">Loading...</p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
              {collections.length === 0 && (
                <p className="text-ink/50 text-sm">No collections yet — create one below.</p>
              )}
              {collections.map((c) => (
                <button
                  key={c._id}
                  onClick={() => addTo(c._id)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-canvasSoft text-sm text-ink"
                >
                  {c.name} <span className="text-ink/40 font-mono text-xs">({c.posts.length})</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={createAndAdd} className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New collection name"
              className="flex-1 border border-ink/20 px-2 py-1.5 bg-surface text-sm rounded focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
            />
            <button className="bg-paint-gradient text-white px-3 py-1.5 rounded text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              Create
            </button>
          </form>

          <button onClick={onClose} className="text-ink/40 hover:text-ink text-sm mt-3">
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CollectionPicker;
