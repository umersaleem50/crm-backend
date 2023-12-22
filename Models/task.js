const { models, model, Schema, default: mongoose } = require("mongoose");

const mainTaskSchema = new Schema({
  deadline: {
    type: Date,
    required: [true, "Please provide the deadline for the task."],
  },
  heading: {
    type: String,
    required: [true, "Please give a heading to the task."],
  },
  description: {
    type: String,
    required: [true, "Please provide a description of the task."],
  },
  priority: {
    type: String,
    // required: [true, "Please select the priority for a task."],
    enum: {
      values: ["critical", "high", "medium", "low"],
      message:
        "Please provide only valid type. ie. critical, high, medium or low",
    },
    default: "high",
  },
  status: {
    type: String,
    enum: {
      values: ["done", "working-on-it", "stuck", "not-started"],
      message:
        "Please provide only valid type. ie. done, working-on-it, stuck or not-started",
    },
    default: "not-started",
  },
  assignedOn: {
    type: Date,
    default: Date.now(),
  },

  attachments: {
    type: [
      {
        fileName: {
          type: String,
        },
        size: {
          type: Number,
        },
      },
    ],
  },
});

const TasksSchema = new Schema({
  // status: {
  //   type: String,
  //   enum: {
  //     values: ["incomplete", "complete"],
  //     message: "You can only set task to complete or to incomplete.",
  //   },
  //   default: "incomplete",
  // },

  assignBy: {
    type: mongoose.Schema.ObjectId,
    required: [true, "A task must be assign by a admin user."],
    ref: "member",
  },
  assignTo: {
    type: [mongoose.Schema.ObjectId],
    ref: "member",
    required: [true, "A task must be assign to atleast one user."],
  },

  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "mainTasks",
    },
  ],
});

const Task = models.mainTasks || model("mainTasks", mainTaskSchema);
const Tasks = models.tasks || model("Tasks", TasksSchema);

module.exports = { Task, Tasks };
