# ArtieLand — Phase 1 MVP

Instagram-for-artists. This is a working full-stack app covering:

- Sign up / log in (JWT)
- User profile (pic, username, bio, favorite style, followers/following)
- Post artwork (images, title, description, category, tags)
- Home feed
- Like a post
- Comment + reply to comments
- Follow / unfollow artists
- Search (by username, artwork title, or tag)
- Bonus from Phase 2: star ratings (1–5) are already wired in, since it's the app's signature feature

## Folder structure

```
artieland/
  backend/     Express + MongoDB API
  frontend/    React + Tailwind app
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — get a free connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Create a free cluster, add a database user, and copy the connection string in.
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32`).

Then run:

```bash
npm run dev
```

The API starts on `http://localhost:5000`. Uploaded images are served from `http://localhost:5000/uploads/...`.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. It's already configured (see `vite.config.js`) to proxy `/api` and `/uploads` requests to the backend on port 5000, so no extra config needed.

## How images are stored

Images (both post artwork and profile pictures) are stored on **Cloudinary**, not on the server's disk. This matters because most free hosting platforms (Render, Railway, etc.) wipe local files on every restart or redeploy — local disk storage would work locally but silently lose every uploaded image once deployed.

To set this up:
1. Sign up for a free [Cloudinary](https://cloudinary.com/) account.
2. From your Cloudinary dashboard, copy your **Cloud name**, **API Key**, and **API Secret**.
3. Add them to `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the backend. New uploads will now go straight to Cloudinary — post images land in the `artieland/posts` folder there, profile pictures in `artieland/avatars`.

Posts created before this switch (if any) will still have local `/uploads/...` image paths saved in MongoDB — those will break once deployed, since local files won't be there anymore. Simplest fix: just re-upload/re-post that older artwork after the switch.

## What's deliberately NOT in Phase 1

Per the roadmap: no badges/levels, no challenges, no portfolio auto-page, no commissions, no Google login, no real-time notifications (Socket.IO). Those are Phase 2–4. Adding them later won't require rewriting anything here — the data models (`User`, `Post`, `Comment`) are built to extend.

## Testing it out

1. Start both servers.
2. Go to `http://localhost:5173`, click **Join**, create an account.
3. Click **+ New post**, upload an image, fill in the title/category, post it.
4. Open an incognito window, sign up as a second user, like/comment/rate/follow the first user.

## Phase 3 additions

### Must-haves
- 🗑 **Delete post** — owner-only, confirmation popup, redirects to feed. Cascades: deletes the post's comments and removes it from any collections it was saved into.
- ✏️ **Edit post** — change title, description, category, tags, and optionally replace the images. "edit" link shows only to the post's owner on the post detail page.
- ⬅️ **Back button** — on Post Detail, Profile, and Search pages (`navigate(-1)`).
- 📬 **Contact page** — real page with name/email/subject/message, saved to MongoDB (`Message` model). No admin viewer built yet — messages just accumulate in the `messages` collection for now; query them directly in Atlas if needed.
- 👤 **Edit profile** — bio, favorite style, Instagram, website, location, and a real profile picture upload (stored the same way as post images).

### Nice-to-haves
- ❤️ **Like animation** — heart pops on like, filled vs outline heart.
- 💬 **Comments** — delete your own comments (and any replies to them), newest-first ordering at the top level.
- 🔖 **Save posts** — save/unsave, dedicated Saved page (from Phase 2, unchanged).
- 📂 **Collections** — from Phase 2, unchanged.
- 🔍 **Better search** — matches in artist usernames and post titles are highlighted.
- 🏷 **Trending tags** — top 10 most-used tags shown on the feed, clickable to filter.

### Portfolio-level features
- **Follow/Unfollow** — from Phase 1, unchanged, shown alongside follower/following counts.
- 🔔 **Notifications** — likes, comments, follows, and reactions on your posts. Bell icon with unread badge; polls every 30s (no websockets yet — fine for this scale, worth revisiting if it grows).
- ⏳ **Loading polish** — skeleton cards while the feed loads, images fade in once loaded instead of popping in.
- 🍞 **Toast notifications** — from Phase 2, unchanged (used for share/save confirmations).

### Also added
- 🏆 **Artist levels** — Beginner Artist → Creative Explorer → Master Illustrator → Legendary Artist, computed live from uploads/likes/ratings (not stored, so it's always accurate).
- 🎖 **Achievement badges** — First Upload, 100 Likes, Color Master, Sketch King, Watercolor Expert, Community Favorite — all computed the same way, shown on the profile page.
- 👏 **Appreciation reactions** — Amazing / Creative / Inspiring / Beautiful Colors, a richer alternative to a plain Like. One reaction per user per post.
- 🎨 **Background pattern** — a subtle tiled SVG of brush strokes and paint dabs behind the whole site (very low opacity, doesn't fight with content).

**Not included this round:** monthly art challenges + community voting (explicitly deferred), and an admin panel for managing contact messages or creating challenges later — there's no admin-role system yet, worth adding before either of those go further.

### New backend endpoints
- `PUT /api/posts/:id` — edit a post
- `DELETE /api/posts/:id` — delete a post
- `POST /api/posts/:id/react` — set/toggle an appreciation reaction
- `GET /api/posts/tags/trending` — top 10 tags
- `DELETE /api/comments/:postId/:commentId` — delete your own comment
- `POST /api/users/me/avatar` — upload a new profile picture
- `PUT /api/users/me/update` — now also accepts `instagram`, `website`, `location`
- `POST /api/messages` — contact form submission
- `GET /api/notifications`, `POST /api/notifications/read-all`

- 🌙 **Dark mode** — toggle button (☾/☀) in the navbar. Persisted in localStorage, also respects your OS's dark mode preference on first visit. Implemented via CSS variables, so it applies across the whole app automatically.
- 🔖 **Save/bookmark** — bookmark icon on every post card and post detail page. View everything you've saved under **Saved** in the navbar.
- 📁 **Collections** — organize saved art into named folders. "+ collection" button on any post opens a picker to add it to an existing collection or create a new one on the spot. Manage them under **Collections** in the navbar.
- 🔗 **Share** — "share" button copies a direct link to the post to your clipboard, with a small toast confirmation.
- 🎨 **Animations** — posts fade/slide in with a staggered entrance, cards lift on hover, the like button pops when you like something, and modals/popovers animate in smoothly (via `framer-motion`).

### New backend endpoints
- `POST /api/posts/:id/save` — toggle bookmark
- `GET /api/posts/saved/mine` — your saved posts
- `GET /api/collections/mine` — your collections
- `POST /api/collections` — create a collection
- `GET /api/collections/:id` — view a collection
- `POST /api/collections/:id/posts` — add a post to a collection
- `DELETE /api/collections/:id/posts/:postId` — remove a post from a collection
- `DELETE /api/collections/:id` — delete a collection
