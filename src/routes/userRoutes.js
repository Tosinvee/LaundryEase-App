///user routes
const express = require("express");
const { signup, login, secure } = require("../controller/authController");
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controller/userController");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.route("/").get(secure, getAllUsers);

//router.route("/:id").patch(updateUser).delete(deleteUser);

router.get("/", (req, res, next) => {
  res.render("index");
});
// router.get("/", (req, res, next) => {
//   res.send("hello");
// });

module.exports = router;
