require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const AppError = require("./src/utils/appError");
const globalError = require("./src/controller/errorController");
const authRouter = require("./src/routes/authRoutes");
const userRouter = require("./src/routes/userRoutes");

// Passport config
require("./src/config/passport")(passport);

const app = express();

if ((process.env.NODE_ENV = "development")) app.use(morgan("dev"));
app.use(express.json());

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(passport.initialize());

app.use("/api/auths", authRouter);
app.use("/api/users", userRouter);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "simple swagger setup",
      description: "Asimple swagger documentation setup",
      contact: {
        name: "Vicmar",
      },
      servers: ["http://localhost:5050"],
    },
    schemes: ["http", "https"],
  },
  apis: ["./src/routes/*.js"],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api/users/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("*", (req, res, next) => {
  next(new AppError(`can't find this ${req.originalUrl} on this server`));
});

app.use(globalError);

module.exports = app;
