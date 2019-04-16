//ENVIRONMENT CONFIGS
const dotenv = require("dotenv");
dotenv.config();
//REQUIREMENTS FROM node_modules
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
//REQUIREMENTS FROM files
const router = require("./router/route");
//SERVER CONFIGURATIONS AND SETUPS
const app = express();
app.use(router);
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(
  session({
    key: "user_sid",
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);
const PORT = process.env.PORT;
app.listen(PORT, () => console.log("Server Started at post : " + PORT));
