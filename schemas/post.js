//creating schema for posts
const mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
  user: { type: String, required: true, maxlength: 30 },
  content: { type: String, required: true, maxlength: 400 },
  time: { type: String, required: true }
});

// exporting model
module.exports = mongoose.model("Post", postSchema);
