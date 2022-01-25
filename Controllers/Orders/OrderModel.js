const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  //   product: {
  //     type: mongoose.Schema.ObjectId,
  //     ref: 'Tour',
  //     required: [true, 'Booking must belong to a Tour!'],
  //   },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Booking must belong to a User!'],
  },
  address: {
    type: Object,
    required: [true, 'Order must have Address.'],
  },
  date: {
    type: date,
    default: Date.now(),
  },
  status: {
    type: String,
    required: [true, 'Order should have some status'],
    enum: {
      values: ['ordered', 'pending', 'canceled', 'completed'],
    },
  },
  pay: {
    type: String,
    required: [true, 'Order should have payment'],
    enum: {
      values: ['cod', 'online'],
      message: 'Order should be either cod or online',
    },
  },
  qty: {
    type: Number,
    required: [true, 'Order must have quantity'],
  },
  cost: {
    value: {
      type: mongoose.SchemaTypes.Decimal128,
    },
    currency: {
      type: String,
    },
  },
});

// OrderSchema.pre(/^find/, function (next) {
//   this.populate('user').populate({
//     path: 'tour',
//     select: 'name',
//   });
//   next();
// });

const Orders = mongoose.model('Orders', OrderSchema);

module.exports = Orders;
