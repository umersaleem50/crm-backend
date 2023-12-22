const mongoose = require("mongoose");

const Post_Schema = new mongoose.Schema({
  images: {
    type: [String],
    required: [true, "Please provide atleast 1 image for the post"],
    validate: [
      function (val) {
        return val.length < 10 && val.length >= 1;
      },
      "Please choose more than 1 image and less than 10 images for the post.",
    ],
  },
  caption: {
    type: String,
    max: [200, "Please only provide the caption with 200 letters."],
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
  member: {
    type: mongoose.Schema.ObjectId,
    ref: "member",
    required: [true, "A post should be posted by a user!"],
    select: "fullName lastName firstName profilePicture",
  },
  tags: {
    type: [String],
  },
  comments: {
    type: [mongoose.Schema.ObjectId],
    ref: "comment",
  },
});

const New_Post = mongoose.model("post", Post_Schema);

module.exports = New_Post;
