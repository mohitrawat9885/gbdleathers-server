const mongoose = require("mongoose");
const slugify = require("slugify");

const WorkshopSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [
        true,
        "User details are missing. Please logout and then login again!",
      ],
    },
    name: {
      type: String,
      unique: [true, "Please give unique name to each workshop."],
      required: [true, "Please give any name to new workshop."],
    },
    summary: {
      type: String,
    },
    banner: {
      type: String,
    },
    images: {
      type: Array,
      default: [],
    },
    slug: {
      type: String,
      unique: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, "Workshop price is missing!"],
    },
    limit: {
      type: Number,
      required: [true, "Workshop Limit is missing!"],
    },
    days: {
      type: Array,
      min: 1,
    },
    start: {
      type: Date,
      required: [true, "Workshop must have a starting Date/Time."],
    },
    end: {
      type: Date,
      required: [true, "Workshop must have a ending Date/Time."],
    },
    location: {
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

WorkshopSchema.virtual("participants", {
  ref: "Participants",
  foreignField: "workshop",
  localField: "_id",
});

WorkshopSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Workshops = mongoose.model("Workshops", WorkshopSchema);

module.exports = Workshops;
