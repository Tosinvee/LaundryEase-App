const { promisify } = require("util");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendVerificationEmail, sendResetOtp } = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  //generate email verification token
  const verificationToken = signToken(newUser._id);

  //send verification email
  sendVerificationEmail(newUser.email, verificationToken);
  res.status(201).json({
    status: "sucess",
    message: "user registered. please check your email for verification",
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError("Token is missing", 400));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("Invalid token", 400));
    }

    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });
    res.status(200).send(" Email verified sucessfully");
  } catch (error) {
    console.log("error verify email", error);
    return next(new AppError("Error verifying email", 500));
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError("Please provide a valid email amd password!", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

const secure = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("you are not logged in!", 401));
  }
  next();
});

//generate otp
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit OTP
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }

  const otp = generateOtp();
  user.passwordResetOtp = otp;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save({ validateBeforeSave: false });

  sendResetOtp(user.email, otp);

  // Optionally, you could store the email in the session for later use
  req.session.resetEmail = user.email;

  res.status(200).json({
    status: "success",
    message: "OTP sent to email!",
  });
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("Please provide the OTP", 400));
  }

  const user = await User.findOne({ email: req.session.resetEmail });

  if (
    !user ||
    user.passwordResetOtp !== otp ||
    user.passwordResetExpires < Date.now()
  ) {
    return next(new AppError("Invalid OTP or OTP has expired", 400));
  }

  // Clear OTP and expiration after successful verification
  user.passwordResetOtp = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "OTP verified. You can now reset your password.",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(
      new AppError("Please provide the new password and confirm it", 400)
    );
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  const user = await User.findOne({ email: req.session.resetEmail });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.password = password;
  user.passwordConfirm = confirmPassword;
  await user.save({ validateBeforeSave: false });

  // Clear the session after password reset
  req.session.resetEmail = undefined;

  res.status(200).json({
    status: "success",
    message: "Password has been reset!",
  });
});

module.exports = {
  signup,
  verifyEmail,
  login,
  secure,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
