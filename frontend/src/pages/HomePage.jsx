import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X, PackageOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Others'];

const HomePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  const availableProducts = products.filter((p) => p.status === 'available');
  const soldProducts = products.filter((p) => p.status === 'sold');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Browse Items
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Showing listings from <span className="font-medium text-blue-600">{user?.college}</span>
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
          <SlidersHorizontal size={14} className="text-gray-400 shrink-0" />
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
          <p className="text-gray-400 text-sm">Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
            <PackageOpen size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {debouncedSearch || category !== 'All' ? 'No results found' : 'No listings yet'}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs">
            {debouncedSearch
              ? `No items match "${debouncedSearch}"`
              : category !== 'All'
              ? `No ${category} listed yet`
              : 'Be the first to list something for your college!'}
          </p>
          {(debouncedSearch || category !== 'All') && (
            <button
              onClick={() => { clearSearch(); setCategory('All'); }}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            {availableProducts.length} available · {soldProducts.length} sold
          </p>

          {/* Available products */}
          {availableProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {availableProducts.map((product) => (
                <ProductCard key={product._id} product={product} onUpdate={fetchProducts} />
              ))}
            </div>
          )}

          {/* Sold products (dimmed section) */}
          {soldProducts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Recently Sold
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
                {soldProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onUpdate={fetchProducts} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
