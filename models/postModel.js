import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    media: [String],
    caption: {
      type: String,
      minlength: [3, "Caption must be at least 3 characters"],
      maxlength: [2200, "Caption must be less than 2200 characters"],
    },
    likes: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
    ],
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

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "fullName profileImage",
  });
  next();
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "likes",
    select: "fullName profileImage",
  });
  next();
});

postSchema.virtual("commentsVirtual", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});
const Post = mongoose.model("Post", postSchema);
export default Post;
