import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    media: [
      {
        url: { type: String },
      },
    ],
    caption: {
      type: String,
      maxlength: 2200,
      minlength: 3,
    },
    like: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [],
  },
  { timestamps: true }
);

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "fullName profileImage",
  });
  next();
});

const Post = mongoose.model("Post", postSchema);
export default Post;
