import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, PlusCircle, Search, Edit, Trash2, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { adminGetCrops, adminDeleteCrop, extractCrops } from '../../services/api';

const AdminCropsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await adminGetCrops();
      setCrops(extractCrops(res));
    } catch (err) {
      console.error('Failed to load admin crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete crop guide for ${name}?`)) {
      try {
        await adminDeleteCrop(id);
        setCrops(crops.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete crop guide');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/dashboard" className="text-xs text-[#5D685B] hover:text-[#245C2A] font-semibold">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263328] font-marathi">
            {t('admin.manageCrops')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            Maintain crop cultivation guides, seasonal calendars, and IPM protocols
          </p>
        </div>

        <Link
          to="/admin/crops/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#245C2A] hover:bg-[#1C4920] text-white font-bold text-sm shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-[#F2C94C]" />
          <span>{t('admin.addCrop')}</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
          </div>
        ) : crops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F0] border-b border-[#D7E1D1] text-[#5D685B] uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Crop Guide (पीक नाव)</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Seasons</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E1D1]/60">
                {crops.map((c) => (
                  <tr key={c._id} className="hover:bg-[#FAF8F0]/60 transition">
                    <td className="py-3 px-4 font-bold text-[#263328]">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] overflow-hidden shrink-0 flex items-center justify-center">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.nameEn || c.nameMr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-agro.svg';
                              }}
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-[#5D685B]/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-marathi truncate">{c.nameMr}</p>
                          <p className="text-xs text-[#5D685B] font-normal truncate">{c.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5D685B]">
                      {c.seasons ? c.seasons.join(', ') : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        c.status === 'published'
                          ? 'bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]'
                          : 'bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1]'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/farming-guide/crops/${c.slug || c._id}`}
                          className="p-1.5 rounded-lg text-[#5D685B] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                          title="View on Website"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/crops/${c._id}/edit`}
                          className="p-1.5 rounded-lg text-[#438A35] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                          title="Edit Crop Guide"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(c._id, c.nameEn)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                          title="Delete Crop Guide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#5D685B]">
            No crop guides found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCropsPage;
