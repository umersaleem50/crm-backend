const Note = require("../Models/note");
const apiError = require("../Util/apiError");
const ApiFeature = require("../Util/apiFeature");
const catchAsync = require("../Util/catchAsync");
const {
  deleteOne,
  getOne,
  updateOne,
} = require("./handlerFactory");

exports.createNote = catchAsync(async (req, res, next) => {
  const userId = req.user && req.user.id;
  if (!userId) return next(new apiError("No user found with the id.", 400));
  const note = await Note.create({ ...req.body, member: userId });
  res.status(201).json({ status: "success", data: note });
});

exports.deleteNote = deleteOne(Note);

exports.getOneNote = getOne(Note);

exports.updateOneNote = updateOne(Note);

exports.getAllNotes = catchAsync(async (req, res, next) => {
  const {id} = req.user
  const noteQuery = new ApiFeature(Note.find({ member: id }), req.query)
    .filter()
    .sort()
    .limit()
    .pagination();
  const notes = await noteQuery.query;
  res
    .status(200)
    .json({ status: "success", data: notes, length: notes.length });
});

