//////user model
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user must provide a name"],
  },

  email: {
    type: String,
    required: [true, "please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email"],
  },

  password: {
    type: String,
    required: [true, "user must provide a password"],
    minlenght: 8,
  },

  confirmPassword: {
    type: String,
    required: [true, "please provide your confirm email"],
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
