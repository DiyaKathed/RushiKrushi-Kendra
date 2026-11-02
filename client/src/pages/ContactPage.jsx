import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BookingForm from '../components/BookingForm';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  User
} from 'lucide-react';
import { submitEnquiry } from '../services/api';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError(currentLang === 'mr' ? 'कृपया सर्व आवश्यक माहिती भरा.' : 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitEnquiry(formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || t('contact.errorMsg'));
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappInquiry = `https://wa.me/919890360271?text=${encodeURIComponent(
    currentLang === 'mr'
      ? 'नमस्कार, मला ऋषी कृषी सेवा केंद्राशी संपर्क करायचा आहे.'
      : 'Namaskar, I would like to get in touch with Rushi Krushi Seva Kendra.'
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>{currentLang === 'mr' ? 'स्थानिक कृषी सेवा केंद्र' : 'Physical Store Contact'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#263328] font-marathi">
          {t('contact.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#5D685B] leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Verified Store Information & Direct Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#245C2A] font-marathi border-b border-[#D7E1D1] pb-3">
              {t('contact.storeInfoTitle')}
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#5D685B] text-xs block">
                    {currentLang === 'mr' ? 'संचालक' : 'Proprietor'}
                  </span>
                  <span className="font-bold text-[#263328] text-base font-marathi">
                    {t('common.proprietor')}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#5D685B] text-xs block">{t('contact.addressTitle')}</span>
                  <span className="text-[#263328] leading-relaxed">{t('common.address')}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#80552F] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#5D685B] text-xs block">{t('contact.hoursTitle')}</span>
                  <p className="font-bold text-[#263328]">
                    {currentLang === 'mr' ? 'रविवार ते शुक्रवार: सकाळी ९:०० ते संध्याकाळी ६:००' : 'Sunday to Friday: 9:00 AM – 6:00 PM'}
                  </p>
                  <p className="text-xs font-bold text-rose-700 mt-1">
                    {currentLang === 'mr' ? 'शनिवार: बंद (Saturday Closed)' : 'Saturday: Closed'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#5D685B] text-xs block">{t('contact.phoneTitle')}</span>
                  <a href="tel:+919890360271" className="font-bold text-[#245C2A] hover:underline text-base">
                    +91 9890360271
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#245C2A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#5D685B] text-xs block">{t('contact.emailTitle')}</span>
                  <a href="mailto:rushikrushi99@gmail.com" className="text-[#263328] hover:underline">
                    rushikrushi99@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-[#D7E1D1] space-y-3">
              <a
                href={whatsappInquiry}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-sm shadow-sm transition"
              >
                <MessageCircle className="w-5 h-5 text-[#F2C94C]" />
                <span>{t('common.whatsapp')}</span>
              </a>

              <a
                href="tel:+919890360271"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FAF8F0] hover:bg-[#EAF2E3] text-[#263328] font-bold text-sm border border-[#D7E1D1] transition"
              >
                <Phone className="w-4 h-4 text-[#245C2A]" />
                <span>{t('common.callUs')}</span>
              </a>
            </div>
          </div>

          {/* Google Maps Embed / Directions Box */}
          <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#245C2A] uppercase tracking-wider flex items-center justify-between">
              <span>{t('contact.mapTitle')}</span>
              <a
                href="https://maps.google.com/?q=Pargaon+Shingave+Ambegaon+Pune"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#245C2A] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{t('common.directions')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h3>
            <div className="rounded-xl overflow-hidden aspect-16/9 bg-[#FAF8F0] border border-[#D7E1D1]">
              <iframe
                title="Rushi Krushi Seva Kendra Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.338426027376!2d73.9850!3d18.9950!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU5JzQyLjAiTiA3M8KwNTknMDYuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#245C2A] font-marathi">
                {t('contact.formTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
                {t('contact.formSubtitle')}
              </p>
            </div>

            {success && (
              <div className="p-4 rounded-xl bg-[#EAF2E3] border border-[#D7E1D1] text-[#245C2A] text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#438A35] shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{t('contact.successMsg')}</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                    {t('contact.nameLabel')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="उदा. रमेश पाटील"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] text-sm text-[#263328] bg-[#FAF8F0]/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                    {t('contact.phoneLabel')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="१० अंकी मोबाईल नंबर"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] text-sm text-[#263328] bg-[#FAF8F0]/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                    {t('contact.emailLabel')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] text-sm text-[#263328] bg-[#FAF8F0]/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                    {t('contact.subjectLabel')} *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="उदा. खतांची उपलब्धता किंवा ऊस सल्ला"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] text-sm text-[#263328] bg-[#FAF8F0]/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263328] uppercase tracking-wide mb-1">
                  {t('contact.messageLabel')} *
                </label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder={
                    currentLang === 'mr'
                      ? 'आपल्या पिकाची अडचण, आवश्यक असणारी उत्पादने किंवा इतर प्रश्न येथे लिहा...'
                      : 'Write your crop issue, requested products, or questions here...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D7E1D1] text-sm text-[#263328] bg-[#FAF8F0]/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#F2C94C]" />
                <span>{submitting ? t('contact.sending') : t('contact.submitBtn')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BookingForm />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
