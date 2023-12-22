const catchAsync = require("../Util/catchAsync");
// const Member = require("../Models/member");
const multer = require("multer");
// const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const apiError = require("../Util/apiError");
const jimp = require("jimp");

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  }
  cb("Please only upload Images", false);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, //LIMIT OF FILE SIZE IS 5MBS
});

/**
 * Generate an image with filename in the storage, set the field to image filename & call next() middleware
 * @param {String} field
 * @param {Array} sizes
 * @returns next() and call the next middleware
 */

const resizeOneImage = (field, sizes) =>
  catchAsync(async (req, res, next) => {
    if (!req.files || !req.files[field]) return next();
    const filename = `${req.user.id}-${Date.now()}-${field}.jpeg`;

    await jimp.read(req.files[field][0].buffer, (err, lenna) => {
      if (err) return next(err);
      lenna
        .cover(sizes[0], sizes[1])
        .quality(90)
        .write(`public/storage/images/${field}/${filename}`);
      req.body[field] = filename;

      next();
    });

    // await sharp(req.files[field][0].buffer)
    //   .resize(sizes[0], sizes[1])
    //   .toFormat("jpeg")
    //   .jpeg({ quality: 90 })
    //   .toFile(`public/storage/images/${field}/${filename}`);
    // req.body[field] = filename;

    next();
  });

const resizeGalleryImages = (field, sizes, path = "") =>
  catchAsync(async (req, res, next) => {
    if (!req.files || !req.files[field]) return next();

    const arrayOfFileName = [];
    const arrayOfFiles = [...req.files[field]];

    arrayOfFiles.forEach(async (file, i) => {
      const filename = `${req.user.id}-${Date.now()}-${
        field + "-" + (i + 1)
      }.jpeg`;

      arrayOfFileName.unshift(filename);

      await jimp.read(file.buffer, (err, leena) => {
        if (err) return next(err);
        leena
          .cover(sizes[0], sizes[1])
          .quality(90)
          .write(`public/storage/images/${path}/${field}/${filename}`);
        return;
      });

      // await sharp(file.buffer)
      //   .resize(sizes[0], sizes[1])
      //   .toFormat("jpeg")
      //   .jpeg({ quality: 90 })
      //   .toFile(`public/storage/images/${path}/${field}/${filename}`)
      //   .catch((err) =>
      //     next(
      //       new apiError(
      //         `Failed to write the ${field}, Please make sure you have the folder in your file system`,
      //         500
      //       )
      //     )
      //   );
    });

    req.body[field] = arrayOfFileName;

    next();
  });

const resizeServiceDetail = (totalField = 3, sizes) =>
  catchAsync(async (req, res, next) => {
    if (!req.files) return next();
    const entries = Object.keys(req.files).filter((name, i) => {
      return name.includes("details");
    });

    if (!entries || !entries.length) return next();

    entries.forEach(async (field, i) => {
      const fileName = `${req.user.id}-${Date.now()}-${
        "details" + "-" + (i + 1)
      }.jpeg`;

      if (!req.body.details || !req.body.details.length)
        return next(
          new apiError(
            "Please also add heading in you body. To change the photo",
            400
          )
        );

      req.body.details[i].photo = fileName;

      // await sharp(req.files[field][0].buffer)
      //   .resize(sizes[0], sizes[1])
      //   .toFormat("jpeg")
      //   .jpeg({ quality: 90 })
      //   .toFile(`public/storage/images/service/photo/${fileName}`);

      await jimp.read(req.files[field][0].buffer, (err, leena) => {
        if (err) return next(err);
        leena
          .cover(sizes[0], sizes[1])
          .quality(90)
          .write(`public/storage/images/service/photo/${fileName}`);

        return;
      });
    });

    next();
  });

/**
 *
 * @param {String} field Field of the file
 * @param {String} dirLocation Directory where the file might exist
 * @returns Return next() middleware
 */

const deletePreviousImage = (field, dirLocation, Model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id || req.user.id;
    const doc = await Model.findById(id).select(`${field}`);

    if (Array.isArray(doc[field])) {
      doc[field].map((file, i) => {
        fs.unlink(
          path.join(
            __dirname,
            "..",
            "..",
            `/public/storage/images/${dirLocation}/${user[field]}`
          ),
          (err) => {
            return next();
          }
        );
      });
    }
  });
};

exports.deletePreviousImage = deletePreviousImage;

exports.uploadProfileImages = uploadImage.fields([
  {
    name: "profilePicture",
    maxCount: 1,
  },
  {
    name: "coverPicture",
    maxCount: 1,
  },
]);

// exports.uploadProfileImage = uploadImage.single("profilePicture");
exports.uploadProfileImages = uploadImage.fields([
  {
    name: "profilePicture",
    maxCount: 1,
  },
  {
    name: "coverPicture",
    maxCount: 1,
  },
  {
    name: "gallery",
    maxCount: 8,
  },
]);

exports.uploadServiceImages = uploadImage.fields([
  {
    name: "gallery",
    maxCount: 8,
  },
  {
    name: "coverPicture",
    maxCount: 1,
  },
  {
    name: "details[0][photo]",
    maxCount: 1,
  },
  {
    name: "details[1][photo]",
    maxCount: 1,
  },
  {
    name: "details[2][photo]",
    maxCount: 1,
  },
]);

exports.uploadNewPostImages = uploadImage.fields([
  { name: "images", maxCount: 10 },
]);

// exports.uploadCoverImage = uploadImage.single("coverPicture");
// exports.uploadGalleryImage = uploadImage.single("gallery");

exports.resizeGallery = resizeGalleryImages("gallery", [700, 500]);
exports.resizeNewPostImages = resizeGalleryImages(
  "images",
  [700, 600],
  "new-post"
);
// exports.resizeServiceGalleryImage = resizeOneImage("gallery", [500, 340]);
exports.resizeProfilePicture = resizeOneImage("profilePicture", [500, 500]);
exports.resizeCoverImage = resizeOneImage("coverPicture", [1420, 275]);
exports.resizeGalleryImage = resizeOneImage("gallery", [500, 340]);
// exports.resizeServiceGalleryImage = resizeOneImage("gallery", [500, 340]);
exports.resizeServiceDetailPhoto = resizeServiceDetail(3, [600, 500]);
exports.resizeServiceGallery = resizeGalleryImages(
  "gallery",
  [700, 500],
  "/service"
);

// exports.resizeProfilePicture = resizePhoto("profilePicture", [500, 500]);

// exports.resizeCoverImage = resizePhoto("coverPicture", [1420, 275]);
