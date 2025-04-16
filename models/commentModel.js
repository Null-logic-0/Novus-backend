import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 100,
      minlength: 1,
    },
    likes: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
    ],
    depth: {
      type: Number,
      default: 0,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", //  self-reference
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "fullName profileImage",
  });
  next();
});

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "likes",
    select: "fullName profileImage",
  });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
