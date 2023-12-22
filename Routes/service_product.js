const express = require("express");
const { protectedRoute } = require("../Controller/authController");
const {
  resizeServiceGallery,
  uploadGalleryImage,
  uploadServiceImages,
  resizeServiceDetailPhoto,
  resizeCoverImage,
} = require("../Controller/imageController");
const {
  createService,
  getAllServices,
  getOneService,
  deleteOneService,
  updateService,
  // editServiceGallery,
} = require("../Controller/serviceController");
const { checkIfPartOfTeam } = require("../Controller/profileController");

const service_product_router = express.Router();
// --------------
// MIDDLEWARES
// --------------
service_product_router.use(protectedRoute);
// --------------
// ROUTES
// --------------
service_product_router
  .post(
    "/",
    uploadServiceImages,
    resizeServiceDetailPhoto,
    resizeServiceGallery,
    createService
  )
  .post(
    "/:id",
    checkIfPartOfTeam,
    uploadServiceImages,
    resizeServiceDetailPhoto,
    resizeServiceGallery,
    createService
  );
service_product_router.get("/", getAllServices);
service_product_router.get("/:id", getOneService);
service_product_router.patch(
  "/:id",
  uploadServiceImages,
  resizeServiceDetailPhoto,
  resizeCoverImage,
  resizeServiceGallery,
  updateService
);
service_product_router.delete("/:id", deleteOneService);

module.exports = service_product_router;
