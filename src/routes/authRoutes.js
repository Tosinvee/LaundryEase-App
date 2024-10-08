///user routes
const express = require("express");
const passport = require("passport");
const {
  signup,
  login,
  secure,
  forgotPassword,
  verifyEmail,
  verifyOtp,
  resetPassword,
} = require("../controller/authController");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controller/userController");
const router = express.Router();

router.get("/", (req, res) => {
  res.send('<a href="/api/users/auth/google">Authenticate with Google</a>');
});

router.get("/allUsers", getAllUsers);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.post("/signup", signup);
router.get("/verifyEmail", verifyEmail);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyOtp", verifyOtp);
router.post("/resetPassword", secure, resetPassword);

module.exports = router;
