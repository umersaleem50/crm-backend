const express = require("express");
const {
  createOnePost,
  getAllPost,
  getOnePost,
  deleteOnePost,
  updateOnePost,
} = require("../Controller/postController");
const { protectedRoute } = require("../Controller/authController");
const {
  uploadNewPostImages,
  resizeNewPostImages,
} = require("../Controller/imageController");

const postRouter = express.Router();

postRouter.use(protectedRoute);

postRouter.get("/", getAllPost);
postRouter.get("/:id", getOnePost);
postRouter.delete("/:id", deleteOnePost);
postRouter.patch(
  "/:id",
  uploadNewPostImages,
  resizeNewPostImages,
  updateOnePost
);

postRouter.post("/", uploadNewPostImages, resizeNewPostImages, createOnePost);

module.exports = postRouter;
