import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ArrowLeft,
  Heart,
  Tag,
  MapPin,
  Clock,
  Mail,
  Phone,
  User,
  Edit2,
  Trash2,
  CheckCircle,
  RotateCcw,
  Loader2,
  Share2,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_STYLES = {
  Books: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Electronics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Others: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const wishlisted = product ? isWishlisted(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch {
        toast.error('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleWishlist = async () => {
    try {
      await toggleWishlist(product._id);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const newStatus = product.status === 'available' ? 'sold' : 'available';
      const { data } = await api.put(`/products/${id}`, { status: newStatus });
      setProduct(data);
      toast.success(`Marked as ${newStatus}!`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Listing deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleEmailSeller = async () => {
    if (!seller?.email) {
      toast.error('Seller email is not available');
      return;
    }

    const subject = encodeURIComponent(`Interested in: ${product.title}`);
    const body = encodeURIComponent(
      `Hi ${seller?.name || 'Seller'},\n\nI am interested in your listing: ${product.title}.\n`
    );
    const mailtoUrl = `mailto:${seller.email}?subject=${subject}&body=${body}`;

    try {
      window.location.href = mailtoUrl;
      setTimeout(async () => {
        if (document.visibilityState === 'visible' && navigator.clipboard) {
          await navigator.clipboard.writeText(seller.email);
          toast.success('Email copied. Paste it if mail app did not open.');
        }
      }, 900);
    } catch {
      try {
        await navigator.clipboard.writeText(seller.email);
        toast.success('Email copied to clipboard');
      } catch {
        toast.error('Could not open email app');
      }
    }
  };

  const handleCallSeller = async () => {
    if (!seller?.phone) {
      toast.error('Seller phone is not available');
      return;
    }

    const telUrl = `tel:${String(seller.phone).replace(/\s+/g, '')}`;

    try {
      window.location.href = telUrl;
      setTimeout(async () => {
        if (document.visibilityState === 'visible' && navigator.clipboard) {
          await navigator.clipboard.writeText(String(seller.phone));
          toast.success('Phone copied. Call manually if dialer did not open.');
        }
      }, 900);
    } catch {
      try {
        await navigator.clipboard.writeText(String(seller.phone));
        toast.success('Phone number copied');
      } catch {
        toast.error('Could not open dialer');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) return null;

  const seller = product.sellerId;
  const isOwner = String(user._id) === String(seller._id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
            {product.image && !imgError ? (
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Tag size={48} className="text-gray-300 dark:text-gray-600" />
                <span className="text-sm text-gray-400 mt-2">No image</span>
              </div>
            )}

            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                <span className="bg-red-500 text-white font-extrabold text-xl px-6 py-2 rounded-full rotate-[-12deg] shadow-lg">
                  SOLD
                </span>
              </div>
            )}
          </div>

          {/* Category badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_STYLES[product.category] || CATEGORY_STYLES.Others}`}>
            {product.category}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title="Copy link"
              >
                <Share2 size={18} />
              </button>
              {!isOwner && (
                <button
                  onClick={handleWishlist}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={20}
                    className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                  />
                </button>
              )}
            </div>
          </div>

          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={13} />
              {product.college}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={13} />
              Listed {timeAgo(product.createdAt)}
            </div>
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${
            product.status === 'available'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`} />
            {product.status === 'available' ? 'Available' : 'Sold'}
          </div>

          {/* Seller card */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Seller
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {seller?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{seller?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{seller?.college}</p>
              </div>
            </div>

            {!isOwner && product.status === 'available' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleEmailSeller}
                  className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors justify-center"
                >
                  <Mail size={15} />
                  Email Seller
                </button>
                {seller?.phone && (
                  <button
                    type="button"
                    onClick={handleCallSeller}
                    className="flex items-center gap-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 justify-center"
                  >
                    <Phone size={15} />
                    {seller.phone}
                  </button>
                )}
                <Link
                  to={`/messages?sellerId=${seller._id}`}
                  className="flex items-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors justify-center"
                >
                  <MessageSquare size={15} />
                  Message Seller
                </Link>
              </div>
            )}

            {isOwner && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                <User size={12} />
                This is your listing
              </p>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Link
                  to={`/edit-product/${product._id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Edit2 size={14} />
                  Edit
                </Link>
                <button
                  onClick={handleToggleStatus}
                  disabled={actionLoading}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${
                    product.status === 'available'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200'
                  }`}
                >
                  {actionLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : product.status === 'available' ? (
                    <><CheckCircle size={14} /> Mark Sold</>
                  ) : (
                    <><RotateCcw size={14} /> Mark Available</>
                  )}
                </button>
              </div>

              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className={`flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors w-full ${
                  deleteConfirm
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'
                }`}
              >
                <Trash2 size={14} />
                {deleteConfirm ? 'Tap again to confirm delete' : 'Delete Listing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
