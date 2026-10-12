import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';
import { getEnquiries, updateEnquiryStatus, deleteEnquiry } from '../../services/api';

const AdminEnquiriesPage = () => {
  const { t } = useTranslation();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await getEnquiries();
      if (res.data.success) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateEnquiryStatus(id, newStatus);
      setEnquiries(enquiries.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete enquiry from ${name}?`)) {
      try {
        await deleteEnquiry(id);
        setEnquiries(enquiries.filter(e => e._id !== id));
      } catch (err) {
        alert('Failed to delete enquiry');
      }
    }
  };

  const filteredEnquiries = filter === 'All'
    ? enquiries
    : enquiries.filter(e => e.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/dashboard" className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263328] font-marathi">
            {t('admin.manageEnquiries')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            Customer inquiries and advisory requests submitted from the website
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {['All', 'pending', 'resolved'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg border transition ${
                filter === s
                  ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                  : 'bg-white text-[#5D685B] border-[#D7E1D1] hover:bg-[#FAF8F0]'
              }`}
            >
              {s === 'All' ? 'All Inquiries' : s === 'pending' ? 'Pending (प्रलंबित)' : 'Resolved (पूर्ण)'}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
          </div>
        ) : filteredEnquiries.length > 0 ? (
          filteredEnquiries.map((enq) => {
            const replyWhatsApp = `https://wa.me/91${enq.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
              `Namaskar ${enq.name}, replying to your enquiry regarding '${enq.subject}' at Rushi Krushi Seva Kendra.`
            )}`;

            return (
              <div
                key={enq._id}
                className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4 hover:border-[#438A35] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-[#263328] text-lg">
                        {enq.name}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        enq.status === 'resolved'
                          ? 'bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]'
                          : 'bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1]'
                      }`}>
                        {enq.status === 'resolved' ? 'Resolved' : 'Pending Action'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5D685B]">
                      <a href={`tel:${enq.phone}`} className="flex items-center gap-1 font-semibold text-[#245C2A] hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{enq.phone}</span>
                      </a>
                      {enq.email && (
                        <a href={`mailto:${enq.email}`} className="flex items-center gap-1 text-[#5D685B] hover:underline">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{enq.email}</span>
                        </a>
                      )}
                      <span className="text-[#5D685B]/70">
                        {new Date(enq.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={replyWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#245C2A] hover:bg-[#1C4920] text-white text-xs font-bold shadow-xs transition"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${enq.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F0] hover:bg-[#EAF2E3] text-[#263328] text-xs font-bold border border-[#D7E1D1] transition"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#245C2A]" />
                      <span>Call</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(enq._id, enq.name)}
                      className="p-1.5 text-[#5D685B] hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] text-xs sm:text-sm space-y-1">
                  <strong className="text-[#263328] block font-bold">Subject: {enq.subject}</strong>
                  <p className="text-[#263328] leading-relaxed whitespace-pre-wrap">{enq.message}</p>
                </div>

                {/* Status Toggle Action */}
                <div className="flex items-center justify-end gap-2 text-xs pt-1">
                  <span className="text-[#5D685B] font-medium">Update Status:</span>
                  {enq.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(enq._id, 'resolved')}
                      className="px-3 py-1 rounded-lg bg-[#EAF2E3] hover:bg-[#D7E1D1] text-[#245C2A] border border-[#D7E1D1] font-bold transition"
                    >
                      Mark as Resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(enq._id, 'pending')}
                      className="px-3 py-1 rounded-lg bg-[#FAF8F0] hover:bg-[#D7E1D1] text-[#80552F] border border-[#D7E1D1] font-bold transition"
                    >
                      Re-open as Pending
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-[#D7E1D1] p-12 text-center text-[#5D685B] space-y-2">
            <MessageSquare className="w-10 h-10 text-[#5D685B]/40 mx-auto" />
            <p className="font-medium">No enquiries found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnquiriesPage;
