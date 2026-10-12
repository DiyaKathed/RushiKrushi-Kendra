import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Star,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { adminGetProducts, adminDeleteProduct } from '../../services/api';

const AdminProductsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await adminGetProducts(params);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`${t('admin.deleteConfirmProduct')} (${name})`)) {
      try {
        await adminDeleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

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
            {t('admin.manageProducts')}
          </h1>
          <p className="text-xs sm:text-sm text-[#5D685B]">
            Physical store product catalogue management
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#245C2A] hover:bg-[#1C4920] text-white font-bold text-sm shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-[#F2C94C]" />
          <span>{t('admin.addProduct')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-[#5D685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand..."
            className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
          >
            <option value="All">{t('products.allCategories')}</option>
            {[
              'Seeds', 'Fertilizers', 'Micronutrients', 'Biofertilizers',
              'Insecticides', 'Fungicides', 'Herbicides', 'Plant Growth Promoters',
              'Organic Inputs', 'Farming Tools', 'Spray Pumps', 'Irrigation Accessories'
            ].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
          >
            <option value="All">All Status (Draft & Published)</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-[#D7E1D1] shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#D7E1D1] border-t-[#245C2A] rounded-full animate-spin"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F0] border-b border-[#D7E1D1] text-[#5D685B] uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Product Name (नाव)</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E1D1]/60">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FAF8F0]/60 transition">
                    <td className="py-3 px-4 font-bold text-[#263328]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.nameEn || p.nameMr}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder-agro.svg';
                              }}
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-[#5D685B]/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {p.isFeatured && (
                              <Star className="w-3.5 h-3.5 text-[#F2C94C] fill-[#F2C94C] shrink-0" title="Featured" />
                            )}
                            <p className="font-marathi truncate">{p.nameMr}</p>
                          </div>
                          <p className="text-xs text-[#5D685B] font-normal truncate">{p.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#263328] font-medium">{p.brand}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.availability === 'in_stock' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#245C2A] bg-[#EAF2E3] border border-[#D7E1D1] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[#245C2A]" />
                          <span>In Stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#80552F] bg-[#FAF8F0] border border-[#D7E1D1] px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-[#80552F]" />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.status === 'published'
                          ? 'bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]'
                          : 'bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1]'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/products/${p.slug || p._id}`}
                          className="p-1.5 rounded-lg text-[#5D685B] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                          title="View on Website"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="p-1.5 rounded-lg text-[#438A35] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.nameEn)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                          title="Delete Product"
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
          <div className="p-12 text-center text-[#5D685B] space-y-2">
            <p>No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
