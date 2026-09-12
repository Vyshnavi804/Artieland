import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 px-6">
      <h1 className="font-display text-3xl text-ink mb-1">Join ArtieLand</h1>
      <p className="text-ink/60 mb-6 font-body text-sm">Show your art. Get real feedback.</p>

      <form onSubmit={handleSubmit} className="space-y-4 font-body">
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          required
        />

        {error && <p className="text-alizarin text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-paint-gradient text-white py-2 font-medium shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-4 font-body">
        Already have an account?{" "}
        <Link to="/login" className="text-ultramarine hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
