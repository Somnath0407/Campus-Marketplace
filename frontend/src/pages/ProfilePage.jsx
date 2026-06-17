import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import {
  User,
  Heart,
  Package,
  Edit3,
  Phone,
  Mail,
  Building2,
  Save,
  X,
  Loader2,
  PackageOpen,
  CheckCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'listings', label: 'My Listings', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Edit Profile', icon: Edit3 },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { wishlistIds, fetchWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'listings';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [myProducts, setMyProducts] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab !== 'listings' ? { tab } : {});
  };

  // Fetch my listings
  useEffect(() => {
    if (activeTab !== 'listings') return;
    const fetchMine = async () => {
      setLoadingProducts(true);
      try {
        const { data } = await api.get('/products');
        setMyProducts(data.filter((p) => {
          const sid = p.sellerId?._id || p.sellerId;
          return String(sid) === String(user?._id);
        }));
      } catch {
        toast.error('Failed to load your listings');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchMine();
  }, [activeTab, user?._id]);

  // Fetch wishlist products
  useEffect(() => {
    if (activeTab !== 'wishlist') return;
    const fetchWishlisted = async () => {
      setLoadingWishlist(true);
      try {
        const { data } = await api.get('/auth/me');
        setWishlistProducts(data.wishlist || []);
      } catch {
        toast.error('Failed to load wishlist');
      } finally {
        setLoadingWishlist(false);
      }
    };
    fetchWishlisted();
  }, [activeTab, wishlistIds]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const availableCount = myProducts.filter((p) => p.status === 'available').length;
  const soldCount = myProducts.filter((p) => p.status === 'sold').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Mail size={12} />
                {user?.email}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Building2 size={12} />
                {user?.college}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Phone size={12} />
                  {user.phone}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex gap-4 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myProducts.length}</p>
              <p className="text-xs text-gray-400">Listed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">{soldCount}</p>
              <p className="text-xs text-gray-400">Sold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 mb-6 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
            {id === 'wishlist' && wishlistIds.length > 0 && (
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                activeTab === id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-500'
              }`}>
                {wishlistIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}

      {/* MY LISTINGS */}
      {activeTab === 'listings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Your Listings
              {myProducts.length > 0 && (
                <span className="ml-2 text-sm text-gray-400 font-normal">({myProducts.length})</span>
              )}
            </h2>
            <Link
              to="/add-product"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + New Listing
            </Link>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : myProducts.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                <PackageOpen size={28} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No listings yet</p>
              <p className="text-sm text-gray-400 mb-4">Start selling items to your college community</p>
              <Link
                to="/add-product"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                List Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Saved Items
            {wishlistProducts.length > 0 && (
              <span className="ml-2 text-sm text-gray-400 font-normal">({wishlistProducts.length})</span>
            )}
          </h2>

          {loadingWishlist ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                <Heart size={28} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No saved items</p>
              <p className="text-sm text-gray-400 mb-4">Tap the heart on any product to save it here</p>
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-lg">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Edit Profile</h2>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Cannot be changed</p>

                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Building2 size={15} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">College</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{user?.college}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
              >
                {savingProfile ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
