const New_Post = require("../Models/new_post");
const catchAsync = require("../Util/catchAsync");
const { getAll, getOne, deleteOne, updateOne } = require("./handlerFactory");

exports.createOnePost = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  const { images, caption, tags } = req.body;
  const post = await New_Post.create({ images, caption, member: id, tags });
  res.status(200).json({ status: "success", data: post });
});

exports.getAllPost = getAll(New_Post, [
  {
    path: "comments",
    populate: {
      path: "member",
      select: "firstName lastName fullName profilePicture",
    },
  },
  { path: "member" },
]);
exports.getOnePost = getOne(New_Post, [
  { path: "member", select: "firstName lastName fullName profilePicture" },
  {
    path: "comments",
    populate: {
      path: "member",
      select: "firstName lastName fullName profilePicture",
    },
  },
]);
exports.deleteOnePost = deleteOne(New_Post);
exports.updateOnePost = updateOne(New_Post);
