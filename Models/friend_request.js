const { Schema, model } = require("mongoose");

const Friend_Request_Schema = new Schema(
  {
    to: {
      type: Schema.Types.ObjectId,
      required: [true, "No user selected to add as friend."],
      select: "firstName lastName fullName email profilePicture",
      ref: "member",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "member",
      required: [true, "Please add select the sender of request."],
    },
    users: Array,
    status: {
      type: String,
      enum: {
        values: ["accept", "reject", "pending"],
        message: "A status could only be accept or reject.",
      },
      default: "pending",
    },
    closed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

Friend_Request_Schema.index({ sender: 1, to: 1 }, { unique: true });

// Friend_Request_Schema.pre(/^find/, function (next) {
//   this.find({ closed: { $ne: true } });
//   next();
// });
Friend_Request_Schema.pre("find", function (next) {
  this.find({ closed: false });
  next();
});

const Friend_Request = model("requests", Friend_Request_Schema);

module.exports = Friend_Request;
