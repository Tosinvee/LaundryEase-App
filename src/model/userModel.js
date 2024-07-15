const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must provide a name"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          // Only validate email if it is present
          return !value || validator.isEmail(value);
        },
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          return this.googleId || this.facebookId || value;
        },
        message: "User must provide a password",
      },
      minlength: 8,
      select: false,
    },
    confirmPassword: {
      type: String,
      default: null,
      validate: {
        validator: function (el) {
          return this.googleId || this.facebookId || el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password if it's modified and not null
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password !== null) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  this.confirmPassword = undefined;
  next();
});

// Method to check if the provided password matches the hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
