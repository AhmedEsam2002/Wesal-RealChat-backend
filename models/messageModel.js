import { Schema, model } from "mongoose";
const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    img: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

messageSchema.pre("save", function (next) {
  if (!this.text && !this.img) {
    return next(new Error("Message must have either text or image."));
  }
  next();
});

const Message = model("Message", messageSchema);
export default Message;
