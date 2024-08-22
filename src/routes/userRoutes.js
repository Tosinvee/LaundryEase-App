const express = require("express");
const { getProfile, updateProfile } = require("../controller/userController");
const { secure } = require("../controller/authController");
const router = express.Router();

router.get("/me", getProfile);
router.patch("/updateProfile", secure, updateProfile);

module.exports = router;
