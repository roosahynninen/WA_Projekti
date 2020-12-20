var express = require("express");
var router = express.Router();
var Post = require("../models/post");

//rendering index.js (log in/sign up view)
router.get("/", function (req, res, next) {
  Post.find({}).exec(function (err, data) {
    if (err) return next(err);
    res.render("index", {
      title: "What A Day!",
      post_list: data
    });
  });
});

module.exports = router;
