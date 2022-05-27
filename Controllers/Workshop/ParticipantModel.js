const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const ParticipantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    number: {
      type: String,
    },
    workshop: {
      type: mongoose.Schema.ObjectId,
      ref: "Workshops",
      required: [true, "Workshop is missing. Please provide one workshop!"],
    },
    payment: {
      type: String,
      required: [true, "Workshop should have payment status"],
      enum: {
        values: ["pending", "completed"],
        message: "Workshop payment should be either pending or completed!",
      },
    },
    paymentId: {
      type: String,
    },
    payerId: {
      type: String,
    },
    total_cost: {
      value: {
        type: mongoose.SchemaTypes.Decimal128,
      },
      currency: {
        type: String,
      },
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

ParticipantSchema.virtual("products", {
  ref: "Products",
  foreignField: "category",
  localField: "_id",
});

ParticipantSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ParticipantSchema.pre(/^find/, function (next) {
//   this.find({ payment: "completed" });
//   next();
// });

const Participants = mongoose.model("Participants", ParticipantSchema);

module.exports = Participants;
