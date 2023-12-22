const mongoose = require("mongoose");
const { models, model } = require("mongoose");
const { isEmail } = require("validator");
const permissions = require("../Dev-Data/permissions");
const professions = require("../Dev-Data/professions");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const memberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: [true, "A user must have a first name."],
    },
    lastName: {
      type: String,
      // required: [true, "A user must have a last name."],
    },
    email: {
      type: String,
      required: [true, "A user must have a valid email."],
      validate: isEmail,
      unique: true,
      select: true,
    },
    password: {
      type: String,
      minLength: [8, "Password must have at-least 8 characters or letters."],
      maxLength: [32, "Password must be less than 32 characters or letters."],
      required: [true, "Please choose a unique password."],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password."],
      minLength: [8, "Password must have at-least 8 characters or letters."],
      maxLength: [32, "Password must be less than 32 characters or letters."],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Please match your password.",
      },
      select: false,
    },
    professions: {
      type: [String],
      // required: [true, "Please provide professions for account."],
      enum: {
        values: professions,
        message: "Please choose a valid profession",
      },
      // validate: {
      //   validator: function (val) {
      //     return val.length > 0;
      //   },
      //   message: "Please provide professions for account.",
      // },
    },
    permissions: {
      type: [String],
      // required: [true, "Please provide the permissions for the account."],
      enum: {
        values: permissions,
        message: "Please choose a valid permission.",
      },
    },
    team: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "member",
      default: [],
    },
    profilePicture: {
      type: String,
      default: "default-profilePicture.jpg",
    },
    coverPicture: {
      type: String,
      default: "default-coverPicture.jpg",
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpire: {
      type: Date,
      select: false,
    },
    // contactDetails: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "Contact",
    // },
    category: {
      type: String,
    },
    bio: {
      type: String,
      max: [200, "A bio must be of maximum 60 words."],
      min: [50, "A bio must be of atleast 10 words."],
    },
    phone: {
      type: String,
      //   validate: isMobilePhoneLocales,
    },

    postalCode: {
      type: String,
      //   validate: isPostalCode,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    street: {
      type: String,
    },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
    },
    service: {
      type: [mongoose.Schema.ObjectId],
      ref: "serviceproduct",
    },
    gallery: {
      type: [String],
      default: () => new Array(5).fill("default-gallery.jpg"),
      validate: [
        function (val) {
          return val.length <= 8;
        },
        "You can only upload maximum of 8 images for the gallery.",
      ],
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "member",
      select: "email firstName lastName fullName profilePicture",
    },
    friends: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "member",
        // select: "firstName lastName email",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
    },
  }
);

memberSchema.pre("/^find/", function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

memberSchema.pre("findOne", function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

memberSchema.virtual("fullName").get(function () {
  if (!this.firstName && !this.lastName) return;
  return this.firstName + " " + this.lastName;
});

memberSchema.virtual("memberQunatity").get(function () {
  if (this.team) return this.team.length;
});

memberSchema.virtual("address").get(function () {
  if (this.street && this.city && this.country && this.postalCode) {
    return `Postal Code: ${this.postalCode}, ${this.street}, ${this.city}, ${this.country}`;
  }
});

memberSchema.methods.createResetToken = async function () {
  const randomToken = crypto.randomBytes(32).toString("hex");
  const resetToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");
  this.passwordResetToken = resetToken;
  this.passwordResetExpire = Date.now() + 10 * 60 * 60 * 1000;
  return randomToken;
};
/**
 *
 * @param {String} inputPassword Password typed by the user
 * @param {String} encryptedPassword EncryptedPassword, by which the typed one will be compare
 * @returns Return true if both passwords match, otherwise return false
 */
memberSchema.methods.correctPassword = async function (
  inputPassword,
  encryptedPassword
) {
  return await bcrypt.compare(inputPassword, encryptedPassword);
};

memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = "";
  next();
});

let Member;

Member = models.member || model("member", memberSchema);

module.exports = Member;
