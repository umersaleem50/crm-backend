const Member = require("../Models/member");
const { mainReport, Reports } = require("../Models/report");
const { Tasks } = require("../Models/task");
const apiError = require("../Util/apiError");
const catchAsync = require("../Util/catchAsync");
const { deleteOne, updateOne, getOne } = require("./handlerFactory");

exports.createOneReport = catchAsync(async (req, res, next) => {
  // const adminId = req.params.id;
  const adminId = req.user.admin;
  const { taskId } = req.params;
  const senderId = req.user.id;

  // const admin = await Member.findById(adminId);

  // if (!admin || !admin.team || !admin.team.includes(reportSender)) {
  //   return next(new apiError(`You can't send the report to this admin.`));
  // }

  //FOR SECURITY REASONS, SO OTHER CAN'T SEND REPORT TO OTHER USERS TASKS
  const task = await Tasks.findOne({ _id: taskId, assignTo: senderId });

  if (!task) {
    return next(new apiError(`You can't send report to this task.`, 400));
  }

  // CREATE A REPORT
  const report = await mainReport.create({
    ...req.body,
  });

  //CHECK IF THE DOC OF MAIN-REPORT IS ALREADY EXIST
  const existingReports = await Reports.findOne({
    reportTo: adminId,
    task: taskId,
  });

  if (existingReports) {
    existingReports.reports.unshift(report.id);
    existingReports.save();
    return res.status(201).json({ status: "success", data: existingReports });
  }

  // IF MAIN-REPORTS DOC NOT EXISTED OR IS NEW
  const newReports = await Reports.create({
    reportBy: senderId,
    reportTo: adminId,
    task: taskId,
  });

  if (newReports) {
    newReports.reports.push(report.id);
    await newReports.save();
  }

  res.status(201).json({ status: "success", data: newReports });
});

exports.getAllReports = catchAsync(async (req, res, next) => {
  const userId = req.user && req.user.id;
  if (!userId)
    return next(new apiError(400, "Please provide id of the account."));
  //YOU WILL GET THE REPORT SENT TO LOGGED IN ADMIN
  const tasks = await Reports.find({ reportTo: userId })
    // .populate({
    //   path: "assignBy",
    //   select: "profilePicture firstName lastName",
    // });
    .populate("reports")
    .populate({ path: "task", populate: { path: "tasks" } })
    .populate({
      path: "reportBy",
      select: "profilePicture firstName lastName",
    });

  res
    .status(200)
    .json({ status: "success", results: tasks.length, data: tasks });
});
// exports.getOneReport = getOne(Reports, "reports reportBy");

exports.getOneReport = getOne(Reports, [
  { path: "reports" },
  { path: "reportBy", select: "firstName lastName profilePicture" },
]);
exports.deleteOneReport = deleteOne(Reports);
exports.updateOneReport = updateOne(mainReport);
