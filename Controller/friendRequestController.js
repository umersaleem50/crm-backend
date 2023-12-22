const Friend_Request = require("../Models/friend_request");
const Member = require("../Models/member");
const apiError = require("../Util/apiError");
const catchAsync = require("../Util/catchAsync");
const { getOne } = require("./handlerFactory");

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const { to } = req.params;
  const sender = req.user._id;
  const user = await Member.findById(to);
  if (!user) return next(new apiError("No user found with this id.", 400));
  const requestDoc = await Friend_Request.create({
    to,
    sender,
    users: [to.toString(), sender.toString()],
  });

  if (!requestDoc) {
    return next(
      new apiError("Failed to send the friend request. Try again later!", 400)
    );
  }

  res.status(200).json({
    status: "success",
    data: requestDoc,
    message: "Friend request is successfully sent!",
  });
});

exports.responseToRequest = catchAsync(async (req, res, next) => {
  const { id, response } = req.params;
  const currentUserId = req.user._id;
  // const requestDoc = await Friend_Request.findOne({
  //   users: {
  //     $all: [id.toString(), currentUserId.toString()],
  //   },
  // });
  const requestDoc = await Friend_Request.findById(id);

  if (!requestDoc)
    return next(new apiError("No request found with this id.", 404));

  if (!requestDoc.users.includes(currentUserId.toString()))
    return next(
      new apiError(
        `You're not allowed to response to this friend request.`,
        400
      )
    );
  // if (response !== "accept" || response !== "reject")
  //   return next(
  //     new apiError("A response could only be reject or accept. ", 400)
  //   );

  // if user accepts
  if (response === "accept") {
    const otherUser = await Member.findOneAndUpdate(requestDoc.sender, {
      $push: { friends: currentUserId },
    });
    const self = await Member.findOneAndUpdate(currentUserId, {
      $push: {
        friends: requestDoc.sender,
      },
    });
    if (otherUser && self) {
      requestDoc.status = "accept";
      requestDoc.closed = true;
      await requestDoc.save();
      return res
        .status(200)
        .json({ status: "success", message: "You're now a friend." });
    }
  }
  // if user reject
  if (response === "reject") {
    await Friend_Request.findByIdAndDelete(id);
    res
      .status(200)
      .json({ status: "success", message: "You rejected the request." });
  }
});

exports.getAllFriendRequests = catchAsync(async (req, res, next) => {
  const currentUserId = req.user._id;
  const friendRequestsDoc = await Friend_Request.find({
    to: currentUserId,
  }).populate({
    path: "sender",
    select: "fullName lastName firstName profilePicture",
  });
  return res.status(200).json({
    status: "success",
    results: friendRequestsDoc.length,
    data: friendRequestsDoc,
  });
});

exports.getOneFriendRequest = getOne(Friend_Request);

exports.checkIfHaveFriendRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user._id;

  const requestDoc = await Friend_Request.findOne({
    users: {
      $all: [id.toString(), currentUser.toString()],
    },
  });

  const sendBySelf = requestDoc.sender.toString() === currentUser.toString();

  // const requestDoc = await Friend_Request.findOne({
  //   to: currentUser.toString(),
  //   sender: id.toString(),
  // });

  if (!requestDoc)
    return next(new apiError("No request from this user found!", 400));

  return res.status(200).json({
    status: "success",
    sendBySelf,
    data: requestDoc,
  });
});

exports.removeFriend = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUser = req.user._id;
  if (!id)
    return next(new apiError("Please enter the id of your friend.", 400));
  const currentUserDoc = await Member.find({ friends: id });
  if (!currentUserDoc || currentUserDoc.length === 0)
    return next(new apiError("The person is not your friend yet.", 400));
  const friendDoc = await Member.findById(id);
  friendDoc.friends.splice(friendDoc.friends.indexOf(currentUser), 1);
  currentUserDoc.friends.splice(currentUserDoc.friends.indexOf(id), 1);
  await friendDoc.save();
  await currentUserDoc.save();
  res.status(200).json({
    status: "success",
    message: "Successfully, Removed from your friends.",
  });
});
