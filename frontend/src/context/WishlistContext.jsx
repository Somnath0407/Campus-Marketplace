import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/auth/me');
      // Store as string IDs for easy comparison
      const ids = (data.wishlist || []).map((item) =>
        typeof item === 'object' ? item._id : item
      );
      setWishlistIds(ids);
    } catch {
      // Silently fail — user stays logged in but wishlist is empty
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await api.post(`/products/${productId}/wishlist`);
      setWishlistIds(data.wishlist.map(String));
      return data.wishlist;
    } catch (error) {
      throw error;
    }
  };

  const isWishlisted = (productId) => wishlistIds.includes(String(productId));

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, toggleWishlist, isWishlisted, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
