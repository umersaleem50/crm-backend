const { Router } = require("express");
const {
  sendFriendRequest,
  responseToRequest,
  getAllFriendRequests,
  getOneFriendRequest,
  checkIfHaveFriendRequest,
  removeFriend,
} = require("../Controller/friendRequestController");
const { protectedRoute } = require("../Controller/authController");

const friendRequestRouter = new Router();

friendRequestRouter.use(protectedRoute);

friendRequestRouter.get("/", getAllFriendRequests);
friendRequestRouter.get("/:id", getOneFriendRequest);
friendRequestRouter.post("/:to", sendFriendRequest);
friendRequestRouter.post("/:id/:response", responseToRequest);
friendRequestRouter.get("/check-status/:id", checkIfHaveFriendRequest);
friendRequestRouter.delete("/:id", removeFriend);
module.exports = friendRequestRouter;
