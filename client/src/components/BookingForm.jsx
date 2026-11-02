import { submitBooking } from '../services/api';
import React, { useState } from 'react';

const BookingForm = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [purpose, setPurpose] = useState('');

    const timeSlots = [
        "10:00 AM - 10:30 AM",
        "10:30 AM - 11:00 AM",
        "11:00 AM - 11:30 AM",
        "11:30 AM - 12:00 PM",
        "02:00 PM - 02:30 PM",
        "02:30 PM - 03:00 PM",
        "03:00 PM - 03:30 PM",
        "03:30 PM - 04:00 PM"
    ];


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedSlot || !name.trim() || !phone.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        const bookingData = {
            name,
            phone,
            date: selectedDate,
            timeSlot: selectedSlot,
            purpose,
        };

        try {
            const res = await submitBooking(bookingData);

            if (res.data.success) {
                alert('Appointment booked successfully!');

                setName('');
                setPhone('');
                setSelectedDate('');
                setSelectedSlot('');
                setPurpose('');
            }
        } catch (error) {
            console.error('Booking failed:', error);

            alert(
                error.response?.data?.message ||
                'Unable to submit appointment. Please try again.'
            );
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
                Book an Appointment
            </h2>

            <p className="text-gray-600 mb-6">
                Select your preferred date and time to visit us.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name */}
                <div>
                    <label className="block font-medium mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full border rounded-lg p-3"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block font-medium mb-2">
                        Mobile Number *
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your mobile number"
                        className="w-full border rounded-lg p-3"
                        required
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block font-medium mb-2">
                        Select Appointment Date *
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedSlot('');
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border rounded-lg p-3"
                        required
                    />
                </div>

                {/* Time slots */}
                <div>
                    <label className="block font-medium mb-3">
                        Select Time Slot *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {timeSlots.map((slot, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`border rounded-lg p-3 transition ${selectedSlot === slot
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-700 hover:bg-green-50'
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>

                    {!selectedSlot && (
                        <p className="text-sm text-gray-500 mt-2">
                            Please select your preferred time slot.
                        </p>
                    )}
                </div>

                {/* Purpose */}
                <div>
                    <label className="block font-medium mb-2">
                        Purpose of Visit
                    </label>
                    <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="What would you like to discuss?"
                        className="w-full border rounded-lg p-3"
                        rows="3"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                >
                    Book Appointment
                </button>

            </form>
        </div>
    );
};

export default BookingForm;
