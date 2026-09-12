import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="border-b-2 border-ink/10 bg-canvas/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4 gap-4">
        <Link to="/" className="relative inline-block shrink-0">
          <motion.span
            whileHover={{ scale: 1.04 }}
            className="inline-block font-display italic text-2xl tracking-tight text-gradient font-semibold"
          >
            Artie<span className="not-italic font-bold">Land</span>
          </motion.span>
          <svg
            className="absolute -bottom-1 left-0 w-full"
            height="6"
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
          >
            <path
              d="M0,3 Q25,0 50,3 T100,3"
              fill="none"
              stroke="#FFB627"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.elements.q.value.trim();
            if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
          }}
          className="hidden sm:block flex-1 max-w-xs"
        >
          <input
            name="q"
            placeholder="Search artists, titles, tags..."
            className="w-full px-3 py-1.5 rounded-full border border-ink/15 bg-surface/70 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ultramarine/40"
          />
        </form>

        <nav className="flex items-center gap-3 sm:gap-4 font-body text-sm">
          {user && (
            <>
              <Link to="/saved" className="hidden md:inline text-ink/70 hover:text-violet font-medium">
                Saved
              </Link>
              <Link to="/collections" className="hidden md:inline text-ink/70 hover:text-violet font-medium">
                Collections
              </Link>
              <NotificationBell />
            </>
          )}

          <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.85, rotate: 20 }}
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-full border border-ink/15 flex items-center justify-center text-ink/70 hover:text-violet"
          >
            {dark ? "☀" : "☾"}
          </motion.button>

          {user ? (
            <>
              <Link
                to="/create"
                className="bg-paint-gradient text-white px-4 py-1.5 rounded-full font-medium shadow-glow hover:opacity-90 transition-opacity"
              >
                + New post
              </Link>
              <Link to={`/profile/${user.username}`} className="hidden sm:inline text-ink hover:text-violet font-medium">
                {user.username}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-ink/50 hover:text-alizarin"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink hover:text-violet font-medium">
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-paint-gradient text-white px-4 py-1.5 rounded-full font-medium shadow-glow hover:opacity-90 transition-opacity"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
