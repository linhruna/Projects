import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Archive,
  Plus,
  ArrowRight,
  BookOpen,
  Disc,
  Film,
  Newspaper,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { productApi, invoiceApi } from '../services/api';
import { mapApiToProduct } from '../services/productMapper';
import { Product } from '../types';

// Color palette
const COLORS = {
  primary: '#7EA8D1',
  secondary: '#B09EF0',
  accent: '#C8B6FF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  book: '#6366F1',
  cd: '#EC4899',
  dvd: '#F97316',
  newspaper: '#14B8A6',
  revenue: '#8B5CF6',
};

const BAR_COLORS = [COLORS.book, COLORS.cd, COLORS.dvd, COLORS.newspaper];

// Helper function to format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

export const ProductManagerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [productData, orderData] = await Promise.all([
        productApi.getAll(),
        invoiceApi.getAll().catch(() => []),
      ]);
      const mapped = productData.map(mapApiToProduct);
      setProducts(mapped);
      setOrders(orderData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Calculate statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock < 10);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Calculate revenue from approved orders
  const approvedOrders = orders.filter((o) => o.status === 'APPROVED');
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_PROCESSING');

  // Category breakdown - use lowercase for comparison
  const categoryData = [
    { name: 'Sách', value: products.filter((p) => p.type.toLowerCase() === 'book').length, icon: BookOpen },
    { name: 'CD', value: products.filter((p) => p.type.toLowerCase() === 'cd').length, icon: Disc },
    { name: 'DVD', value: products.filter((p) => p.type.toLowerCase() === 'dvd').length, icon: Film },
    { name: 'Báo', value: products.filter((p) => p.type.toLowerCase() === 'newspaper').length, icon: Newspaper },
  ].filter(item => item.value > 0);

  // Top low stock products
  const topLowStock = [...products]
    .filter((p) => p.stock > 0 && p.stock < 20)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  // Calculate product value (price * stock)
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent mb-2">
              Dashboard Quản lý Sản phẩm
            </h1>
            <p className="text-muted-foreground">
              Tổng quan về sản phẩm, kho hàng và doanh thu
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <Link
              to="/product-management"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Quản lý SP
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 hover:shadow-soft-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                Tổng số
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalProducts}</p>
            <p className="text-sm text-muted-foreground">Sản phẩm</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 hover:shadow-soft-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                Kho
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalStock.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 hover:shadow-soft-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                Doanh thu
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(totalRevenue)}₫</p>
            <p className="text-sm text-muted-foreground">{approvedOrders.length} đơn hoàn thành</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 hover:shadow-soft-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                Cảnh báo
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{lowStockProducts.length}</p>
            <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 hover:shadow-soft-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                Hết hàng
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{outOfStockProducts.length}</p>
            <p className="text-sm text-muted-foreground">Cần nhập thêm</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution Bar Chart */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full" />
              Phân bố sản phẩm theo danh mục
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 14 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#F9FAFB' }}
                      formatter={(value: number) => [value, 'Số lượng']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[6, 6, 0, 0]}
                      barSize={50}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có dữ liệu sản phẩm</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Value Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
              Giá trị tồn kho
            </h3>
            <div className="h-64 flex flex-col justify-center">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-emerald-600">
                  {totalInventoryValue.toLocaleString('vi-VN')}₫
                </p>
                <p className="text-sm text-gray-500 mt-2">Tổng giá trị hàng tồn kho</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
                  <p className="text-xs text-blue-600/80">Loại sản phẩm</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{totalStock.toLocaleString()}</p>
                  <p className="text-xs text-green-600/80">Tổng số lượng</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
                  <p className="text-xs text-amber-600/80">Đơn chờ xử lý</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{approvedOrders.length}</p>
                  <p className="text-xs text-purple-600/80">Đơn hoàn thành</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
              Sản phẩm cần nhập thêm
            </h3>
            <Link
              to="/product-management"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {topLowStock.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Sản phẩm
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Loại
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Giá
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Tồn kho
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topLowStock.map((product) => {
                    const type = product.type.toLowerCase();
                    return (
                      <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-sm">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">
                            {type === 'book'
                              ? 'Sách'
                              : type === 'cd'
                                ? 'CD'
                                : type === 'dvd'
                                  ? 'DVD'
                                  : 'Báo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-medium text-sm">
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-sm">{product.stock}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${product.stock <= 5
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                              }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {product.stock <= 5 ? 'Cực thấp' : 'Thấp'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Tất cả sản phẩm đều có đủ hàng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
