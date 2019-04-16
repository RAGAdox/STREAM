//REQUIREMENTS FROM node_modules
const express = require("express");
var bodyParser = require("body-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const ThumbnailGenerator = require("video-thumbnail-generator").default;
//REQUIREMENTS FROM js
const user = require("../models/users");
const sessionChecker = require("../middleware/sessionChecker");
//Route Configurations
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(
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
router.use(fileUpload());
const storageRoot = "./uploads/";
//Routes
router.get("/", (req, res) => {
  let filelist = [];
  fs.readdir(storageRoot, (err, files) => {
    files.forEach(file => {
      console.log(file);

      if (!fs.statSync(storageRoot + file).isDirectory()) filelist.push(file);
    });
  });
  res.json({ msg: "working" });
});
router.get("/login", (req, res, next) => {
  res.render("login");
});
router.post("/login", (req, res, next) => {
  if (req.body.username == "admin" && req.body.password == "admin") {
    user.username = req.body.username;
    user.password = req.body.password;
    req.session.user = user;
    res.json({ msg: "login successfull" });
    next();
  } else {
    res.render("login", {
      msg: "invalid Credentials"
    });
  }
});
router.get("/check", sessionChecker, (req, res) => {
  res.json({ status: "its ok" });
});
router.get("/logout", (req, res) => {
  if (req.session.user) {
    //|| req.cookies.user_sid
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});
router.get("/uploadFile", (req, res) => {
  res.render("upload");
});
router.post("/upload", (req, res) => {
  //console.log(req.body.foldername)
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  uploadPath = path.join("./uploads/" + sampleFile.name);
  if(path.extname(sampleFile.name)=='.mp4'){
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      console.log(err);
      //return res.status(500).send(err);
    }
    const tg = new ThumbnailGenerator({
      sourcePath: uploadPath,
      thumbnailPath: "./uploads/"
      //tmpDir: "/some/writeable/directory" //only required if you can't write to /tmp/ and you need to generate gifs
    });

    tg.generateOneByPercent(90).then(
      res.send(
        "File uploaded to " +
          uploadPath +
          "extention is " +
          path.extname(uploadPath || "")
      )
    );
  });
  }
  else
    res.send('file not of supported format')
  //res.redirect(req.headers.referer);
});
router.use(sessionChecker, express.static("uploads"));
module.exports = router;
