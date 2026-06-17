import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, Tag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_STYLES = {
  Books: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Electronics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Others: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const ProductCard = ({ product, onUpdate }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const wishlisted = isWishlisted(product._id);
  const isOwner = product.sellerId?._id === user?._id || product.sellerId === user?._id;
  const [imgError, setImgError] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(product._id);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 h-48">
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 dark:from-gray-700 dark:to-gray-600">
              <Tag size={36} className="text-gray-300 dark:text-gray-500" />
              <span className="text-xs text-gray-400 mt-1">No image</span>
            </div>
          )}

          {/* Sold overlay */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white font-extrabold px-4 py-1.5 rounded-full text-sm rotate-[-12deg] shadow-lg">
                SOLD
              </span>
            </div>
          )}

          {/* Category badge */}
          <div
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
              CATEGORY_STYLES[product.category] || CATEGORY_STYLES.Others
            }`}
          >
            {product.category}
          </div>

          {/* Wishlist button (only if not owner) */}
          {!isOwner && (
            <button
              onClick={handleWishlist}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm hover:scale-110 transition-transform backdrop-blur-sm"
            >
              <Heart
                size={15}
                className={
                  wishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-500 dark:text-gray-400'
                }
              />
            </button>
          )}
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
            {product.title}
          </h3>

          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
              <MapPin size={11} />
              <span className="truncate max-w-[110px]">{product.college}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
              <Clock size={11} />
              <span>{timeAgo(product.createdAt)}</span>
            </div>
          </div>

          {/* Seller avatar */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {product.sellerId?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {product.sellerId?.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
