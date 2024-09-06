const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
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
    location: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      unique: true,
      default: null,
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (value) {
          return !value || validator.isMobilePhone(value);
        },
        message: "Please provide a valid mobile number",
      },
    },
    profilePic: {
      type: String,
      default: null,
    },

    displayName: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetOtp: String,
    passwordResetExpires: Date,
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

//password reset token
userSchema.methods.createPasswordResetOtp = async function () {
  const resetOtp = Math.floor(1000 + Math.random() * 9000).toString();

  this.passwordResetOtp = crypto
    .createHash("sha256")
    .update(resetOtp)
    .digest("hex");

  console.log({ resetOtp }, this.passwordResetOtp);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetOtp;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
