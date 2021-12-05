const mongoose = require('mongoose');
const customProductSchema = new mongoose.Schema({
    custom_product_images:{
        type: Array,
        require: true
    },
    custom_product_name: {
        type: String,
        require: true
    },
    custom_product_description: {
        type: String,
        require: true
    },
    customer_full_name: {
        type: String,
        require: true
    },
    customer_number:{
        type: Number,
        require: true
    },
    requested_at:{
        type: Object,
        require: true
    }
})

const customProducts = mongoose.model('custom_products', customProductSchema);
module.exports = customProducts;