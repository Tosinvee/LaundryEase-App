const express = require("express");
const morgan = require("morgan");
const app = express();
const AppError = require("./src/utils/appError");
const globalError = require("./src/controller/errorController");
const userRouter = require("./src/routes/userRoutes");

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/users", userRouter);

app.use("*", (req, res, next) => {
  // const error = new Error(`can't find this ${req.originalUrl} on this server`);
  // error.status = "fail";
  // error.statusCode = 404;

  next(new AppError(`can't find this ${req.originalUrl} on this server`));
});

app.use(globalError);

module.exports = app;
