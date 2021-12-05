const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  role: {
    type: String,
  },
  first_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    require: false,
  },
  number: {
    type: Number,
    require: true,
  },
  email: {
    type: String,
    require: false,
  },
  password: {
    type: String,
    require: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Users = mongoose.model("users", usersSchema);
module.exports = Users;
