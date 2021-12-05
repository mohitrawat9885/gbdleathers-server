const mongoose = require('mongoose');

const craftsSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    price:{
        type: Number,
        require: true
    },
    quantity:{
        type: Number,
        require: true,
    },
    image: {
        type: Array,
        require: true
    },
    sort_detail: {
        type: String,
        require: true
    },
    long_detail:{
        type: String,
        require: true
    },
    category: {
        type: String,
        require: false
    },
    created_at:{
        type: Date,
        default: Date.now
    },
});

const Crafts = mongoose.model('crafts', craftsSchema);
module.exports = Crafts;