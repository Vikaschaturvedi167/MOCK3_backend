const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        enum: ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Psychiatrist'],
        required: true
    },
    experience: {
        type: String, // You can change this to Number if the experience is measured in years
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    slots: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    }
});

const AppointmentModel = mongoose.model('appointments', appointmentSchema);

module.exports = AppointmentModel;
