import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, PlusCircle, Search, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { adminGetArticles, adminDeleteArticle } from '../../services/api';

const AdminArticlesPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await adminGetArticles();
      if (res.data.success) {
        setArticles(res.data.articles);
      }
    } catch (err) {
      console.error('Failed to load admin articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete article: ${title}?`)) {
      try {
        await adminDeleteArticle(id);
        setArticles(articles.filter(a => a._id !== id));
      } catch (err) {
        alert('Failed to delete article');
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
            {t('admin.manageArticles')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            Publish educational articles and fertilizer management advisories
          </p>
        </div>

        <Link
          to="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#245C2A] hover:bg-[#1C4920] text-white font-bold text-sm shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-[#F2C94C]" />
          <span>{t('admin.addArticle')}</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
          </div>
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F0] border-b border-[#D7E1D1] text-[#5D685B] uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Article (लेख शीर्षक)</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E1D1]/60">
                {articles.map((a) => (
                  <tr key={a._id} className="hover:bg-[#FAF8F0]/60 transition">
                    <td className="py-3 px-4 font-bold text-[#263328]">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] overflow-hidden shrink-0 flex items-center justify-center">
                          {a.imageUrl ? (
                            <img
                              src={a.imageUrl}
                              alt={a.titleEn || a.titleMr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-agro.svg';
                              }}
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-[#5D685B]/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-marathi truncate">{a.titleMr}</p>
                          <p className="text-xs text-[#5D685B] font-normal truncate">{a.titleEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]">
                        {a.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        a.status === 'published'
                          ? 'bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]'
                          : 'bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1]'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/farming-guide/articles/${a.slug || a._id}`}
                          className="p-1.5 rounded-lg text-[#5D685B] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                          title="View on Website"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/articles/${a._id}/edit`}
                          className="p-1.5 rounded-lg text-[#438A35] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                          title="Edit Article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(a._id, a.titleEn)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                          title="Delete Article"
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
            No educational articles found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticlesPage;
