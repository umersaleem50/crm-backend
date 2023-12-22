// const { socket } = require("../../server");
const { Task, Tasks } = require("../Models/task");
const apiError = require("../Util/apiError");
const catchAsync = require("../Util/catchAsync");
const { getOne, updateOne, deleteOne, getAll } = require("./handlerFactory");

/**
 * Get a task with :id
 * @return returns response with valid data
 */
exports.getOneTask = getOne(Tasks, [
  { path: "tasks" },
  { path: "assignBy", select: "firstName lastName profilePicture" },
  { path: "assignTo", select: "firstName lastName profilePicture" },
]);

/**
 * update a task with :id
 * @return returns response with valid data
 */
exports.updateOneTask = updateOne(Task);

/**
 * Reassign the task to a user
 * This will create a task and will push in the tasks
 * @return returns response with valid data
 */
exports.reassignTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const task = await Tasks.findById(taskId).populate("tasks");
  if (!task) return next(new apiError("No task found with this id.", 404));
  if (task && task.status === "complete") {
    return next(
      new apiError("Task is already completed, Please assign new task.")
    );
  }
  const singleTask = await Task.create({ ...req.body });
  task.tasks.unshift(singleTask);
  await task.save();

  res.status(201).json({ status: "success", data: task });
});
/**
 * delete a task with :id
 * @return returns response with valid data
 */
exports.deleteOneTask = deleteOne(Task);

/**
 * Get all the task of the currently logged-in user.
 * @return returns response with valid data
 */
exports.getAllTask = catchAsync(async (req, res, next) => {
  const id = req.params?.id || req.user.id;

  const tasks = await Tasks.find({ assignTo: id }).populate("tasks").populate({
    path: "assignBy",
    select: "profilePicture firstName lastName",
  });

  res
    .status(200)
    .json({ status: "success", results: tasks.length, data: tasks });
});

/**
 * Assign a task to team member of the currenly logged-in user
 * Create a mainTask and push it in the tasks
 * @return returns response with valid data
 */
exports.assignATask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  const task = await Task.create({
    ...req.body,
  });

  const mainTasks = await Tasks.create({
    assignTo: id,
    assignBy: userId,
  });
  if (!mainTasks) await Task.findByIdAndDelete(task.id);

  if (mainTasks) {
    mainTasks.tasks.push(task.id);
    await mainTasks.save();
  }

  res.status(201).json({ status: "success", data: mainTasks });
});
