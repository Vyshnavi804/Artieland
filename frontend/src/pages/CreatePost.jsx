import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "", tags: "" });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    api.get("/posts/categories").then(({ data }) => setCategories(data.categories));
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (files.length === 0) {
      setError("Please add at least one image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("tags", form.tags);
      files.forEach((f) => formData.append("images", f));

      const { data } = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/post/${data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-ink mb-6">Share your work</h1>

      <form onSubmit={handleSubmit} className="space-y-4 font-body">
        <div>
          <label className="block text-sm text-ink/70 mb-1">Images (up to 4)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 4))}
            className="w-full text-sm"
            required
          />
        </div>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          required
        />

        <textarea
          placeholder="Tell the story behind this piece..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
        />

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          required
        >
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          placeholder="Tags, comma separated (e.g. portrait, oilpainting)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
        />

        {error && <p className="text-alizarin text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-paint-gradient text-white py-2 font-medium shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post artwork"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
