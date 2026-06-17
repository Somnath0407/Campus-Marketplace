import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingBag,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Moon,
  Sun,
  Heart,
  MessageSquare,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/browse" className="flex items-center gap-2 shrink-0">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
              <ShoppingBag size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Campus<span className="text-blue-600">Market</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/browse"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/browse')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/add-product"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/add-product')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sell
            </Link>
            <Link
              to="/messages"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/messages')
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Messages
            </Link>
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* College badge */}
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100 dark:border-blue-800">
              <BookOpen size={11} />
              <span className="max-w-[130px] truncate">{user?.college}</span>
            </div>

            {/* Wishlist */}
            <Link
              to="/profile?tab=wishlist"
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* List item CTA */}
            <Link
              to="/add-product"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} />
              List Item
            </Link>

            {/* Profile dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="p-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <User size={15} />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-blue-600 truncate max-w-[200px]">{user?.college}</p>
              </div>
            </div>
            <Link
              to="/browse"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Browse Products
            </Link>
            <Link
              to="/add-product"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Plus size={15} />
              List an Item
            </Link>
            <Link
              to="/messages"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <MessageSquare size={15} />
              Messages
            </Link>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <User size={15} />
              My Profile
            </Link>
            <Link
              to="/profile?tab=wishlist"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Heart size={15} />
              Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
            </Link>
            <button
              onClick={() => { setDark(!dark); setMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
