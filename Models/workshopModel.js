const mongoose = require('mongoose');
const workshopSchema = new mongoose.Schema({
    admin_id: {
        type: String,
        require: true
    },
    banner: {
        type: Array,
        require: true
    },
    workshop_name:{
        type: String,
        require:true
    },
    workshop_time: {
        type: Object,
        require: true
    },
    registration_fee: {
        type: Number,
        require: true
    },
    workshop_detail: {
        type: String,
        require: true
    },
    workshop_limit:{
        type: Number,
        require: true
    },
    workshop_available: {
        type: Number,
        require: true
    },
    workshop_location:{
        type: String,
        require: true
    },
    published: {
        type: Boolean,
        require: true
    }
})

const workshops = mongoose.model('workshops', workshopSchema);
module.exports = workshops;