const { models, model, Schema, default: mongoose } = require("mongoose");
const { isMobilePhoneLocales, isPostalCode } = require("validator");
const profileDetailSchema = new Schema(
  {
    member: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Details must belong to a member"],
      ref: "member",
      unique: true,
    },
    bio: {
      type: String,
      max: [200, "A bio must be of maximum 60 words."],
      min: [50, "A bio must be of atleast 10 words."],
    },
    phone: {
      type: String,
      //   validate: isMobilePhoneLocales,
      required: [true, "Please provide your phone number."],
    },

    postalCode: {
      type: String,
      //   validate: isPostalCode,
      required: [true, "Please provide your postal code."],
    },
    city: {
      type: String,
      required: [true, "Please provide your city name."],
    },
    country: {
      type: String,
      required: [true, "Please provide your country name."],
    },
    street: {
      type: String,
      required: [true, "Please provide your street address."],
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
      ref: "serviceProduct",
    },
    gallery: {
      type: [String],
      default: () => new Array(5).fill("default-gallery.jpg"),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

profileDetailSchema.virtual("address").get(function () {
  return `Postal Code: ${this.postalCode}, ${this.street}, ${this.city}, \n ${this.country}`;
});

const ProfileDetailModel =
  models.profileDetails || model("profileDetails", profileDetailSchema);

module.exports = ProfileDetailModel;
