const Message = require("../Models/message");
const apiError = require("../Util/apiError");
const catchAsync = require("../Util/catchAsync");
const { deleteOne } = require("./handlerFactory");

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const to = req.params.to;
  const from = req.user._id;

  if (!to)
    return next(
      new apiError("Please insert the user to whom the message is sent.", 400)
    );

  if (!message)
    return next(new apiError("Please type the message to send.", 400));

  const data = await Message.create({
    message: { text: message },
    users: [from.toString(), to],
    sender: from,
  });
  if (data)
    return res.status(200).json({
      status: "success",
      message: "Message sent successfully!",
    });

  if (!data)
    return res.status(400).json({
      status: "failed",
      message: "Failed to sent the message!.",
    });
});

exports.getAllMessage = catchAsync(async (req, res, next) => {
  const { to } = req.params;
  const from = req.user._id;
  const messages = await Message.find({
    users: {
      $all: [from.toString(), to],
    },
  }).sort({ updatedAt: 1 });

  const projectedMessages = messages.map((msg) => {
    return {
      fromSelf: msg.sender.toString() === from.toString(),
      message: msg.message.text,
      createdAt: msg.createdAt,
    };
  });

  return res
    .status(200)
    .json({ status: "success", messages: projectedMessages });
});

exports.deleteMessage = deleteOne(Message);
