// const categories = [
//     {_id: "1", name: "New", count: 12},
//     {_id: "2", name: "Planed", count: 8},
//     {_id: "3", name: "In Progress", count: 16},
//     {_id: "4", name: "Lounched", count: 20},
// ];

const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const Categories = mongoose.model(
  "Categories",
  new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      min: 1,
      max: 16,
      require: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    count: {
      type: Number,
      min: 0,
      default: 0,
    },
  })
);

const validateCategories = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(16).required(),
  });
  return schema.validate(category);
};

module.exports = {
  Categories,
  validateCategories,
};
