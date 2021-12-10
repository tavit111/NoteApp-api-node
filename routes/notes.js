const express = require("express");
const router = express.Router();
const { Notes, validateNotes } = require("../models/notes");
const { Categories } = require("../models/categories");
const auth = require("../middleware/auth");
const validateId = require("../middleware/validateId");
const mongoose = require("mongoose");
const _ = require("lodash");

router.get("/", auth, async (req, res) => {
  const notes = await Notes.find({ userId: req.user._id })
    .populate("category", "_id name")
    .sort("-date");

  const payload = notes.map((note) =>
    _.pick(note, ["_id", "title", "body", "category"])
  );

  res.send(payload);
});

router.get("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findById(req.params.id);
  if (!note) return res.status(404).send("no note id in the database");

  const payload = _.pick(note, ["_id", "title", "body", "category"]);

  res.send(payload);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateNotes(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = req.body.category;

  const notes = new Notes({
    title: req.body.title,
    body: req.body.body,
    userId: req.user._id,
    category: category,
  });

  await Categories.incrementCount(category);
  await notes.save();

  const payload = _.pick(notes, ["_id", "title", "body", "category"]);
  res.send(payload);
});

router.put("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findById(req.params.id);
  if (!note) return res.status(404).send("no noet id in the database");

  const { error } = validateNotes(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  await Categories.decrementCount(note.category);
  await Categories.incrementCount(req.body.category);

  note.title = req.body.title;
  note.body = req.body.body;
  note.date = Date.now();
  note.category = req.body.category;
  await note.save();

  res.send(note);
});

router.delete("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findByIdAndRemove(req.params.id);
  if (!note) return res.status(404).send("no note id in the database");

  await Categories.decrementCount(note.category);

  res.send(note);
});

module.exports = router;
