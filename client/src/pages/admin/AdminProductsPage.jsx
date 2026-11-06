import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  Building2,
  Archive,
  RotateCcw
} from 'lucide-react';
import {
  adminGetProducts,
  adminDeleteProduct,
  adminArchiveProduct,
  adminRestoreProduct,
  extractProducts
} from '../../services/api';

const CATEGORIES_LIST = [
  'Seeds',
  'Fertilizers',
  'Micronutrients',
  'Biofertilizers',
  'Insecticides',
  'Fungicides',
  'Herbicides',
  'Plant Growth Promoters',
  'Organic Inputs',
  'Farming Tools',
  'Spray Pumps',
  'Irrigation Accessories',
  'Other'
];

const AdminProductsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [availableBrands, setAvailableBrands] = useState([]);

  // Generate company options dynamically from brands present in the catalogue
  const allCompanyOptions = useMemo(() => {
    const list = ['All'];
    const seen = new Set(['all']);

    if (Array.isArray(availableBrands)) {
      const sorted = [...availableBrands].filter(Boolean).sort((a, b) => a.localeCompare(b));
      sorted.forEach((b) => {
        if (typeof b === 'string') {
          const trimmed = b.trim();
          const key = trimmed.toLowerCase();
          if (trimmed && trimmed !== 'All' && !seen.has(key)) {
            seen.add(key);
            list.push(trimmed);
          }
        }
      });
    }

    return list;
  }, [availableBrands]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (brandFilter !== 'All') {
        params.brand = brandFilter;
        params.company = brandFilter;
      }
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await adminGetProducts(params);
      const items = extractProducts(res);
      setProducts(items);

      if (res?.data?.brands && Array.isArray(res.data.brands)) {
        setAvailableBrands(res.data.brands);
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
  }, [search, categoryFilter, brandFilter, statusFilter]);

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

  const handleArchive = async (id, name) => {
    if (window.confirm(`Archive "${name}"? It will be safely hidden from public pages but remain recoverable here.`)) {
      try {
        await adminArchiveProduct(id, 'Archived from admin products list');
        fetchProducts();
      } catch (err) {
        alert('Failed to archive product');
      }
    }
  };

  const handleRestore = async (id, name) => {
    if (window.confirm(`Restore "${name}" to active published catalogue on the public website?`)) {
      try {
        await adminRestoreProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to restore product');
      }
    }
  };

  // Helper for pack sizes
  const getPackSizes = (p) => {
    const rawPacks = p.packSizes || p.pack_sizes || p.packSize || p.pack_size;
    if (Array.isArray(rawPacks)) {
      return rawPacks.map(s => String(s).trim()).filter(Boolean);
    }
    if (typeof rawPacks === 'string' && rawPacks.trim()) {
      return rawPacks.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Helper for price
  const getFormattedPrice = (p) => {
    if (p.price !== null && p.price !== undefined && p.price !== '') {
      const numPrice = Number(p.price);
      if (!isNaN(numPrice) && numPrice > 0) {
        return `₹${numPrice.toLocaleString('en-IN')}`;
      }
    }
    const rawIndicative = p.indicativePrice || p.indicative_price;
    if (rawIndicative && typeof rawIndicative === 'string') {
      const trimmed = rawIndicative.trim();
      if (trimmed && trimmed !== '0' && trimmed !== '₹0' && trimmed !== '₹0.00' && !trimmed.toLowerCase().includes('₹0/')) {
        return trimmed;
      }
    }
    return null;
  };

  // Helper for stock quantity
  const getStockInfo = (p) => {
    const rawStock = p.stockQuantity !== undefined ? p.stockQuantity : p.stock_quantity;
    const hasMeaningful = rawStock !== undefined && rawStock !== null && rawStock !== '' && !isNaN(Number(rawStock));
    return {
      hasValue: hasMeaningful,
      quantity: hasMeaningful ? Number(rawStock) : null,
    };
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
            Physical store product catalogue management & inventory control
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
      <div className="bg-white rounded-xl border border-[#D7E1D1] p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#5D685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, technical..."
              className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A] focus:bg-white"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
            >
              <option value="All">All Companies / Brands</option>
              {allCompanyOptions.filter(b => b !== 'All').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
            >
              <option value="All">{t('products.allCategories')}</option>
              {CATEGORIES_LIST.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#D7E1D1] bg-[#FAF8F0]/50 text-sm text-[#263328] focus:outline-hidden focus:ring-2 focus:ring-[#245C2A]"
            >
              <option value="All">All Status</option>
              <option value="published">Published (Active)</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Quick Company Pill Filter */}
        <div className="pt-2 border-t border-[#D7E1D1]/60 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-[#5D685B] shrink-0 flex items-center gap-1 mr-1">
            <Building2 className="w-3.5 h-3.5 text-[#245C2A]" />
            <span>Company:</span>
          </span>
          {allCompanyOptions.map((brand) => {
            const isSelected = brandFilter.toLowerCase() === brand.toLowerCase();
            return (
              <button
                key={brand}
                type="button"
                onClick={() => setBrandFilter(brand)}
                className={`px-2.5 py-1 rounded-sm text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-[#245C2A] text-white border-[#1C4920] shadow-xs'
                    : 'bg-[#FAF8F0] text-[#263328] border-[#D7E1D1] hover:bg-[#EAF2E3]'
                }`}
              >
                {brand === 'All' ? 'All Companies' : brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#5D685B]">
        <span>
          Total Products: <strong className="text-[#263328] font-bold">{products.length}</strong>
        </span>
        {brandFilter !== 'All' && (
          <span className="inline-flex items-center gap-1 font-semibold text-[#245C2A] bg-[#EAF2E3] px-2 py-0.5 rounded border border-[#B8D5B0]">
            <Building2 className="w-3 h-3 text-[#438A35]" />
            <span>Filtered by: {brandFilter}</span>
          </span>
        )}
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
                  <th className="py-3.5 px-3">Company / Brand</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Pack Sizes</th>
                  <th className="py-3.5 px-3">Price</th>
                  <th className="py-3.5 px-3">Stock Qty</th>
                  <th className="py-3.5 px-3">Availability</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E1D1]/60">
                {products.map((p) => {
                  const packs = getPackSizes(p);
                  const priceDisplay = getFormattedPrice(p);
                  const stockInfo = getStockInfo(p);
                  const companyName = (p.brand || p.company || '').trim();

                  return (
                    <tr key={p._id} className="hover:bg-[#FAF8F0]/60 transition">
                      {/* Product Name */}
                      <td className="py-3 px-4 font-bold text-[#263328]">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-[#FAF8F0] border border-[#D7E1D1] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {p.imageUrl || (p.images && p.images[0]) ? (
                              <img
                                src={p.imageUrl || p.images[0]}
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
                          <div className="min-w-0 max-w-[200px]">
                            <div className="flex items-center gap-1.5">
                              {p.isFeatured && (
                                <Star className="w-3.5 h-3.5 text-[#F2C94C] fill-[#F2C94C] shrink-0" title="Featured" />
                              )}
                              <p className="font-marathi truncate">{p.nameMr || p.nameEn}</p>
                            </div>
                            <p className="text-xs text-[#5D685B] font-normal truncate">{p.nameEn}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company / Brand */}
                      <td className="py-3 px-3">
                        {companyName ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#245C2A] bg-[#EAF2E3] px-2 py-0.5 rounded border border-[#B8D5B0] whitespace-nowrap">
                            <Building2 className="w-3 h-3 text-[#438A35] shrink-0" />
                            <span>{companyName}</span>
                          </span>
                        ) : (
                          <span className="text-[#5D685B] text-xs">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FAF8F0] text-[#245C2A] border border-[#D7E1D1] whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>

                      {/* Pack Sizes */}
                      <td className="py-3 px-3 text-xs text-[#263328]">
                        {packs.length > 0 ? (
                          <span className="inline-block max-w-[130px] truncate" title={packs.join(', ')}>
                            {packs.join(', ')}
                          </span>
                        ) : (
                          <span className="text-[#5D685B]">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-xs whitespace-nowrap">
                        {priceDisplay ? (
                          <span className="font-bold text-[#245C2A]">{priceDisplay}</span>
                        ) : (
                          <span className="text-[#5D685B]">—</span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-3 text-xs whitespace-nowrap">
                        {stockInfo.hasValue ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm font-bold text-xs ${
                            stockInfo.quantity > 0
                              ? 'bg-[#EAF2E3] text-[#245C2A] border border-[#B8D5B0]'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {stockInfo.quantity} units
                          </span>
                        ) : (
                          <span className="text-[#5D685B] italic text-[11px]" title="Legacy / unquantified stock">—</span>
                        )}
                      </td>

                      {/* Availability */}
                      <td className="py-3 px-3 whitespace-nowrap">
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

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {p.status === 'archived' || p.isArchived ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <Archive className="w-3 h-3 text-amber-700" />
                            <span>Archived</span>
                          </span>
                        ) : p.status === 'published' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAF2E3] text-[#245C2A] border border-[#D7E1D1]">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FAF8F0] text-[#80552F] border border-[#D7E1D1]">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!(p.status === 'archived' || p.isArchived) && (
                            <Link
                              to={`/products/${p.slug || p._id}`}
                              className="p-1.5 rounded-lg text-[#5D685B] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                              title="View on Website"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="p-1.5 rounded-lg text-[#438A35] hover:text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#D7E1D1]"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {p.status === 'archived' || p.isArchived ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(p._id, p.nameEn || p.nameMr)}
                              className="p-1.5 rounded-lg text-[#245C2A] hover:bg-[#EAF2E3] border border-transparent hover:border-[#B8D5B0]"
                              title="Restore to Active Website Catalogue (सक्रिय करा)"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleArchive(p._id, p.nameEn || p.nameMr)}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200"
                              title="Archive Product (आर्काइव्ह करा)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id, p.nameEn || p.nameMr)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
