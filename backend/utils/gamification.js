export const LEVELS = [
  { name: "Beginner Artist", min: 0 },
  { name: "Creative Explorer", min: 20 },
  { name: "Master Illustrator", min: 60 },
  { name: "Legendary Artist", min: 150 },
];

export const getLevel = (points) => {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.min) current = lvl;
  }
  return current.name;
};

export const calculatePoints = ({ postCount, totalLikes, totalRatings }) =>
  postCount * 5 + totalLikes * 1 + totalRatings * 2;

export const calculateBadges = ({ postCount, totalLikes, posts }) => {
  const badges = [];
  if (postCount >= 1) badges.push({ id: "first_upload", label: "🏅 First Upload" });
  if (totalLikes >= 100) badges.push({ id: "hundred_likes", label: "🔥 100 Likes" });

  const categoryCounts = {};
  posts.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  if (Object.keys(categoryCounts).length >= 4) {
    badges.push({ id: "color_master", label: "🌈 Color Master" });
  }
  if ((categoryCounts["Sketch"] || 0) >= 5) badges.push({ id: "sketch_king", label: "✏ Sketch King" });
  if ((categoryCounts["Watercolor"] || 0) >= 5) {
    badges.push({ id: "watercolor_expert", label: "🎨 Watercolor Expert" });
  }

  const hasCommunityFavorite = posts.some((p) => p.ratings?.length >= 5 && p.averageRating >= 4.5);
  if (hasCommunityFavorite) badges.push({ id: "community_favorite", label: "🏆 Community Favorite" });

  return badges;
};
