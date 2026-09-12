import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";
import BackButton from "../components/BackButton.jsx";

const Profile = () => {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);

  const load = () => {
    api.get(`/users/${username}`).then(({ data }) => setData(data));
  };

  useEffect(load, [username]);

  const toggleFollow = async () => {
    if (!me) return;
    await api.post(`/users/${username}/follow`);
    load();
  };

  if (!data) return <p className="max-w-4xl mx-auto px-6 py-10 text-ink/50 font-body">Loading...</p>;

  const { user, stats, posts } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <BackButton />
      <div className="border-2 border-ink p-6 flex items-start gap-6 bg-surface">
        <div className="w-24 h-24 rounded-full bg-ink/10 flex items-center justify-center overflow-hidden shrink-0">
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-ink/40">{user.username[0].toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl text-ink">{user.username}</h1>
            {user.isMe ? (
              <Link
                to="/edit-profile"
                className="px-4 py-1.5 text-sm font-medium rounded-full border border-ink/20 text-ink/70 hover:border-violet hover:text-violet"
              >
                Edit profile
              </Link>
            ) : (
              me && (
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    user.isFollowedByMe
                      ? "bg-canvas border border-ink/20 text-ink/70"
                      : "bg-paint-gradient text-white shadow-glow hover:opacity-90 transition-opacity"
                  }`}
                >
                  {user.isFollowedByMe ? "Following" : "Follow"}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono bg-paint-gradient text-white px-2 py-0.5 rounded-full">
              {stats.level}
            </span>
            {user.location && <span className="text-ink/50 text-xs font-body">📍 {user.location}</span>}
          </div>

          {user.favoriteStyle && (
            <p className="text-ultramarine text-sm font-body mt-2">{user.favoriteStyle}</p>
          )}
          {user.bio && <p className="text-ink/70 font-body mt-2 text-sm">{user.bio}</p>}

          <div className="flex gap-3 mt-2 font-body text-sm">
            {user.instagram && (
              <a
                href={`https://instagram.com/${user.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-violet hover:underline"
              >
                Instagram
              </a>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noreferrer" className="text-violet hover:underline">
                Website
              </a>
            )}
          </div>

          {stats.badges?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {stats.badges.map((b) => (
                <span
                  key={b.id}
                  className="text-xs font-body bg-canvasSoft border border-ink/10 px-2 py-1 rounded-full text-ink/70"
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-6 mt-4 font-mono text-sm text-ink/60">
            <span>
              <b className="text-ink">{stats.postCount}</b> artworks
            </span>
            <span>
              <b className="text-ink">{user.followerCount}</b> followers
            </span>
            <span>
              <b className="text-ink">{user.followingCount}</b> following
            </span>
            <span>
              <b className="text-ink">{stats.totalLikes}</b> likes received
            </span>
          </div>
        </div>
      </div>

      <h2 className="font-display text-xl text-ink mt-8 mb-4">Gallery</h2>
      {posts.length === 0 ? (
        <p className="text-ink/50 font-body">No artwork posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <PostCard key={post._id} post={{ ...post, user }} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
