import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Sparkles, LogIn, LogOut, LayoutDashboard, Package, Users, ClipboardList } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { User as UserType } from '../types';

// Demo role options for switching
const demoRoles: { role: UserType['role']; label: string; description: string }[] = [
  { role: 'customer', label: 'Khách hàng', description: 'Xem và mua sản phẩm' },
  { role: 'productManager', label: 'Quản lý SP', description: 'Quản lý sản phẩm' },
  { role: 'admin', label: 'Admin', description: 'Quản lý hệ thống' },
];

export const Header: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { currentUser, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Automatically open login form if ?login=true query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true' && !currentUser) {
      setShowLoginForm(true);
    }
  }, [location.search, currentUser]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const user = await login(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (user) {
      setShowLoginForm(false);
      setLoginEmail('');
      setLoginPassword('');

      // Navigate based on role to avoid "Access Denied" if staying on current protected page
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'productManager') {
        navigate('/pm-dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-sm" style={{ zIndex: 99999 }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 gradient-blend rounded-2xl flex items-center justify-center shadow-soft transition-all group-hover:shadow-soft-lg group-hover:scale-105">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-semibold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                AIMS
              </span>
              <p className="text-xs text-muted-foreground -mt-1">Media Store</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Show Trang chủ for everyone including guests, but maybe different for admin? Assuming customers/guests see Home */}
            {(!currentUser || currentUser.role === 'customer') && (
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${isActive('/')
                  ? 'bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white shadow-soft'
                  : 'text-foreground hover:bg-muted'
                  }`}
              >
                Trang chủ
              </Link>
            )}

            {/* Cart - only for customers or guests (who might be customers) */}
            {(!currentUser || currentUser.role === 'customer') && (
              <Link
                to="/cart"
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isActive('/cart')
                  ? 'bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white shadow-soft'
                  : 'text-foreground hover:bg-muted'
                  }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Giỏ hàng</span>
                {cartItemCount > 0 && (
                  <span className="bg-destructive text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {currentUser?.role === 'productManager' && (
              <>
                <Link
                  to="/pm-dashboard"
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isActive('/pm-dashboard')
                    ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white shadow-soft'
                    : 'text-foreground hover:bg-muted'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/product-management"
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isActive('/product-management')
                    ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white shadow-soft'
                    : 'text-foreground hover:bg-muted'
                    }`}
                >
                  <Package className="w-4 h-4" />
                  Quản lý SP
                </Link>
                <Link
                  to="/order-management"
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isActive('/order-management')
                    ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white shadow-soft'
                    : 'text-foreground hover:bg-muted'
                    }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Đơn hàng
                </Link>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isActive('/admin-dashboard')
                    ? 'text-white shadow-soft'
                    : 'text-foreground hover:bg-muted'
                    }`}
                  style={isActive('/admin-dashboard') ? { background: 'linear-gradient(to right, #E11D48, #9333EA)' } : undefined}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/user-management"
                  className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${isActive('/user-management')
                    ? 'text-white shadow-soft'
                    : 'text-foreground hover:bg-muted'
                    }`}
                  style={isActive('/user-management') ? { background: 'linear-gradient(to right, #E11D48, #9333EA)' } : undefined}
                >
                  <Users className="w-4 h-4" />
                  Quản lý User
                </Link>
              </>
            )}
          </nav>

          {/* User Menu or Login Button */}
          <div className="hidden md:block relative">
            {currentUser ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#A7C7E7] to-[#C8B6FF] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-soft-lg border border-gray-100 py-2 overflow-hidden">
                    {/* Current User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/10 text-primary-dark rounded-lg capitalize">
                        {currentUser.role === 'productManager' ? 'Quản lý SP' : currentUser.role === 'admin' ? 'Admin' : 'Khách hàng'}
                      </span>
                    </div>

                    {/* Logout */}
                    <div className="pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm flex items-center gap-2 text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowLoginForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-all duration-200 shadow-soft"
                style={{ background: 'linear-gradient(to right, #7EA8D1, #B09EF0)' }}
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Đăng nhập</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-6 pt-2 space-y-1 border-t border-gray-100 mt-2">
            {(!currentUser || currentUser.role === 'customer') && (
              <Link
                to="/"
                className={`block px-4 py-3 rounded-xl transition-all ${isActive('/')
                  ? 'bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white'
                  : 'hover:bg-muted'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
            )}

            {(!currentUser || currentUser.role === 'customer') && (
              <Link
                to="/cart"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${isActive('/cart')
                  ? 'bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white'
                  : 'hover:bg-muted'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Giỏ hàng</span>
                {cartItemCount > 0 && (
                  <span className="bg-destructive text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {currentUser?.role === 'productManager' && (
              <>
                <Link
                  to="/pm-dashboard"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${isActive('/pm-dashboard')
                    ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white'
                    : 'hover:bg-muted'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  to="/product-management"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${isActive('/product-management')
                    ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white'
                    : 'hover:bg-muted'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  Quản lý sản phẩm
                </Link>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${isActive('/admin-dashboard')
                    ? 'text-white'
                    : 'hover:bg-muted'
                    }`}
                  style={isActive('/admin-dashboard') ? { background: 'linear-gradient(to right, #E11D48, #9333EA)' } : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  to="/user-management"
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${isActive('/user-management')
                    ? 'text-white'
                    : 'hover:bg-muted'
                    }`}
                  style={isActive('/user-management') ? { background: 'linear-gradient(to right, #E11D48, #9333EA)' } : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  Quản lý người dùng
                </Link>
              </>
            )}

            {/* Mobile Auth Actions */}
            <div className="pt-4 mt-4 border-t border-gray-100 px-4">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm flex items-center gap-2 text-destructive rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất ({currentUser.name})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLoginForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium shadow-soft"
                  style={{ background: 'linear-gradient(to right, #7EA8D1, #B09EF0)' }}
                >
                  <LogIn className="w-5 h-5" />
                  Đăng nhập
                </button>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Đăng nhập</h2>
              <button
                onClick={() => setShowLoginForm(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              💡 Sử dụng tài khoản đã tạo trong hệ thống backend
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
