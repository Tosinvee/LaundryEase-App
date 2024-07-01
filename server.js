const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Database connected sucessfully");
  })
  .catch((error) => {
    console.log("error connecting to database:", error);
  });

port = 4040;
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
