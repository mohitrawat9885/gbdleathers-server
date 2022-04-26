const mongoose = require("mongoose");
const validator = require("validator");

const ContactUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your full name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      unique: true,
    },
    number: {
      type: String,
      unique: true,
    },
    message: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ParticipantSchema.virtual("products", {
//   ref: "Products",
//   foreignField: "category",
//   localField: "_id",
// });

// ParticipantSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);

module.exports = ContactUs;
