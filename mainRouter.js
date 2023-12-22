const authRouter = require("./Routes/authentication");
const profileRouter = require("./Routes/profile");
const serviceProductRouter = require("./Routes/service_product");
const taskRouter = require("./Routes/task");
const noteRouter = require("./Routes/note");
const reportRouter = require("./Routes/report");
const postRouter = require("./Routes/post");
const commentRouter = require("./Routes/comment");
const messageRouter = require("./Routes/message");
const friendRequestRouter = require("./Routes/friendRequest");
const mainRouter = require("express").Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/profile", profileRouter);
mainRouter.use("/service", serviceProductRouter);
mainRouter.use("/tasks", taskRouter);
mainRouter.use("/notes", noteRouter);
mainRouter.use("/reports", reportRouter);
mainRouter.use("/posts", postRouter);
mainRouter.use("/comments", commentRouter);
mainRouter.use("/messages", messageRouter);
mainRouter.use("/friend-requests", friendRequestRouter);

module.exports = mainRouter;
