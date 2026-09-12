import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/api.js";
import PostCard from "../components/PostCard.jsx";
import BackButton from "../components/BackButton.jsx";
import { highlightMatch } from "../utils/highlight.jsx";

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    api.get("/posts/search", { params: { q } }).then(({ data }) => setResults(data)).finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <BackButton />
      <h1 className="font-display text-2xl text-ink mb-6">
        Results for <span className="text-ultramarine">"{q}"</span>
      </h1>

      {loading ? (
        <p className="text-ink/50 font-body">Searching...</p>
      ) : (
        <>
          {results.users.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-lg text-ink mb-3">Artists</h2>
              <div className="flex flex-wrap gap-3">
                {results.users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className="border border-ink/15 bg-surface px-4 py-2 hover:border-ultramarine font-body text-sm"
                  >
                    {highlightMatch(u.username, q)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <h2 className="font-display text-lg text-ink mb-3">Artwork</h2>
          {results.posts.length === 0 ? (
            <p className="text-ink/50 font-body">No artwork found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.posts.map((post, i) => (
                <div key={post._id}>
                  <PostCard post={post} index={i} />
                  <p className="text-xs text-ink/50 font-body px-1 mt-1">
                    {highlightMatch(post.title, q)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
