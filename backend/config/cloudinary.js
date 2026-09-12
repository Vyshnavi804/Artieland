import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn(
    "⚠ Cloudinary env vars are missing (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). " +
      "Image uploads will fail until these are set in backend/.env."
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Shared storage engine for post artwork images
export const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "artieland/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  },
});

// Separate folder for profile pictures, kept smaller since they're just avatars
export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "artieland/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

export default cloudinary;
