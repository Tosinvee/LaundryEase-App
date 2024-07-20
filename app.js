require("dotenv").config();
const express = require("express");
//const expressEjsLayouts = require("express-ejs-layouts");
//const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const AppError = require("./src/utils/appError");
const globalError = require("./src/controller/errorController");
const userRouter = require("./src/routes/userRoutes");

//const passport = require("passport");

// Passport config
require("./src/config/passport")(passport);

const app = express();

// app.set("views", path.join(__dirname, "src", "views"));
// app.set("view engine", "ejs");
// app.use(expressEjsLayouts);

// app.get("/", (req, res, next) => {
//   res.render("index");
// });

app.use(morgan("dev"));
app.use(express.json());

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST"], // Specify allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
};

app.use(cors(corsOptions));

// app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Do not save session if unmodified
    saveUninitialized: false, // Do not create session until something stored
    cookie: { secure: false }, // Set to true if using HTTPS
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRouter);

// app.get("/", (req, res, next) => {
//   res.render("index");
// });

app.use("*", (req, res, next) => {
  next(new AppError(`can't find this ${req.originalUrl} on this server`));
});

app.use(globalError);

module.exports = app;
