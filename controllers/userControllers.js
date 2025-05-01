import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3Config.js";

import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { isBlocked } from "../utils/isBlocked.js";
import Activity from "../models/activtyModel.js";

const multerStorage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${req.user.id}-${Date.now()}.${ext}`;
    cb(null, `media/user-profiles/${req.user.email}/${fileName}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("profileImage");

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
  const currentUser = await User.findById(req.user.id).select("blockedUsers");

  const users = await User.find()
    .populate("postsVirtual")
    .populate("followers", "fullName profileImage")
    .populate("following", "fullName profileImage");

  const visibleUsers = users.filter(
    (user) => !isBlocked(currentUser, user._id)
  );

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users: visibleUsers,
    },
  });
});

export const getOneUser = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id).select("blockedUsers");

  const user = await User.findById(req.params.id)
    .populate("followers", "fullName profileImage")
    .populate("following", "fullName profileImage")
    .populate("postsVirtual");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (isBlocked(currentUser, user._id)) {
    return next(new AppError("You cannot view this user's profile"));
  }

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

  const filteredBody = filterObj(req.body, "fullName", "profileImage", "bio");
  if (req.file) filteredBody.profileImage = req.file.key;

  if (req.file) {
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${req.file.key}`;
    filteredBody.profileImage = imageUrl; // Save the full URL
  }

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

    await Activity.deleteOne({
      type: "follow",
      fromUser: currentUserId,
      toUser: targetUserId,
    });
  } else {
    // If not following, follow
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await Activity.create({
      type: "follow",
      fromUser: currentUserId,
      toUser: targetUserId,
    });
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

export const getFollowingUsers = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).populate({
    path: "following",
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: user.following.length,
    data: {
      following: user.following,
    },
  });
});

export const getFollowersUsers = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const followers = await User.find({
    following: userId,
  }).select("fullName profileImage");

  res.status(200).json({
    status: "success",
    results: followers.length,
    data: {
      followers,
    },
  });
});

// Users-search

export const searchConnections = catchAsync(async (req, res, next) => {
  const { query, type } = req.query;
  const currentUserId = req.user.id;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      status: "fail",
      message: "Search query cannot be empty",
    });
  }

  let filter = {
    fullName: { $regex: query, $options: "i" },
  };

  if (type === "following") {
    const currentUser = await User.findById(currentUserId).select("following");
    filter._id = { $in: currentUser.following };
  } else if (type === "followers") {
    const followers = await User.find({ following: currentUserId }).select(
      "_id"
    );
    const followerIds = followers.map((user) => user._id);
    filter._id = { $in: followerIds };
  }

  const users = await User.find(filter).select("fullName profileImage");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Block user
export const toggleBlockUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    return next(new AppError("You can't block yourself!", 400));
  }

  const currentUser = await User.findById(currentUserId);
  const isBlocked = currentUser.blockedUsers.includes(targetUserId);

  if (isBlocked) {
    currentUser.blockedUsers.pull(targetUserId);
  } else {
    currentUser.blockedUsers.push(targetUserId);

    // auto-unfollow each-other when blocked

    currentUser.following.pull(targetUserId);
    const targetUser = await User.findById(targetUserId);
    targetUser.followers.pull(currentUserId);
    await targetUser.save();
  }

  await currentUser.save();
  res.status(200).json({
    status: "success",
    data: {
      blocked: !isBlocked,
    },
  });
});

export const getBlockedUsers = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id).populate(
    "blockedUsers",
    "fullName profileImage"
  );

  res.status(200).json({
    status: "success",
    results: currentUser.blockedUsers.length,
    data: {
      blockedUsers: currentUser.blockedUsers,
    },
  });
});
