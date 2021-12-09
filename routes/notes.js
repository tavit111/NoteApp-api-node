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

  const payload = notes.map((note) => ({
    _id: note._id,
    title: note.title,
    body: note.body,
    date: note.date,
    category: note.category,
  }));

  res.send(payload);
});

router.get("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findById(req.params.id);
  if (!note) return res.status(404).send("no note id in the database");

  const payload = {
    _id: note._id,
    title: note.title,
    body: note.body,
    category: note.category,
  };

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

  // increament
  if (category) {
    await Categories.findByIdAndUpdate(category, {
      $inc: { count: 1 },
    });
  }

  await notes.save();

  const payload = _.pick(notes, ["_id", "title", "body", "category"]);
  res.send(payload);
});

router.put("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findById(req.params.id);
  if (!note) return res.status(404).send("no noet id in the database");

  const { error } = validateNotes(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // decrement
  if (note.category) {
    await Categories.findByIdAndUpdate(note.category, {
      $inc: { count: -1 },
    });
  }

  // increament
  if (req.body.category) {
    await Categories.findByIdAndUpdate(req.body.category, {
      $inc: { count: 1 },
    });
  }

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

  // decrement
  if (note.category) {
    await Categories.findByIdAndUpdate(note.category, {
      $inc: { count: -1 },
    });
  }

  res.send(note);
});

module.exports = router;
