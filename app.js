const express = require("express");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use = morgan("dev");

app.get("/", (req, res) => {
  res.send("Hello Tosin");
});

port = 4040;
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
