const Comment = require("../Models/comment");
const New_Post = require("../Models/new_post");
const apiError = require("../Util/apiError");
const catchAsync = require("../Util/catchAsync");
const { deleteOne, updateOne, getOne } = require("./handlerFactory");

exports.createOneComment = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  const post_id = req.params.id;
  const { comment } = req.body;

  const new_comment = await Comment.create({
    member: id,
    post: post_id,
    comment,
  });
  if (new_comment) {
    const selected_post = await New_Post.findByIdAndUpdate(post_id, {
      $push: { comments: new_comment },
    });
    if (!selected_post)
      return next(new apiError("No Post found with :id", 404));
  }
  res.status(200).json({ status: "success", data: new_comment });
});

exports.deleteOneComment = deleteOne(Comment);
exports.updateOneComment = updateOne(Comment);
exports.getOneComment = getOne(Comment, [
  { path: "post" },
  { path: "member", select: "fullName lastName firstName profilePicture" },
]);
