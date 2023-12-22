const { protectedRoute } = require("../Controller/authController");
// const imageHandler = require("../Controller/imageController");
const profileController = require("../Controller/profileController");
const authController = require("../Controller/authController");
const {
  resizeProfilePicture,
  resizeCoverImage,
  uploadProfileImages,
  resizeGallery,
} = require("../Controller/imageController");
const { defaultFields } = require("../Util/services");

const Router = require("express").Router();

Router.post("/logout", authController.logoutProfile);

Router.use(protectedRoute);
Router.get("/team", profileController.getTeam);
Router.get("/friends", profileController.getAllFriends);

Router.get("/", profileController.getProfile).get(
  "/:id",
  profileController.checkIfPartOfTeam,
  profileController.getSubAccountProfile
);
Router.get(
  "/other/:id",
  defaultFields(
    "firstName",
    "lastName",
    "email",
    "team",
    "service",
    "profilePicture",
    "coverPicture",
    "profession",
    "gallery"
  ),
  profileController.getProfile
);

Router.use(uploadProfileImages);
Router.use(resizeProfilePicture);
Router.use(resizeCoverImage);
Router.use(resizeGallery);

Router.patch(
  "/",
  profileController.checkIfHavePermission("update-account"),
  profileController.updateProfile
).patch(
  "/:id",
  profileController.checkIfPartOfTeam,
  profileController.checkIfHavePermission("update-account"),
  profileController.updateProfile
);

module.exports = Router;
