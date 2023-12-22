const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    message: {
      text: {
        type: String,
        required: [true, "Please enter the message you want to send."],
        max: [600, "You can only send message of 600 characters or less."],
      },
    },
    users: Array,
    sender: {
      type: Schema.Types.ObjectId,
      ref: "member",
      required: true,
    },
  },
  { timestamps: true }
);
const Message = model("message", MessageSchema);
module.exports = Message;
