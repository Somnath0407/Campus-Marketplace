import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Building2,
  MessageSquare,
  Heart,
  Moon,
  ShieldCheck,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  // Redirect authenticated users to the marketplace
  if (user) {
    return <Navigate to="/browse" replace />;
  }

  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      title: 'College-Scoped Listings',
      description: 'See items strictly from students in your own college. No more traveling far for a textbook.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-violet-500" />,
      title: 'Instant Messaging',
      description: 'Chat directly with buyers and sellers in real-time right inside the platform.',
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: 'Smart Wishlists',
      description: 'Save items you love for later and keep track of price drops easily.',
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-emerald-500" />,
      title: 'Rich Image Uploads',
      description: 'Upload beautiful, high-quality images of your items securely hosted in the cloud.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
      title: 'Secure Authentication',
      description: 'Your data is safe with our robust JWT-based authentication system.',
    },
    {
      icon: <Moon className="w-6 h-6 text-slate-500" />,
      title: 'Beautiful Dark Mode',
      description: 'Easy on the eyes. First-class dark mode support that respects your system preferences.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-200">
      {/* Unique Minimal Navbar */}
      <nav className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-gradient-to-br from-blue-600 to-violet-600 text-white p-2 rounded-xl shadow-md">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Market</span>
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
        {/* Background Decorative Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 dark:bg-violet-900/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            The Marketplace for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              Your Campus Life
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Buy and sell textbooks, electronics, and dorm essentials exclusively with students from your own college. Fast, local, and secure.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-3.5 rounded-full text-base font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Join Your Campus
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3.5 rounded-full text-base font-semibold transition-all shadow-sm"
            >
              Log in to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you need to trade</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Designed specifically for the student experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShoppingBag size={20} className="text-gray-400" />
          <span className="text-lg font-bold text-gray-400">CampusMarket</span>
        </div>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          © {new Date().getFullYear()} Campus Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
