import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/email.js";
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  //   Check if all required fields are provided
  if (!name || !email || !password || !confirmPassword) {
    return next(new AppError("Please provide all required fields", 400));
  }
  //   create a new user
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });
  // Send Token And Response
  await sendEmail({
    to: user.email,
    subject: "Welcome to Our Chat Application!",
    text: `Hello ${user.name},\n\nThank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Team`,
  });

  createSentToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //   Check if email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //   Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.isCorrectPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  await sendEmail({
    to: user.email,
    subject: "Login Notification",
    text: `Hello ${user.name},\n\nYou have successfully logged in to your account.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nThe Team`,
  });

  //   Send Token And Response
  createSentToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  // Check if token is provided in headers or cookies
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // If no token is provided, return an error
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  //   2- Verify the token
  const decoded = await verifyToken(
    token,
    process.env.JWT_SECRET || "mysecret"
  );
  const user = await User.findById(decoded.id).select("+password");
  if (!user) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }
  //   3- Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  //   4- Grant access to protected route
  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  });
};

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  //   Check if email is provided
  if (!email) {
    return next(new AppError("Please provide your email", 400));
  }
  //   Check if user exists with the provided email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("There is no user with this email", 404));
  }
  //   Generate a password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\n
   If you didn't forget your password, please ignore this email!`;

  try {
    //   Send the reset token to the user's email
    await sendEmail({
      to: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      text: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmNewPassword } = req.body;

  if (!token) {
    return next(new AppError("Please provide a valid token", 400));
  }

  if (!newPassword || !confirmNewPassword) {
    return next(
      new AppError("Please provide new password and confirm password", 400)
    );
  }

  // Hash the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by token and make sure it's not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Not expired
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  // Set the new password
  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Log the user in, send JWT
  createSentToken(user, 200, res);
});
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // Check if current password is provided
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(
      new AppError("Please provide current password and new passwords", 400)
    );
  }

  // Get the user from database with password field
  const user = await User.findById(req.user._id).select("+password");

  // Check if the current password is correct
  if (!(await user.isCorrectPassword(currentPassword))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // Update the password
  user.password = newPassword;
  user.confirmPassword = confirmNewPassword;

  await user.save();

  // Log the user in, send JWT
  createSentToken(user, 200, res);
});

// ------- JWT Functions
const assignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "mysecret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  });
};

const verifyToken = promisify(jwt.verify);

const createSentToken = (user, statusCode, res) => {
  // delete user password
  user.password = undefined;

  const token = assignToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
