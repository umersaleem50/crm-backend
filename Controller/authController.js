const catchAsync = require("../Util/catchAsync");
const Member = require("../Models/member");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const apiError = require("../Util/apiError");
const crypto = require("crypto");
const { Email } = require("../Util/sendMail");
const DEV_PERMISSIONS = require("../Dev-Data/permissions");

/**
* Verify the given jwt token and return the valid data stored in the token
@param String [token] JWT Token
@return Object
*/

const verifyToken = async (token) => {
  const { id, iat } = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECERT_KEY
  );
  return { id, iat };
};

/**
* Create a valid token, valid for limit timestamp
@param String [id] ID of the user to store in token
@return String [] Returns a valid token
*/

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECERT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
* Create & Send valid JWT & document Data in response
@param res [Object] Response to be sent with token
@param status [Number] Reponse status of the response
@param data [Object] Object of data to be sent
@return Number [] Reponse status of the response
*/

const sendTokenAndResponse = (res, status, data) => {
  const token = createToken(data.id);
  if (data.password) data.password = undefined;
  return res
    .cookie("jwt", token, { maxAge: 24 * 60 * 60 * 1000 * 10, httpOnly: true })
    .status(status)
    .json({ status: res.t("success"), token, data });
};

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new apiError(res.t("Please provide email and password."), 400));
  }

  const user = await Member.findOne({ email }).select("+password").populate({
    path: "admin",
    select: "firstName lastName fullName email profilePicture",
  });

  const checkpassword = await user?.correctPassword(password, user.password);

  if (!user || !checkpassword) {
    return next(new apiError(res.t("Invalid email or password."), 401));
  }

  sendTokenAndResponse(res, 200, user);
});

/**
* Checks if the user is logged in before accessing the route
* Use this route if you want to protect the route
@return Object [next] Retrun next obj to call the next middleware
*/

const protectedRoute = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.header("authorization") &&
    req.header("authorization").startsWith("Bearer")
  )
    token = req.header("authorization")?.split(" ")[1];

  if (req.cookies && req.cookies.jwt) token = req.cookies.jwt;

  if (req.body.token) token = req.body.token;

  const decode = token && (await verifyToken(token));

  if (!token || !decode.id) {
    return next(
      new apiError(res.t("Token invalid, Please login again to get one!"), 400)
    );
  }

  const userData = await Member.findById(decode.id).select(
    "+passwordChangedAt"
  );

  if (
    userData.passwordChangedAt &&
    userData.passwordChangedAt > decode.iat * 1000
  ) {
    return next(
      new apiError(
        res.t(
          "User changed the password after issuing token. Please login again."
        ),
        400
      )
    );
  }

  req.user = userData;

  next();
});

/**
* Update the Password of the account
@params id [String] id will be in params, otherwise it will the id of logged-in user
@return Object [res] Retrun response with valid data
*/

const updatePassword = catchAsync(async (req, res, next) => {
  // const { id } = req.params || req.user
  const id = (req.params && req.params.id) || req.user.id;
  const { oldPassword, password, passwordConfirm } = req.body;

  if ((!req.params.id && !oldPassword) || !password || !passwordConfirm)
    return next(
      new apiError(
        `${res.t("Please provide")} ${
          !req.params.id ? res.t("current-password,") : ""
        } ${res.t("password & password-confirm")}`,
        400
      )
    );

  const user = await Member.findById(id).select("+password");
  // const user = await Member.findById(id);
  if (!user)
    return next(
      new apiError(
        res.t("No user found with :id or account is un-active."),
        404
      )
    );

  //this will check if the there is id in the param, that means admin is changing password of the sub account
  if (
    !req.params.id &&
    !(await user.correctPassword(oldPassword, user.password))
  )
    return next(new apiError(res.t("Your current password is invalid."), 401));

  if (password !== passwordConfirm)
    return next(
      new apiError(res.t("password & passwordConfirm not matched."), 400)
    );

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  sendTokenAndResponse(res, 200, user);
});

/**
* Signup a new account
@params mainId [String] Id of the admin user
@return Object [res] Retrun response with valid data
*/

const signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, firstName, lastName } = req.body;
  let { permissions } = req.body;
  if (!permissions) permissions = DEV_PERMISSIONS;
  const user = await Member.create({
    email,
    password,
    passwordConfirm,
    firstName,
    lastName,
    permissions,
  });
  const url = `${req.protocol}://localhost:3000`;
  await new Email(user, url).sendWelcome();
  if (user) return sendTokenAndResponse(res, 201, user);
});

/**
* Request the forget password of the account
* This will send a reset token to your given email address
@query email [String] email address of the account
@return Object [res] Retrun response with a message
*/

const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new apiError(res.t("Please provide a valid email."), 400));
  }
  const member = await Member.findOne({ email });

  if (!member)
    return next(
      new apiError(res.t("No user found. Or account is deactivated."), 404)
    );

  const resetToken = await member.createResetToken();

  const tokenURl = `${req.protocol}://localhost:3000/auth/reset-password/${resetToken}`;

  // const tokenURl = `${req.protocol}://${req.get(
  //   "host"
  // )}/auth/reset-password/${resetToken}`;

  member.save({ validateBeforeSave: false });

  await new Email(member, tokenURl).sendPasswordReset();
  // await sendMail(email, resetToken);

  res.status(200).json({
    status: res.t("success"),
    message: res.t("Reset link sent to your email. Please check your mail."),
  });
});

/**
* Update your password if the given reset token is valid
* You will get the reset token in your mail
@params token [String] reset token for updating password
@return Object [res] Retrun response with valid data
*/

const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  if (!token)
    return next(
      new apiError(
        res.t("Please check your mail, you may receive a reset token."),
        400
      )
    );
  if (!password || !passwordConfirm) {
    return next(
      new apiError(res.t("Please provide provide a new password."), 401)
    );
  }

  const decryptToken = crypto.createHash("sha256").update(token).digest("hex");
  const member = await Member.findOne({
    passwordResetToken: decryptToken,
  }).select("+passwordResetToken +passwordResetExpire");

  if (!member) {
    return next(
      new apiError(
        res.t("Invalid reset token, Please check your mail again."),
        401
      )
    );
  }

  if (
    !member.passwordResetToken ||
    (member.passwordResetExpire &&
      member.passwordResetExpire.getTime() < Date.now())
  ) {
    return next(new apiError(res.t("Reset token expired."), 401));
  }

  member.passwordResetToken = "";
  member.passwordResetExpire = null;
  member.password = password;
  member.passwordConfirm = passwordConfirm;
  await member.save({ validateBeforeSave: true });
  res.status(200).json({
    status: res.t("success"),
    message: res.t("Password changed successfully."),
  });
});

/**
* Logout the profile
@return Object [res] return the response will no data
*/

const logoutProfile = catchAsync(async (req, res, next) => {
  res
    .cookie("jwt", "")
    .status(200)
    .json({ status: res.t("success"), data: null });
});

/**
 * Deactive the currently logged-in account
 @return return response with a message of success
 */

const deactiveAccount = catchAsync(async (req, res, next) => {
  const id = (req.params && req.params.id) || req.user.id;
  await Member.findByIdAndUpdate(id, { isActive: false });

  res
    .cookie("jwt", "")
    .status(200)
    .json({
      status: res.t("success"),
      message: res.t("Account deactivated successfully!"),
    });
});

module.exports = {
  login,
  signup,
  protectedRoute,
  verifyToken,
  updatePassword,
  forgetPassword,
  resetPassword,
  logoutProfile,
  deactiveAccount,
};
