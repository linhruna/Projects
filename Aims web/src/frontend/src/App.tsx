import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProductManagementPage } from './pages/ProductManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ProductManagerDashboard } from './pages/ProductManagerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrderManagementPage } from './pages/OrderManagementPage';
import { PublicOrderPage } from './pages/PublicOrderPage';
import { PublicOrderCancelPage } from './pages/PublicOrderCancelPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'productManager' | 'admin';
}> = ({ children, requiredRole }) => {
  const { currentUser, isLoading } = useAuth();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/?login=true" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-red-800 mb-4">Truy cập bị từ chối</h2>
          <p className="text-red-600 mb-6">
            Bạn không có quyền truy cập trang này. Chức năng này dành cho{' '}
            {requiredRole === 'admin' ? 'Quản trị viên' : 'Quản lý sản phẩm'}.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          {/* Public order routes for email links (no auth required) */}
          <Route path="/order/view/:token" element={<PublicOrderPage />} />
          <Route path="/order/public/:token/cancel" element={<PublicOrderCancelPage />} />
          <Route path="/order/public/:token" element={<PublicOrderPage />} />
          {/* Also support /order/:token for legacy email links */}
          <Route path="/order/:token/cancel" element={<PublicOrderCancelPage />} />
          <Route
            path="/pm-dashboard"
            element={
              <ProtectedRoute requiredRole="productManager">
                <ProductManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-management"
            element={
              <ProtectedRoute requiredRole="productManager">
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-management"
            element={
              <ProtectedRoute requiredRole="productManager">
                <OrderManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}