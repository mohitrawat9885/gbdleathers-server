const mongoose = require("mongoose");
const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  number: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
  contacted_at: {
    type: Object,
    require: true,
  },
});

const contactus = mongoose.model("contactus", contactUsSchema);
module.exports = contactus;
