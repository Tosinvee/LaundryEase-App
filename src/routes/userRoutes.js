///user routes
const express = require("express");
const passport = require("passport");
const { signup, login, secure } = require("../controller/authController");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controller/userController");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index");
});

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
router.post("/login", login);

//router.route("/").get(secure, getAllUsers);

module.exports = router;
