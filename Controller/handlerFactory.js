const apiError = require("../Util/apiError");
const ApiFeature = require("../Util/apiFeature");
const catchAsync = require("../Util/catchAsync");

/**
* Create a document for a given Model
@param Object [Model] Model
@return Return a response with valid data
*/

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const body = req.body;
    const doc = await Model.create(body);

    if (!doc) return next(new apiError("No document found with this id!", 404));

    res.status(201).json({ status: "success", data: doc });
  });
};

/**
* Update a document from given model with id
@param Object [Model] Model
@param Object [populateOptions] Object or string, to populate the document
@return Return a response with valid data
*/

exports.updateOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    const body = req.body;
    const id = req.params.id;
    const doc = await Model.findByIdAndUpdate(id, body, {
      runValidators: true,
      new: true,
    });
    if (populateOptions) {
      await doc.populate(populateOptions);
    }
    if (!doc) return next(new apiError("No document found with this id!", 404));
    res.status(200).json({ status: "success", data: doc });
  });
};

/**
* Delete a document from given model with an id
@param Object [Model] Model
@return Return a response with valid data
*/
exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return next(new apiError("No document found with this id!", 404));
    res.status(204).json({ status: "success", data: null });
  });
};

/**
* Get a document for given model with a give id
@param Object [Model] Model
@param Object [populateOptions] Array of populate Options or string, to populate the document
@return Return a response with valid data
*/

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = Model.findById(id);

    if (populateOptions && Array.isArray(populateOptions)) {
      populateOptions.forEach((el, i) => {
        query.populate(el);
      });
    } else {
      query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) return next(new apiError("No document found with :id!", 404));
    res.status(200).json({ status: "success", data: doc });
  });
};

/**
* Get all document for given model
@param Object [Model] Model
@param Object [populateOptions] Object or string, to populate the document
@return Return a response with valid data
*/

exports.getAll = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.find();
    if (populateOptions && Array.isArray(populateOptions)) {
      populateOptions.forEach((el, i) => {
        query.populate(el);
      });
    } else {
      query.populate(populateOptions);
    }
    const feature = new ApiFeature(query, req.query)
      .filter()
      .sort()
      .limit()
      .pagination()
      .search();
    const doc = await feature.query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: doc,
    });
  });
};
