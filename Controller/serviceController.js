const catchAsync = require("../Util/catchAsync");
const {
  createOne,
  updateOne,
  deleteOne,
  getAll,
  getOne,
} = require("./handlerFactory");

const Service_Product_Model = require("../Models/serviceProduct");
const apiError = require("../Util/apiError");
const Member = require("../Models/member");

exports.createService = catchAsync(async (req, res, next) => {
  const body = req.body;
  // An Admin can also make service for himself or his team member
  const id = req.params?.id || req.user?.id;

  const service_product = await Service_Product_Model.create({
    ...body,
    provider: id,
  });
  if (!service_product)
    return next(new apiError("Failed to create a new service or product", 400));
  await Member.findByIdAndUpdate(id, {
    $push: { service: service_product.id },
  });
  res.status(201).json({ status: "success", data: service_product });
});

exports.updateService = updateOne(Service_Product_Model);
exports.deleteOneService = deleteOne(Service_Product_Model);
exports.getAllServices = getAll(Service_Product_Model, [
  { path: "provider", select: "firstName lastName fullName profilePicture" },
]);
exports.getOneService = getOne(Service_Product_Model, [
  {
    path: "provider",
    select: `firstName lastName fullName email phone city country postalCode street profilePicture`,
  },
]);
