import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ["like", "follow"], required: true },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  createdAt: { type: Date, default: Date.now },
});
const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
