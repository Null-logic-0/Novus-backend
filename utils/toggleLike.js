import AppError from "./appError.js";
import Activity from "../models/activtyModel.js";

export const toggleLike = (Model) => {
  return async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("Document not found", 404));
    }

    if (!Array.isArray(doc.likes)) {
      doc.likes = [];
    }

    const userId = req.user.id.toString();
    const hasLiked = doc.likes.some((id) => id.toString() === userId);

    if (hasLiked) {
      doc.likes = doc.likes.filter((id) => id.toString() !== userId); // Unlike

      if (Model.modelName === "Post" && userId !== doc.user.toString()) {
        await Activity.deleteOne({
          type: "like",
          fromUser: userId,
          toUser: doc.user,
          targetPost: doc._id,
        });
      }
    } else {
      doc.likes.push(req.user._id); // Like

      if (Model.modelName === "Post" && userId !== doc.user.toString()) {
        await Activity.create({
          type: "like",
          fromUser: userId,
          toUser: doc.user,
          targetPost: doc._id,
        });
      }
    }

    await doc.save();

    res.status(200).json({
      status: "success",
      data: {
        totalLikes: doc.likes.length,
        liked: !hasLiked,
      },
    });
  };
};

// export const toggleLike = (Model) => {
//   return async (req, res, next) => {
//     const doc = await Model.findById(req.params.id);

//     if (!doc) {
//       return next(new AppError("Document not found", 404));
//     }

//     if (!Array.isArray(doc.likes)) {
//       doc.likes = [];
//     }

//     const userId = req.user.id.toString();
//     const hasLiked = doc.likes.some((id) => id.toString() === userId);

//     if (hasLiked) {
//       doc.likes = doc.likes.filter((id) => id.toString() !== userId); // Unlike
//     } else {
//       doc.likes.push(req.user._id); // Like
//     }

//     await doc.save();

//     res.status(200).json({
//       status: "success",
//       data: {
//         totalLikes: doc.likes.length,
//         liked: !hasLiked,
//       },
//     });
//   };
// };
