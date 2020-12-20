// importing required libraries
var express = require("express");
var router = express.Router();
var dateFormat = require("dateformat");

//importing models
var Post = require("../schemas/post");
var User = require("../schemas/user");

//variable for current user
var loggedUser;

// good validation documentation available at https://express-validator.github.io/docs/
const { sanitizeBody } = require("express-validator");
const mongoose = require("mongoose");

//connecting to the database with mongoose
var DBUrl =
  "mongodb+srv://rhynnine:Kissa888!@cluster0.unrpb.mongodb.net/WAproject?retryWrites=true&w=majority";
mongoose.connect(DBUrl, { useNewUrlParser: true }).catch((e) => console.log(e));
mongoose.connection
  .once("open", function () {
    console.log("Connected");
  })
  .on("error", function (error) {
    console.log("An error ocurred", error);
  });

//rendering posts.pug view
router.get("/", function (req, res, next) {
  Post.find({}).exec(function (e, data1) {
    if (e) return next(e);
    res.render("posts", {
      title: "What's going on?",
      logged_user: loggedUser,
      post_list: data1
    });
  });
});

//log in
router.post("/login", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var lUser = req.body.user_login;
  var lPassword = req.body.pass_login;
  loggedUser = lUser;

  //checking database for matches
  User.find({}).exec(function (e, data1) {
    if (e) return next(e);
    Post.find({}).exec(function (e, data2) {
      if (e) return next(e);
      if (lUser && lPassword !== "") {
        var foundUser = 0;
        for (var i = 0; i < data1.length; i++) {
          if (data1[i].username === lUser && data1[i].password === lPassword) {
            foundUser++;
          }
        }
        //if user does not match, rendering the index.pug with error message, else rendering posts.pug view
        if (foundUser === 0) {
          res.render("index", {
            title: "What A day!",
            log_msg: "Incorrect username or password",
            post_list: data2
          });
        } else {
          res.redirect("/posts");
        }
        //if all fields not filled, index.pug view is rendered with error message
      } else {
        res.render("index", {
          title: "What A day!",
          log_msg: "Fill in log in details.",
          post_list: data2
        });
      }
    });
  });
});

//Creating a new account
router.post("/signup", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var lUser = req.body.user_signup;
  var lPassword = req.body.pass_signup;

  if (lUser && lPassword !== "") {
    User.find({}).exec(function (e, data1) {
      if (e) return next(e);
      Post.find({}).exec(function (e, data2) {
        if (e) return next(e);
        //checing whether username is unique
        var counter = 0;
        for (var i = 0; i < data1.length; i++) {
          if (data1[i].username === lUser) {
            counter++;
          }
        }
        //if username is taken, rendering the index.pug view with error message
        if (counter > 0) {
          res.render("index", {
            title: "What A day!",
            sign_msg1: "Username taken",
            post_list: data2
          });
          //if free, rendering the index.pug view with message
        } else {
          var user = new User({
            username: lUser,
            password: lPassword
          });
          user.save(function (e) {
            if (e) return next(e);
            Post.find({}).exec(function (e, data2) {
              if (e) return next(e);
              res.render("index", {
                title: "What A day!",
                sign_msg2: "Sign up was successful",
                post_list: data2
              });
            });
          });
        }
      });
    });
    //if all fields are not filled, rendering index.pug view with error message
  } else {
    Post.find({}).exec(function (e, data2) {
      if (e) return next(e);
      res.render("index", {
        title: "What A day!",
        sign_msg1: "Please, fill all the fields",
        post_list: data2
      });
    });
  }
});

//log out and returning to front page
router.post("/logout", function (req, res, next) {
  res.redirect("/");
});

//creating a new post
router.post("/create", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var lContent = req.body.content;

  if (lContent !== "") {
    //getting the correct date and time
    var time = new Date().getTime() + 3 * 60 * 60 * 1000;
    var date = dateFormat(time, "HH:MM dd.mm.yyyy");

    var post = new Post({
      user: loggedUser,
      content: lContent,
      time: date
    });
    //saving the post with time and user and rendering posts.pug view
    post.save(function (e) {
      if (e) return next(e);
      res.redirect("/posts");
    });
    //if all fields are not filled, rendering posts.pug view with error message
  } else {
    Post.find({}).exec(function (e, data2) {
      if (e) return next(e);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        submit_msg: "Write something to post content.",
        post_list: data2
      });
    });
  }
});

//filtering posts
//user can filter posts by username and/or date created

router.post("/filter", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var fUser = req.body.filter_username;
  var fDate = req.body.filter_date;
  var day = dateFormat(fDate, "dd.mm.yyyy");

  //checking which filters are used and filter the posts accordingly with rendering posts.pug view
  if (fUser !== "" && fDate !== "") {
    Post.find({
      user: fUser,
      time: new RegExp(day, "i")
    }).exec(function (e, data2) {
      if (e) return next(e);
      res.render("posts", {
        title: "Posts",
        logged_user: loggedUser,
        filter_msg: "Showing posts made by " + fUser + " on " + day + ".",
        post_list: data2
      });
    });
  } else if (fUser !== "" && fDate === "") {
    Post.find({ user: fUser }).exec(function (e, data2) {
      if (e) return next(e);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        filter_msg: "Showing posts made by " + fUser + ".",
        post_list: data2
      });
    });
  } else if (fUser === "" && fDate !== "") {
    Post.find({ time: new RegExp(day, "i") }).exec(function (e, data2) {
      if (e) return next(e);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        filter_msg: "Showing posts made on " + day + ".",
        post_list: data2
      });
    });
  } else {
    Post.find({}).exec(function (e, data2) {
      if (e) return next(e);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        filter_msg: "Showing all the posts.",
        post_list: data2
      });
    });
  }
});

module.exports = router;
