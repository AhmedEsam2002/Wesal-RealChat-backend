import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { APIFeatures } from "../utils/apifeatures.js";
import cloudinary from "../utils/cloudinary.js";

export const updateMe = catchAsync(async (req, res, next) => {
  const { name, email, avatar, password } = req.body;

  if (password) {
    return next(
      new AppError(
        "This route is not for updating password. Please use /updateMyPassword.",
        400
      )
    );
  }

  const updatedData = {};
  if (name) updatedData.name = name;
  if (email) updatedData.email = email;

  if (avatar) {
    const result = await cloudinary.uploader.upload(avatar, {
      folder: "chat-app",
    });
    updatedData.avatar = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
export const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// ✅ Get All Users
export const getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

// ✅ Create New User (by admin only)
export const createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});

// ✅ Get User by ID
export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// ✅ Update User by ID (admin only)
export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// ✅ Delete User by ID (admin only)
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User not found", 404));

  res.status(204).json({ status: "success", data: null });
});

// -------------- Sockets --------------
export const setOnlineStatus = async (userId, state) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  user.online = state;
  return user.save();
};
