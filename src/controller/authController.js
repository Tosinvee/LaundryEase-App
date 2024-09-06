const { promisify } = require("util");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendVerificationEmail, sendResetOtp } = require("../utils/email");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const signToken = (id, expiresIn) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message, expiresIn) => {
  const token = signToken(user._id, expiresIn);

  const expiresInDays = Number(process.env.JWT_COOKIES_EXPIRES_IN) || 7; // Default to 7 days if not set

  const cookieOptions = {
    expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
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
  createSendToken(user, 200, res, "You are logged in sucessfully");
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

  // verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token no longer exist", 401)
    );
  }
  // check if user changed password after the token was issued

  // if (freshUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError("User recently changed password! please log in again.", 401)
  //   );
  // }
  //GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = freshUser;
  next();
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user with this email exists", 404));
  }
  const resetOtp = user.createPasswordResetOtp();
  await user.save({ validateBeforeSave: false });
  try {
    sendResetOtp(user.email, resetOtp);

    res.status(200).json({
      status: "success",
      message: "OTP sent to email",
    });
  } catch (error) {
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error ending the email. Try again later!"),
      500
    );
  }
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const otp = req.body.otp;

  if (!otp) {
    return next(new AppError("OTP is invalid", 404));
  }
  console.log("received otp", otp);

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    passwordResetOtp: hashedOtp,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.passwordResetOtp = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(
    user,
    200,
    res,
    "OTP verified. You can now reset your password.",
    "10m"
  );
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return next(new AppError("please provide all required fields", 400));
  }
  if (password !== confirmPassword) {
    return next(new AppError("passwords do not match", 400));
  }

  const user = req.user;
  user.password = password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res, "password reset sucessfully");
});

module.exports = {
  signup,
  verifyEmail,
  login,
  secure,
  forgotPassword,
  verifyOtp,
  resetPassword,
  createSendToken,
};
