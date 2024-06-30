const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(morgan("dev"));

const uri = process.env.MONGODB_URL;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Database connected sucessfully");
  })
  .catch((error) => {
    console.log("error connecting to database:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello Tosin");
});

port = 4040;
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
