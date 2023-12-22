const Member = require("../Models/member");
const apiError = require("../Util/apiError");
const ApiFeature = require("../Util/apiFeature");
const catchAsync = require("../Util/catchAsync");

const { filterFields, filterPermissions } = require("../Util/filterQuery");

/**
 * Provides the data of currently logged in account
 @return Object [req] Response with user data
 */

exports.getProfile = catchAsync(async (req, res, next) => {
  const id = req.params.id || req.user.id;
  const features = new ApiFeature(
    Member.findById(id).populate("team").populate("service"),
    req.query
  ).limit();
  const user = await features.query;
  return res.status(200).json({ status: "success", data: user });
});

/**
 * Provide the data of the SubAccount, if the given user is team member of logged-in user
 * Before using this, use checkIfPartOfTeam middleware for better results
 * @param id :id of the user's account
 * @returns Returns response with valid data
 */

exports.getSubAccountProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const features = new ApiFeature(
    Member.findById(id).populate("team").populate("service"),
    req.query
  ).limit();
  const user = await features.query;
  if (!user)
    return next(
      new apiError(res.t("No user found. Or account is deactivated."), 404)
    );
  res.status(200).json({ status: "success", data: user });
});

/**
 * Provide the data of team of a user
 @return [res] Response with team data
 */

exports.getTeam = catchAsync(async (req, res, next) => {
  let fields;
  if (req.query.fields) {
    fields = filterFields(
      req.query.fields,
      "password",
      "passwordConfirm",
      "passwordChangedAt"
    );
  }
  const profile = await Member.findById(req.user.id)
    .select("team")
    .populate({ path: "team", select: fields });

  return res.json({ data: profile });
});
/**
 * Update the accounts information, if the given user is team member of logged-in user
 * Before using this, use checkIfPartOfTeam middleware for better results
 * @param id :id of the user's account
 * @returns Returns response with valid data
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  const id = req.params.id || req.user;

  const user = await Member.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!user)
    return next(
      new apiError(res.t("No user found. Or account is deactivated."), 404)
    );

  res.status(200).json({ status: "success", data: user });
});

/**
 * Update the accounts information of currently logged-in user
 * @returns Returns response with valid data
 */

// exports.updateProfile = catchAsync(async (req, res, next) => {
//   const { id } = req.user;
//   const body = req.body;
//   const ALLOWED_FIELDS = [
//     "firstName",
//     "lastName",
//     "email",
//     "profession",
//     "profilePicture",
//     "coverPicture",
//     "bio",
//     "phone",
//     "postalCode",
//     "city",
//     "country",
//     "street",
//     "location",
//     "gallery",
//   ];
//   if (req.body?.password)
//     return next(
//       new apiError(
//         "Please use this route /auth/update-password for updating the password.",
//         400
//       )
//     );
//   // const filteredReq = filterReq(req.body, ...ALLOWED_FIELDS);
//   const user = await Member.findByIdAndUpdate(id, req.body, {
//     runValidators: true,
//     new: true,
//   });

//   if (!user) return next(new apiError("No document found with :id.", 404));

//   res.status(200).json({ message: "success", data: user });
// });

/**
 * Checks if the given user is a team member of logged in user
 * @params :id param of the request
 * @return Returns next() middleware if part of team
 */

exports.checkIfPartOfTeam = catchAsync(async (req, res, next) => {
  const { id } = req.params; // ID OF TEST USER, COULD BE OF ADMIN OR USER
  const userId = req.user.id; // CURRENTLY LOGGED IN USER
  const user = await Member.findOne({ _id: userId, team: id });

  if (!user)
    return next(
      new apiError(
        res.t(
          `You're not allow to perform the action. User is not part of your team`
        ),
        401
      )
    );

  next();
});

/**
 * Create Sub Accounts, if the logged-in user have permissions
 * It creates a user first & then append it in the logged-in user's team
 @params [String] :adminId unique :id of the an account
 @return Return response with valid data
 */

exports.createSubAccounts = catchAsync(async (req, res) => {
  const { body } = req;
  const { id } = req.user; //ID OF CURRENTLY LOGGED IN USER IE. ADMIN ID
  const adminPermissions = req.user.permissions;
  let permissions = [];
  if (body.permissions) {
    permissions = filterPermissions(body.permissions, adminPermissions);
  }
  const user = await Member.create({ ...body, admin: id, permissions });
  await Member.findByIdAndUpdate(id, {
    $push: { team: user.id },
  });

  return res.status(201).json({ status: "success", data: user });
});

/**
 *  Tests if the user have permission before performing the certain task
 * @param {String} requiredPermission required permission, which a user should have before performing certain action
 * @returns return next middleware if the user have permission, otherwise return error
 */

exports.checkIfHavePermission = (requiredPermission) => {
  return catchAsync(async (req, res, next) => {
    const userPermissions = req.user.permissions;
    if (!userPermissions.includes(requiredPermission))
      return next(
        new apiError(
          res.t(`You don't have permission to perform the action.`),
          401
        )
      );

    return next();
  });
};

exports.getAllFriends = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const users = await Member.findById(id).select("friends").populate({
    path: "friends",
    select: "firstName lastName fullName profilePicture coverPicture",
  });
  // .populate("friends");

  res.status(200).json({
    status: "success",
    results: users.friends.length,
    data: users,
  });
});
