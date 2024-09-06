const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user-profiles",
    format: async (req, file) => {
      const fileType = file.mimetype.split("/")[1];
      return fileType;
    },
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

module.exports = { storage };
