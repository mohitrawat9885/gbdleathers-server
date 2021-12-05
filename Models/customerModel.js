const mongoose = require('mongoose');
const customersSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    number:{
        type: Number,
        require: true
    },
    email:{
        type: String,
        require: false
    },
    password: {
        type: String,
        require: true
    },
    address:{
        type: Object,
        require: false
    },
    new_orders: {
        type: Array
    },
    done_orders : {
        type: Array
    },
    canceled_orders : {
        type: Array
    },
    created_at : {
        type: Date,
        default: Date.now
    },
});
const customers = mongoose.model('customers', customersSchema);
module.exports = customers;