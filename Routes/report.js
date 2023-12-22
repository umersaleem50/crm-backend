const { protectedRoute } = require("../Controller/authController");
const {
  createOneReport,
  getAllReports,
  getOneReport,
  updateOneReport,
  deleteOneReport,
} = require("../Controller/reportController");

const reportRouter = require("express").Router();

reportRouter.use(protectedRoute);

reportRouter
  .get("/", getAllReports)
  .get("/:id", getOneReport)
  .patch("/:id", updateOneReport)
  .delete("/:id", deleteOneReport);

reportRouter.post("/:taskId", createOneReport);

module.exports = reportRouter;
