const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const mongoose = require('mongoose')
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/database");

const homeRoutes = require('./routes/home')
const userRoutes = require('./routes/user')
// Allows us to use process.end.<variable name> to abstract URI strings and API keys
require("dotenv").config({ path: "./config/.env" });

// Connect to DB
connectDB();

// Middleware
// Set view engine to use ejs
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Use session to create session id
// Use uuid to create unique user name for each session/user id
app.use(
  session({
    genid: (req) => {
      console.log("1. in genid req.sessionID: ", req.sessionID);
      return uuidv4();
    },
    // Store it into mongoDB
    store: MongoStore.create({ mongoUrl: process.env.DB_STRING }),
    collectionName: "sessions",
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: false,
  })
);
// Routers
app.use('/', homeRoutes)
// User functions including city edits and adds
app.use('/user', userRoutes)

// Server response on port var
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running fast on port ${process.env.PORT}, you better catch it!`
  );
});
