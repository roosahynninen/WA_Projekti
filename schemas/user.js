//creating schema for users
const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 30 },
  password: { type: String, required: true, maxlength: 30 }
});

// exporting model
module.exports = mongoose.model("User", userSchema);
