import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  const load = () => {
    api.get("/collections/mine").then(({ data }) => setCollections(data.collections)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await api.post("/collections", { name: newName.trim() });
    setNewName("");
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-3xl mb-1">
        <span className="text-gradient font-semibold">Your Collections</span>
      </h1>
      <p className="text-ink/60 font-body text-sm mb-6">Folders for organizing the art you love.</p>

      <form onSubmit={create} className="flex gap-2 mb-8 max-w-sm">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection name"
          className="flex-1 border border-ink/20 px-3 py-2 bg-surface text-sm rounded focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
        />
        <button className="bg-paint-gradient text-white px-4 py-2 rounded text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
          Create
        </button>
      </form>

      {loading ? (
        <p className="text-ink/50 font-body">Loading...</p>
      ) : collections.length === 0 ? (
        <p className="text-ink/50 font-body">No collections yet — create your first one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
            >
              <Link
                to={`/collections/${c._id}`}
                className="art-card block bg-surface border border-ink/10 rounded-sm overflow-hidden"
              >
                <div className="grid grid-cols-2 aspect-square bg-canvasSoft">
                  {c.posts.slice(0, 4).map((p) => (
                    <img key={p._id} src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ))}
                </div>
                <div className="p-3 font-body">
                  <p className="font-display font-semibold text-ink">{c.name}</p>
                  <p className="text-ink/50 text-xs font-mono">{c.posts.length} artworks</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collections;
