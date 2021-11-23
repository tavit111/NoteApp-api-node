const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const express = require("express");
const app = express();
const notes = require("./routes/notes");
const user = require("./routes/user");
const auth = require("./routes/auth");

//middleware
app.use(express.json());
app.use(cors());

//endpoints
app.use("/api/notes", notes);
app.use("/api/user", user);
app.use("/api/auth", auth);

//connect to db
const dbUrl = config.get("db");
mongoose
  .connect(dbUrl)
  .then(() => console.log(`connected to db ${dbUrl}`))
  .catch((er) => console.log(er));

//server listener
const port = config.get("port");
const server = app.listen(port, () => console.log(`listen on port ${port}...`));

module.exports = server;
