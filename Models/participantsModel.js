const mongoose = require('mongoose');
const participantSchema = new mongoose.Schema({
    workshop_id: {
        type: String,
        require: true
    },
    participant_id: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    number: {
        type: String,
        require: true
    },
    participant_time: {
        type: Object,
        require: true
    }
})
const participants = mongoose.model('participant', participantSchema);
module.exports = participants;