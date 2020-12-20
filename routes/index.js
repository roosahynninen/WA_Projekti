var express = require("express");
var router = express.Router();
var Post = require("../schemas/post");

//rendering index.js (log in/sign up view)
router.get("/", function (req, res, next) {
  Post.find({}).exec(function (e, data) {
    if (e) return next(e);
    res.render("index", {
      title: "What A Day!",
      post_list: data
    });
  });
});

module.exports = router;
