import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api.js";

const MESSAGES = {
  like: (n) => `${n.actor.username} liked your artwork`,
  comment: (n) => `${n.actor.username} commented on your post`,
  follow: (n) => `${n.actor.username} started following you`,
  reaction: (n) => `${n.actor.username} appreciated your artwork`,
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = () => {
    api.get("/notifications").then(({ data }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // light polling, no websockets needed for Phase 3
    return () => clearInterval(interval);
  }, []);

  const openPanel = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button onClick={openPanel} className="relative w-8 h-8 flex items-center justify-center text-ink/70 hover:text-violet" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-alizarin text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-surface border border-ink/10 rounded-lg shadow-xl z-30"
          >
            {notifications.length === 0 ? (
              <p className="text-ink/50 text-sm p-4 font-body">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to={n.post ? `/post/${n.post._id}` : `/profile/${n.actor.username}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 border-b border-ink/5 last:border-0 hover:bg-canvasSoft text-sm font-body text-ink"
                >
                  {MESSAGES[n.type] ? MESSAGES[n.type](n) : "New activity"}
                  <span className="block text-xs text-ink/40 font-mono mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
