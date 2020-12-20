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
mongoose
  .connect(DBUrl, { useNewUrlParser: true })
  .catch((err) => console.log(err));
mongoose.connection
  .once("open", function () {
    console.log("Connected");
  })
  .on("error", function (error) {
    console.log("An error ocurred", error);
  });

//rendering posts.pug view
router.get("/", function (req, res, next) {
  Post.find({}).exec(function (err, data1) {
    if (err) return next(err);
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
  var local_user = req.body.userlogin;
  var local_password = req.body.pwlogin;
  loggedUser = local_user;

  //checking database for matches
  User.find({}).exec(function (err, data1) {
    if (err) return next(err);
    Post.find({}).exec(function (err, data2) {
      if (err) return next(err);
      if (local_user && local_password !== "") {
        var foundUser = 0;
        for (var i = 0; i < data1.length; i++) {
          if (
            data1[i].username === local_user &&
            data1[i].password === local_password
          ) {
            foundUser++;
          }
        }
        //if user does not match, rendering the index.pug with error message, else rendering posts.pug view
        if (foundUser === 0) {
          res.render("index", {
            title: "What A day!",
            logMessage: "Incorrect username or password",
            post_list: data2
          });
        } else {
          res.redirect("/posts");
        }
        //if all fields not filled, index.pug view is rendered with error message
      } else {
        res.render("index", {
          title: "What A day!",
          logMessage: "Fill in log in details.",
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
  var local_user = req.body.usersignup;
  var local_password = req.body.pwsignup;

  if (local_user && local_password !== "") {
    User.find({}).exec(function (err, data1) {
      if (err) return next(err);
      Post.find({}).exec(function (err, data2) {
        if (err) return next(err);
        //checing whether username is unique
        var counter = 0;
        for (var i = 0; i < data1.length; i++) {
          if (data1[i].username === local_user) {
            counter++;
          }
        }
        //if username is taken, rendering the index.pug view with error message
        if (counter > 0) {
          res.render("index", {
            title: "What A day!",
            signMessage1: "Username already in use.",
            post_list: data2
          });
          //if free, rendering the index.pug view with message
        } else {
          var user = new User({
            username: local_user,
            password: local_password
          });
          user.save(function (err) {
            if (err) return next(err);
            Post.find({}).exec(function (err, data2) {
              if (err) return next(err);
              res.render("index", {
                title: "What A day!",
                signMessage2: "Sign up was successful",
                post_list: data2
              });
            });
          });
        }
      });
    });
    //If the user doesn't fill in all the fields,
    //the index.pug view is rendered again with an error message
  } else {
    Post.find({}).exec(function (err, data2) {
      if (err) return next(err);
      res.render("index", {
        title: "What A day!",
        signMessage1: "Fill in all the fields.",
        post_list: data2
      });
    });
  }
});

//Logging out and returning to the home page (rendering index.pug)
router.post("/logout", function (req, res, next) {
  res.redirect("/");
});

//Creating a new post
router.post("/create", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var local_content = req.body.content;

  if (local_content !== "") {
    //Getting the Finnish date and time for the creation time of the post
    var finnishTime = new Date().getTime() + 3 * 60 * 60 * 1000;
    var date = dateFormat(finnishTime, "HH:MM:ss dd.mm.yyyy");

    var post = new Post({
      user: loggedUser,
      content: local_content,
      time: date
    });
    //Saving the post for the current user at the current time
    //and rendering the posts.pug view again
    post.save(function (err) {
      if (err) return next(err);
      res.redirect("/posts");
    });
    //If the user doesn't fill in all the fields,
    //the posts.pug view is rendered again with an error message
  } else {
    Post.find({}).exec(function (err, data2) {
      if (err) return next(err);
      res.render("posts", {
        title: "Posts",
        logged_user: loggedUser,
        submitMessage: "Write something to post content.",
        post_list: data2
      });
    });
  }
});

//Filtering the posts.
//The user can filter posts by the username, by the date created,
//by both of them both or by no filter at all
router.post("/filter", sanitizeBody("*").trim().escape(), function (
  req,
  res,
  next
) {
  var local_filteruser = req.body.filtername;
  var local_filterdate = req.body.filterdate;
  var day = dateFormat(local_filterdate, "dd.mm.yyyy");

  //Check which filter fields are used and filter the posts accordingly
  //by rendering the posts.pug view again with the posts filtered and
  //a message telling what filters are being used
  if (local_filteruser !== "" && local_filterdate !== "") {
    Post.find({
      user: local_filteruser,
      time: new RegExp(day, "i")
    }).exec(function (err, data2) {
      if (err) return next(err);
      res.render("posts", {
        title: "Posts",
        logged_user: loggedUser,
        filterMessage:
          "Showing posts made by " + local_filteruser + " on " + day + ".",
        post_list: data2
      });
    });
  } else if (local_filteruser !== "" && local_filterdate === "") {
    Post.find({ user: local_filteruser }).exec(function (err, data2) {
      if (err) return next(err);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        filterMessage: "Showing posts made by " + local_filteruser + ".",
        post_list: data2
      });
    });
  } else if (local_filteruser === "" && local_filterdate !== "") {
    Post.find({ time: new RegExp(day, "i") }).exec(function (err, data2) {
      if (err) return next(err);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        filterMessage: "Showing posts made on " + day + ".",
        post_list: data2
      });
    });
  } else {
    Post.find({}).exec(function (err, data2) {
      if (err) return next(err);
      res.render("posts", {
        title: "What's going on?",
        logged_user: loggedUser,
        filterMessage: "Showing all the posts.",
        post_list: data2
      });
    });
  }
});

module.exports = router;
