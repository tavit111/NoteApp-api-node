const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  const isValid = mongoose.isValidObjectId(req.params.id);
  if (!isValid) return res.status(404).send("Invalid id");

  next();
};
