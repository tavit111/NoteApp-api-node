const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validateAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("wrong email or password");

  const compare = await bcrypt.compare(req.body.password, user.password);
  if (!compare) return res.status(400).send("wrong email or password");

  const token = user.genereateJwt();
  res.send(token);
});

function validateAuth(login) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(50).required(),
  });
  return schema.validate(login);
}

module.exports = router;
