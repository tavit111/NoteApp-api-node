const express = require("express");
const router = express.Router();
const { Notes, validateNotes } = require("../models/notes");
const auth = require("../middleware/auth");
const validateId = require("../middleware/validateId");
const mongoose = require("mongoose");

router.get("/", auth, async (req, res) => {
  const notes = await Notes.find({ userId: req.user._id });

  res.send(notes);
});

router.get("/:id", [validateId, auth], async (req, res) => {
  const note = await Notes.findById(req.params.id);
  if (!note) return res.status(404).send("no user id in the database");

  res.send(note);
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

module.exports = router;
