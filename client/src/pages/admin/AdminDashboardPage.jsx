import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ShoppingBag,
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { getAdminStats } from '../../services/api';

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Proprietor Admin Welcome */}
      <div className="bg-[#245C2A] text-white rounded-xl p-6 sm:p-8 border border-[#1C4920] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F2C94C] text-xs font-bold border border-white/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Store Proprietor Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-marathi text-white">
            {t('admin.welcomeAdmin')}
          </h1>
          <p className="text-xs sm:text-sm text-[#EAF2E3]">
            Manage your store inventory, crop guides, educational articles, and customer enquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#F2C94C] hover:bg-[#e0b83b] text-[#263328] font-bold text-xs sm:text-sm shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4 text-[#245C2A]" />
            <span>{t('admin.addProduct')}</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
          >
            <MessageSquare className="w-4 h-4 text-[#F2C94C]" />
            <span>{t('admin.manageEnquiries')}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-[#5D685B]">
            <span className="text-[11px] font-bold uppercase">{t('admin.statProducts')}</span>
            <ShoppingBag className="w-4 h-4 text-[#245C2A]" />
          </div>
          <p className="text-2xl font-black text-[#263328]">{stats?.totalProducts ?? '—'}</p>
          <span className="text-[11px] text-[#438A35] font-semibold block">
            {stats?.publishedProducts ?? 0} Published
          </span>
        </div>

        {/* Crop Guides */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-[#5D685B]">
            <span className="text-[11px] font-bold uppercase">{t('admin.statCrops')}</span>
            <BookOpen className="w-4 h-4 text-[#245C2A]" />
          </div>
          <p className="text-2xl font-black text-[#263328]">{stats?.totalCrops ?? '—'}</p>
          <span className="text-[11px] text-[#438A35] font-semibold block">
            {stats?.publishedCrops ?? 0} Published
          </span>
        </div>

        {/* Knowledge Articles */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-[#5D685B]">
            <span className="text-[11px] font-bold uppercase">{t('admin.statArticles')}</span>
            <FileText className="w-4 h-4 text-[#80552F]" />
          </div>
          <p className="text-2xl font-black text-[#263328]">{stats?.totalArticles ?? '—'}</p>
          <span className="text-[11px] text-[#80552F] font-semibold block">
            {stats?.publishedArticles ?? 0} Published
          </span>
        </div>

        {/* Registered Farmers */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-[#5D685B]">
            <span className="text-[11px] font-bold uppercase">{t('admin.statFarmers')}</span>
            <Users className="w-4 h-4 text-[#438A35]" />
          </div>
          <p className="text-2xl font-black text-[#263328]">{stats?.totalFarmers ?? '—'}</p>
          <span className="text-[11px] text-[#438A35] font-semibold block">Farmer Accounts</span>
        </div>

        {/* Total Enquiries */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card space-y-1">
          <div className="flex items-center justify-between text-[#5D685B]">
            <span className="text-[11px] font-bold uppercase">{t('admin.statEnquiries')}</span>
            <MessageSquare className="w-4 h-4 text-[#80552F]" />
          </div>
          <p className="text-2xl font-black text-[#263328]">{stats?.totalEnquiries ?? '—'}</p>
          <span className="text-[11px] text-[#5D685B] font-semibold block">Web Inquiries</span>
        </div>

        {/* Pending Enquiries */}
        <div className="bg-white rounded-xl border border-[#F2C94C] p-4 shadow-card space-y-1 bg-[#FAF8F0]">
          <div className="flex items-center justify-between text-[#80552F]">
            <span className="text-[11px] font-bold uppercase">{t('admin.statPendingEnquiries')}</span>
            <Clock className="w-4 h-4 text-[#80552F]" />
          </div>
          <p className="text-2xl font-black text-[#80552F]">{stats?.pendingEnquiries ?? '—'}</p>
          <span className="text-[11px] text-[#80552F] font-bold block">Need Follow-up</span>
        </div>
      </div>

      {/* Main Admin Quick Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Manage Products Card */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4 hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#263328] font-marathi">
              {t('admin.manageProducts')}
            </h2>
            <p className="text-xs text-[#5D685B] leading-relaxed">
              Add new seeds, fertilizers, or insecticides. Update pack sizes, prices, and physical store stock availability.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between">
            <Link
              to="/admin/products"
              className="text-xs font-bold text-[#245C2A] hover:text-[#438A35]"
            >
              View Catalogue →
            </Link>
            <Link
              to="/admin/products/new"
              className="p-1 rounded bg-[#EAF2E3] text-[#245C2A] hover:bg-[#D7E1D1]"
              title="Add New Product"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Manage Crop Guides Card */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4 hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#263328] font-marathi">
              {t('admin.manageCrops')}
            </h2>
            <p className="text-xs text-[#5D685B] leading-relaxed">
              Maintain comprehensive 28-point cultivation guides, fertilizer NPK schedules, IPM pest control, and regional seasons.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between">
            <Link
              to="/admin/crops"
              className="text-xs font-bold text-[#245C2A] hover:text-[#438A35]"
            >
              View Guides →
            </Link>
            <Link
              to="/admin/crops/new"
              className="p-1 rounded bg-[#EAF2E3] text-[#245C2A] hover:bg-[#D7E1D1]"
              title="Add New Crop Guide"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Manage Educational Articles */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4 hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#263328] font-marathi">
              {t('admin.manageArticles')}
            </h2>
            <p className="text-xs text-[#5D685B] leading-relaxed">
              Publish seasonal agricultural advisories, fertilizer explanations, and sprayer safety precautions.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between">
            <Link
              to="/admin/articles"
              className="text-xs font-bold text-[#245C2A] hover:text-[#438A35]"
            >
              View Articles →
            </Link>
            <Link
              to="/admin/articles/new"
              className="p-1 rounded bg-[#EAF2E3] text-[#245C2A] hover:bg-[#D7E1D1]"
              title="Add New Article"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Review Customer Enquiries */}
        <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-6 space-y-4 hover:border-[#438A35] hover:shadow-card-hover transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#263328] font-marathi">
              {t('admin.manageEnquiries')}
            </h2>
            <p className="text-xs text-[#5D685B] leading-relaxed">
              Review messages and enquiries sent by farmers via the contact form. Call back or mark resolved.
            </p>
          </div>

          <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between">
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-[#80552F] hover:text-[#263328]"
            >
              Review Enquiries ({stats?.pendingEnquiries ?? 0} Pending) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
