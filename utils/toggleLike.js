import AppError from "./appError.js";

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
    } else {
      doc.likes.push(req.user._id); // Like
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
