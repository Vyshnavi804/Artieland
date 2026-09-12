import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ bio: "", favoriteStyle: "", instagram: "", website: "", location: "" });
  const [profilePic, setProfilePic] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.get(`/users/${user.username}`).then(({ data }) => {
      setForm({
        bio: data.user.bio || "",
        favoriteStyle: data.user.favoriteStyle || "",
        instagram: data.user.instagram || "",
        website: data.user.website || "",
        location: data.user.location || "",
      });
      setProfilePic(data.user.profilePic || "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setProfilePic(data.user.profilePic);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/users/me/update", form);
      navigate(`/profile/${user.username}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <BackButton />
      <h1 className="font-display text-3xl mb-6">
        <span className="text-gradient font-semibold">Edit your profile</span>
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-canvasSoft overflow-hidden flex items-center justify-center shrink-0">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-ink/40">{user?.username?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="text-sm font-body text-violet hover:underline"
          >
            Change profile picture
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-body">
        <div>
          <label className="block text-sm text-ink/60 mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={300}
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/60 mb-1">Favorite art style</label>
          <input
            value={form.favoriteStyle}
            onChange={(e) => setForm({ ...form, favoriteStyle: e.target.value })}
            placeholder="e.g. Watercolor landscapes"
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/60 mb-1">Instagram</label>
          <input
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="@yourhandle"
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/60 mb-1">Website</label>
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://yourportfolio.com"
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/60 mb-1">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="City, Country"
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
        </div>

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

export default EditProfile;
