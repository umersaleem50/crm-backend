const express = require("express");
const {
  createOneComment,
  getOneComment,
  updateOneComment,
  deleteOneComment,
} = require("../Controller/commentController");
const { protectedRoute } = require("../Controller/authController");
const commentRouter = express.Router();
commentRouter.use(protectedRoute);
commentRouter
  .post("/:id", createOneComment)
  .get("/:id", getOneComment)
  .patch("/:id", updateOneComment)
  .delete("/:id", deleteOneComment);

module.exports = commentRouter;
