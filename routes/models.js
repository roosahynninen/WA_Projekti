//Creating the schema for posts and users
const mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
  user: { type: String, required: true, maxlength: 30 },
  content: { type: String, required: true, maxlength: 400 },
  time: { type: String, required: true }
});

var userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 30 },
  password: { type: String, required: true, maxlength: 30 }
});

module.exports = mongoose.model("Post", postSchema);
module.exports = mongoose.model("User", userSchema);
