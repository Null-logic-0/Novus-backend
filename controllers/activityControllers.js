import Activity from "../models/activtyModel.js";
import catchAsync from "../utils/catchAsync.js";

export const getActivity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const activities = await Activity.find({ toUser: userId })
    .sort({
      createdAt: -1,
    })
    .populate("fromUser", "fullName profileImage")
    .populate("targetPost", "media");

  res.status(200).json({
    status: "success",
    data: {
      activities,
    },
  });
});
