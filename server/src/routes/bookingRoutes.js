
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/bookings
// Public: customer submits appointment
router.post('/', bookingLimiter, async (req, res) => {
    try {
        const { name, phone, date, timeSlot, purpose } = req.body;

        if (!name?.trim() || !phone?.trim() || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone, date and time slot are required',
            });
        }

        // Validate date format and prevent past dates
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment date',
            });
        }

        const selectedDate = new Date(`${date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Please select today or a future date',
            });
        }

        const booking = await Booking.create({
            name,
            phone,
            date,
            timeSlot,
            purpose: purpose || '',
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            booking,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'This time slot is already booked. Please choose another slot.',
            });
        }

        console.error('Booking submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing appointment',
        });
    }
});

// GET /api/bookings
// Admin only: get all appointments
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT /api/bookings/:id/status
// Admin only: update appointment status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking status',
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.json({ success: true, booking });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE /api/bookings/:id
// Admin only: delete appointment
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.json({
            success: true,
            message: 'Booking deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
