const express = require("express");
const {
  getProfile,
  updateProfile,
  updateUserProfile,
} = require("../controller/userController");
const { secure } = require("../controller/authController");
const multer = require("multer");
const { storage } = require("../config/cloudinaryConfig");
const upload = multer({ storage });
const router = express.Router();

router.get("/me", getProfile);
router.patch(
  "/updateProfile",
  secure,
  upload.single("profilePic"),
  updateUserProfile
);

module.exports = router;
