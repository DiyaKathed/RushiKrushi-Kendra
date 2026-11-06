
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDays,
    Phone,
    Clock,
    Trash2,
    MessageCircle
} from 'lucide-react';

import {
    getBookings,
    updateBookingStatus,
    deleteBooking
} from '../../services/api';

const AdminAppointmentsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await getBookings();
            if (res.data.success) {
                setBookings(res.data.bookings);
            }
        } catch (err) {
            console.error('Failed to load appointments:', err);
            alert(err.response?.data?.message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateBookingStatus(id, newStatus);
            setBookings(prev =>
                prev.map(b =>
                    b._id === id ? { ...b, status: newStatus } : b
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the appointment from ${name}?`)) {
            try {
                await deleteBooking(id);
                setBookings(prev => prev.filter(b => b._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete appointment');
            }
        }
    };

    const filteredBookings = filter === 'All'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const statusStyle = {
        pending: 'bg-[#FAF8F0] text-[#80552F] border-[#D7E1D1]',
        confirmed: 'bg-[#EAF2E3] text-[#245C2A] border-[#D7E1D1]',
        cancelled: 'bg-rose-50 text-rose-600 border-rose-200'
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link
                        to="/admin/dashboard"
                        className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold"
                    >
                        ← Dashboard
                    </Link>

                    <h1 className="text-2xl sm:text-3xl font-black text-[#263328] mt-2">
                        Manage Appointments
                    </h1>

                    <p className="text-xs sm:text-sm text-[#5D685B]">
                        View and manage customer appointment bookings
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    {['All', 'pending', 'confirmed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setFilter(s)}
                            className={`px-3.5 py-1.5 rounded-lg border transition ${filter === s
                                    ? 'bg-[#245C2A] text-white border-[#245C2A]'
                                    : 'bg-white text-[#5D685B] border-[#D7E1D1]'
                                }`}
                        >
                            {s === 'All'
                                ? 'All Appointments'
                                : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin" />
                    </div>
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => {
                        const phone = booking.phone.replace(/[^0-9]/g, '').slice(-10);
                        const whatsappLink = `https://wa.me/91${phone}?text=${encodeURIComponent(
                            `Namaskar ${booking.name}, regarding your appointment at Rushi Krushi Seva Kendra on ${booking.date} (${booking.timeSlot}).`
                        )}`;

                        return (
                            <div
                                key={booking._id}
                                className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="font-bold text-[#263328] text-lg">
                                                {booking.name}
                                            </h3>

                                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${statusStyle[booking.status] || statusStyle.pending}`}>
                                                {booking.status || 'pending'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5D685B]">
                                            <a
                                                href={`tel:${booking.phone}`}
                                                className="flex items-center gap-1 font-semibold text-[#245C2A]"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                                {booking.phone}
                                            </a>

                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {booking.date}
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {booking.timeSlot}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#245C2A] text-white text-xs font-bold"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            WhatsApp
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(booking._id, booking.name)}
                                            className="p-1.5 text-[#5D685B] hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                            title="Delete appointment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] text-sm">
                                    <strong className="text-[#263328]">Purpose:</strong>
                                    <p className="text-[#5D685B] mt-1">
                                        {booking.purpose || 'Not specified'}
                                    </p>
                                </div>

                                {/* Update Status */}
                                <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                                    <span className="text-[#5D685B] font-medium">
                                        Update Status:
                                    </span>

                                    <select
                                        value={booking.status || 'pending'}
                                        onChange={e => handleStatusChange(booking._id, e.target.value)}
                                        className="px-3 py-2 rounded-lg border border-[#D7E1D1] bg-white text-[#263328] font-semibold"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-xl border border-[#D7E1D1] p-12 text-center text-[#5D685B]">
                        <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No appointments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAppointmentsPage;
