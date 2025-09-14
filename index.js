const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const app = express();
const notes = require("./routes/notes");
const user = require("./routes/user");
const auth = require("./routes/auth");
const categories = require("./routes/categories");

// Load .env.* file if exist
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenvfile = `.env.${process.env.NODE_ENV || "development"}`;
    require("dotenv").config({
      path: dotenvfile,
    });
    console.log(`Loding env variables from ${dotenvfile}`);
  } catch (e) {
    console.log("No .env file detected");
  }
}

// check for JWT_PRIVATE_KEY in env varaibles
if (!process.env.JWT_PRIVATE_KEY) {
  console.error("FATAL ERROR: JWT_PRIVATE_KEY is not defined.");
  process.exit(1);
}

//middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-auth-token",
    "X-Auth-Token",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

//endpoints
app.use("/api/notes", notes);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/categories", categories);

//connect to db
const dbUrl = process.env.MONGO_URL;
mongoose
  .connect(dbUrl)
  .then(() => console.log(`connected to db ${dbUrl}`))
  .catch((er) => console.log(er));

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

//server listener
const port = process.env.PORT;
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`listen on port ${port}...`),
);

module.exports = server;

//todo:
// - make transaction for incrementing and decrementing with saving the notes
