import { useState } from "react";
import api from "../api/api.js";
import BackButton from "../components/BackButton.jsx";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/messages", form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <BackButton />
      <h1 className="font-display text-3xl mb-1">
        <span className="text-gradient font-semibold">Get in touch</span>
      </h1>
      <p className="text-ink/60 font-body text-sm mb-6">
        Questions, feedback, or something not working right? Send us a note.
      </p>

      {status === "sent" ? (
        <p className="text-sage font-body">Thanks — your message has been sent!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-body">
          <input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
            required
          />
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
            required
          />
          <textarea
            placeholder="Your message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-ink/20 px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
            required
          />

          {status === "error" && <p className="text-alizarin text-sm">Something went wrong — please try again.</p>}

          <button
            disabled={status === "sending"}
            className="w-full bg-paint-gradient text-white py-2 font-medium shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
