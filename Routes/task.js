const { protectedRoute } = require("../Controller/authController");
const profileController = require("../Controller/profileController");
const taskController = require("../Controller/taskController");

const taskRouter = require("express").Router();

taskRouter.use(protectedRoute);

taskRouter
  .get("/", taskController.getAllTask)
  // GET ALL THE TASK OF TEAM MEMBER OF CURRENTLY LOGGED-IN USER
  .get(
    "/sub-account/:id",
    profileController.checkIfPartOfTeam,
    taskController.getAllTask
  );

taskRouter.get("/:id", taskController.getOneTask);
taskRouter.post(
  "/:id",
  profileController.checkIfPartOfTeam,
  taskController.assignATask
);

taskRouter.patch("/:id", taskController.updateOneTask);
taskRouter.delete("/:id", taskController.deleteOneTask);
taskRouter.patch("/reassign/:taskId", taskController.reassignTask);

module.exports = taskRouter;
