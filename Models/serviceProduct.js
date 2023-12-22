const { model, Schema, default: mongoose } = require("mongoose");

const serviceProductSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: ["service", "product"],
      message: ["A type could only be service or product."],
    },
    required: [true, "You must need to provide a type."],
    toLowerCase: true,
  },
  price: {
    type: Number,
    min: [1, "Please a provide a postive number."],
  },
  heading: {
    type: String,
    max: [128, "Please provide the name with less the 128 characters."],
    required: [true, "Please provide the name of product or service."],
  },
  description: {
    type: String,
    required: [true, "Please provide a description for the service."],
    max: [400, `Please provide the name with less the 400 characters.`],
  },
  title: {
    type: String,
    required: [true, "Please provide title for product or service."],
  },
  coverPicture: {
    type: String,
    default: "default-coverPicture.jpg",
  },
  tags: {
    type: [String],
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, "A product or service must have rating equal or greater than 1"],
    max: [5, "A product or service must have rating equal or less than 5"],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  // storeLocation: {
  //   type: {

  //     location: {
  //       type: {
  //         type: String, // Don't do `{ location: { type: String } }`
  //         enum: ["Point"], // 'location.type' must be 'Point'
  //         default: "Point",
  //       },
  //       coordinates: {
  //         type: [Number],
  //       },
  //     },
  //   },
  //   required: [
  //     true,
  //     "Please provide the country & city for the service or product.",
  //   ],
  // },

  city: {
    type: String,
    required: [
      true,
      "Please add city where you're poviding the service or product.",
    ],
  },
  country: {
    type: String,
    required: [
      true,
      "Please add country where you're providing the service or product.",
    ],
  },
  phoneCode: {
    type: String,
  },
  countryCode: {
    type: String,
  },

  provider: {
    type: mongoose.Schema.ObjectId,
    ref: "member",
    required: [true, "A product or service must belong to a member."],
  },

  gallery: {
    type: [String],
    validate: [
      function (val) {
        return val.length <= 8;
      },
      "A galley could only have 8 images.",
    ],
    default: new Array(4).fill("default-gallery.jpg"),
  },

  details: {
    type: [
      {
        photo: { type: String, default: "default-coverPicture.jpg" },
        heading: {
          type: String,
          max: [
            128,
            `Please provide the heading with less the 128 characters.`,
          ],
          default:
            "Please add some heading for the feature of your service or product.",
        },
        description: {
          type: String,
          max: [
            200,
            `Please provide the description of details with less the 200 characters.`,
          ],
          default:
            "Please add some details about the features of your service or product.",
        },
      },
    ],
    validate: [
      function (val) {
        return val.length <= 3;
      },
      "You can only insert 3 details sections.",
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const ServiceProduct = model("serviceproduct", serviceProductSchema);
ServiceProduct.collection.createIndex({ heading: "text", description: "text" });

module.exports = ServiceProduct;
