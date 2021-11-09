const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const Notes = mongoose.model(
  "Notes",
  new mongoose.Schema({
    title: {
      type: String,
      require: true,
      max: 100,
      min: 1,
    },
    body: {
      type: String,
      max: 999,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
  })
);

const validateNotes = (note) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    body: Joi.string().max(999),
  });
  return schema.validate(note);
};

module.exports = {
  Notes,
  validateNotes,
};
