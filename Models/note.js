const { Schema, models, model } = require("mongoose");

const NoteSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    required: [true, "A note must belong to a member."],
  },
  heading: {
    type: String,
    required: [true, "A note must must have a heading."],
  },

  createdOn: {
    type: Date,
    default: Date.now(),
  },
  description: {
    type: String,
    required: [true, "Please provide description for the note."],
  },
});

const Note = models.note || model("note", NoteSchema);

module.exports = Note;
