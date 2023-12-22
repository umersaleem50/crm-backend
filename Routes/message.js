const { Router } = require("express");
const { protectedRoute } = require("../Controller/authController");
const {
  getAllMessage,
  sendMessage,
  deleteMessage,
} = require("../Controller/messageController");
const messageRouter = Router();
messageRouter.use(protectedRoute);

messageRouter.get("/:to", getAllMessage);
messageRouter.post("/:to", sendMessage);
messageRouter.delete("/:id", deleteMessage);

module.exports = messageRouter;
