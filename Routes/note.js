const { protectedRoute } = require("../Controller/authController");
const {
  getAllNotes,
  getOneNote,
  updateOneNote,
  deleteNote,
  createNote,
} = require("../Controller/noteController");

const noteRouter = require("express").Router();

noteRouter.use(protectedRoute);

noteRouter
  .get("/", getAllNotes)
  .get("/:id", getOneNote)
  .post("/", createNote)
  .patch("/:id", updateOneNote)
  .delete("/:id", deleteNote);

module.exports = noteRouter;
