const express = require("express");
const router = express.Router();
const { Notes, validateNotes } = require("../models/notes");
const auth = require("../middleware/auth");
const validateId = require("../middleware/validateId");
const mongoose = require("mongoose");

router.get("/", auth, async (req, res) => {
  const notes = await Notes.find({ userId: req.user._id });

  const payload = notes.map((note) => ({
    _id: note._id,
    title: note.title,
    body: note.body,
    date: note.date,
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
  };

  res.send(payload);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateNotes(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const notes = new Notes({
    title: req.body.title,
    body: req.body.body,
    userId: req.user._id,
  });
  await notes.save();

  res.send(notes);
});

router.put("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findById(req.params.id);
  if (!note) return res.status(404).send("no noet id in the database");

  const { error } = validateNotes(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  note.title = req.body.title;
  note.body = req.body.body;
  note.date = Date.now();
  await note.save();

  res.send(note);
});

router.delete("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findByIdAndRemove(req.params.id);
  if (!note) return res.status(404).send("no note id in the database");

  res.send(note);
});

module.exports = router;
