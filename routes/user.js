const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { User, validateUser } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("email aready registered");

  user = new User({
    name: req.body.name,
    email: req.body.email,
  });
  user.password = await bcrypt.hash(req.body.password, 10);
  await user.save();

  const token = user.genereateJwt();
  const userProperties = _.pick(user, ["_id", "name", "email"]);
  res
    .header("Access-Control-Expose-Headers", "x-auth-token")
    .header("x-auth-token", token)
    .send(userProperties);
});

module.exports = router;
