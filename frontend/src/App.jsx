import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { MessagingProvider } from './context/MessagingContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddProductPage from './pages/AddProductPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <MessagingProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
              <Navbar />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-product"
                  element={
                    <ProtectedRoute>
                      <AddProductPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-product/:id"
                  element={
                    <ProtectedRoute>
                      <AddProductPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
              },
            }}
          />
          </MessagingProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
