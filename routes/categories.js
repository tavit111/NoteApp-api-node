const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validateId = require("../middleware/validateId");
const _ = require("lodash");
const { Categories, validateCategories } = require("../models/categories.js");

router.get("/", auth, async (req, res) => {
  const categories = await Categories.find({ userId: req.user._id }).sort(
    "-_id"
  );

  const payload = categories.map((category) =>
    _.pick(category, ["_id", "name", "count"])
  );

  res.send(payload);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateCategories(req.body);
  if (error) return res.status(401).send(error.details[0].message);

  const isNameExists = await Categories.findOne({
    name: req.body.name,
    userId: req.user._id,
  });
  if (isNameExists) return res.status(400).send("name arleady exists");

  const category = new Categories({
    name: req.body.name,
    userId: req.user._id,
    count: 0,
  });
  await category.save();

  const payload = _.pick(category, ["_id", "name", "count"]);
  res.send(payload);
});

router.delete("/:id", [auth, validateId], async (req, res) => {
  const category = await Categories.findByIdAndRemove(req.params.id);
  if (!category) return res.status(404).send("no category id in the database");

  const payload = _.pick(category, ["_id", "name", "count"]);
  res.send(payload);
});

module.exports = router;
