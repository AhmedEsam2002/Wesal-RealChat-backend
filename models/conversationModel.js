import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ⚠️ Optional: Ensure only 2 participants per conversation
conversationSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    return next(new Error("A conversation must have exactly 2 participants."));
  }
  next();
});

const Conversation = model("Conversation", conversationSchema);
export default Conversation;
