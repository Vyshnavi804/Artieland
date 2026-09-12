import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "", tags: "" });
  const [existingImage, setExistingImage] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    Promise.all([api.get("/posts/categories"), api.get(`/posts/${id}`)]).then(([catRes, postRes]) => {
      const post = postRes.data.post;
      if (post.user.username !== user.username) {
        navigate(`/post/${id}`);
        return;
      }
      setCategories(catRes.data.categories);
      setForm({
        title: post.title,
        description: post.description || "",
        category: post.category,
        tags: post.tags.join(", "),
      });
      setExistingImage(post.images[0]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("tags", form.tags);
      newFiles.forEach((f) => formData.append("images", f));

      await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="max-w-lg mx-auto px-6 py-10 text-ink/50 font-body">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <BackButton />
      <h1 className="font-display text-3xl mb-6">
        <span className="text-gradient font-semibold">Edit artwork</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 font-body">
        <div>
          <label className="block text-sm text-ink/60 mb-1">Current image</label>
          <img src={existingImage} alt="Current artwork" className="w-32 h-32 object-cover border border-ink/10" />
        </div>

        <div>
          <label className="block text-sm text-ink/60 mb-1">Replace image (optional, up to 4)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewFiles(Array.from(e.target.files).slice(0, 4))}
            className="w-full text-sm"
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
          placeholder="Description"
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
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          placeholder="Tags, comma separated"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
        />

        {error && <p className="text-alizarin text-sm">{error}</p>}

        <button
          disabled={saving}
          className="w-full bg-paint-gradient text-white py-2 font-medium shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default EditPost;
