const mongoose = require("mongoose");

const Comment_Schema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.ObjectId,
    ref: "member",
    required: [true, "A comment must belongs to a user."],
    select: "fullName lastName firstName profilePicture",
  },
  comment: {
    type: String,
    required: [true, "Please provide your comment"],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "post",
    required: [true, "A comment must belong to a post"],
  },
});

const Comment = mongoose.model("comment", Comment_Schema);

module.exports = Comment;
