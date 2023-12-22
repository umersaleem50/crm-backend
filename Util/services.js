exports.defaultFields = (...fields) => {
  return (req, res, next) => {
    if (req.query) {
      req.query.fields = fields.join(",");
    }
    next();
  };
};
