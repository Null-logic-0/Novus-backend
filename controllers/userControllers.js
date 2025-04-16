import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate("postsVirtual");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate("followers", "fullName profileImage")
    .populate("following", "fullName profileImage")
    .populate("postsVirtual");

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates.", 400));
  }

  const filteredBody = filterObj(req.body, "fullName", "bio");

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Follow-Unfollow
export const toggleFollow = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    return next(new AppError("You can't follow yourself!", 400));
  }

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return next(new AppError("User not found!", 404));
  }

  // Check if current user is already following the target user
  const isFollowing = currentUser.following.includes(targetUserId);

  // If currently following, unfollow
  if (isFollowing) {
    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);
  } else {
    // If not following, follow
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
  }

  await currentUser.save();
  await targetUser.save();

  res.status(200).json({
    status: "success",
    totalFollowers: targetUser.followers.length,
    totalFollowing: currentUser.following.length,
    data: {
      following: !isFollowing,
    },
  });
});
