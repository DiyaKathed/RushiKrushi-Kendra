
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Please provide your phone number'],
            trim: true,
        },
        date: {
            type: String,
            required: [true, 'Please select an appointment date'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Please select a time slot'],
        },
        purpose: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Allow only one appointment per date/time slot
bookingSchema.index(
    { date: 1, timeSlot: 1 },
    { unique: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
