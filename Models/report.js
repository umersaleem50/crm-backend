const { models, model, Schema } = require("mongoose");

const ReportsSchema = new Schema({
  task: {
    type: Schema.ObjectId,
    ref: "Tasks",
    required: [true, "A report must be of a task."],
  },
  reportTo: {
    type: Schema.ObjectId,
    ref: "member",
    required: [true, "A report must belong to an admin."],
  },
  reportBy: {
    type: Schema.ObjectId,
    ref: "member",
    required: [true, "A report must have a sender."],
  },

  reports: [
    {
      type: Schema.ObjectId,
      ref: "mainReport",
    },
  ],
});

ReportsSchema.indexes({ reportTo: 1, task: 1 }, { unique: true });

const ReportSchema = new Schema({
  description: {
    type: String,
    required: [true, "Please provide a brief description to report."],
  },
  heading: {
    type: String,
    required: [true, "Please add a heading for the report."],
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
  graph: {
    type: [Number],
    default: [],
    graphType: {
      type: String,
      default: "bar",
    },
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
    default: [],
  },
});

const mainReport = model("mainReport", ReportSchema);
const Reports = model("reports", ReportsSchema);

module.exports = { mainReport, Reports };
