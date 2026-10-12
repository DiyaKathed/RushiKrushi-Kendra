import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  PlusCircle,
  Calendar,
  Layers,
  Edit,
  Trash2,
  BookOpen,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { getFarmerCrops, deleteFarmerCrop } from '../../services/api';

const MyCropsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await getFarmerCrops();
      if (res.data.success) {
        setCrops(res.data.crops);
      }
    } catch (err) {
      console.error('Failed to load farmer crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`${t('common.confirmDelete')} (${name})`)) {
      try {
        await deleteFarmerCrop(id);
        setCrops(crops.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete crop record');
      }
    }
  };

  const filteredCrops = statusFilter === 'All'
    ? crops
    : crops.filter(c => c.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#245C2A] font-marathi">
            {t('farmer.myCropsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B] mt-1">
            {t('farmer.myCropsSubtitle')}
          </p>
        </div>

        <Link
          to="/farmer/crops/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white font-bold text-sm shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-[#F2C94C]" />
          <span>{t('farmer.addCropBtn')}</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        {['All', 'Growing', 'Planning', 'Harvested'].map((status) => {
          const isSelected = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition border ${
                isSelected
                  ? 'bg-[#245C2A] text-white border-[#245C2A] shadow-xs'
                  : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
              }`}
            >
              {status === 'All' ? t('common.all') : t(`farmer.status${status}`)}
            </button>
          );
        })}
      </div>

      {/* Crops List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
        </div>
      ) : filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-[#D7E1D1] shadow-card p-5 space-y-4 hover:shadow-card-hover transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[#263328] text-lg font-marathi">
                      {c.cropName}
                    </h3>
                    {c.variety && (
                      <span className="text-xs text-[#5D685B] font-medium">वाण: {c.variety}</span>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    c.status === 'Growing'
                      ? 'bg-[#EAF2E3] text-[#245C2A] border-[#D7E1D1]'
                      : c.status === 'Harvested'
                      ? 'bg-stone-200 text-stone-800 border-stone-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] space-y-1.5 text-xs text-[#263328]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5D685B] font-medium">{t('farmer.growthStageLabel')}:</span>
                    <strong className="text-[#245C2A]">{c.growthStage || 'Vegetative'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5D685B] font-medium">{t('farmer.sowingDateLabel')}:</span>
                    <span>{new Date(c.sowingDate).toLocaleDateString()}</span>
                  </div>
                  {c.farmArea && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5D685B] font-medium">{t('farmer.areaLabel')}:</span>
                      <span>{c.farmArea}</span>
                    </div>
                  )}
                  {c.irrigationMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5D685B] font-medium">{t('farmer.irrigationLabel')}:</span>
                      <span>{c.irrigationMethod}</span>
                    </div>
                  )}
                </div>

                {c.visibleProblems && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">{t('farmer.visibleProblemsLabel')}:</strong>
                      <span>{c.visibleProblems}</span>
                    </div>
                  </div>
                )}

                {c.notes && (
                  <p className="text-xs text-[#5D685B] italic line-clamp-2">
                    "{c.notes}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#D7E1D1] flex items-center justify-between gap-2">
                <Link
                  to={`/farmer/crops/${c._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C2A] hover:text-[#438A35]"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{t('common.edit')}</span>
                </Link>

                {c.cropRef && (
                  <Link
                    to={`/farming-guide/crops/${c.cropRef.slug || c.cropRef._id}`}
                    className="inline-flex items-center gap-1 text-xs text-[#245C2A] font-semibold hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>मार्गदर्शक पाहा</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(c._id, c.cropName)}
                  className="text-stone-400 hover:text-rose-600 p-1"
                  title="Delete Crop Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D7E1D1] p-12 text-center space-y-4 max-w-sm mx-auto shadow-sm">
          <Sprout className="w-12 h-12 text-[#5D685B]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#263328]">No crop records found</h3>
          <p className="text-xs text-[#5D685B]">
            {t('farmer.noCropsMessage')}
          </p>
          <Link
            to="/farmer/crops/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#245C2A] hover:bg-[#438A35] text-white text-xs font-bold shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#F2C94C]" />
            <span>{t('farmer.addCropBtn')}</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCropsPage;
