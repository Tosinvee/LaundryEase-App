const app = require("./app");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

port = 5050;
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
