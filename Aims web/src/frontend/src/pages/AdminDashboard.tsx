import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  ArrowRight,
  RefreshCw,
  Database,
  Server,
  Globe,
  Lock,
  AlertCircle,
  BadgeCheck,
  XCircle,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { userApi, productApi, invoiceApi } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

interface Order {
  id: string;
  status: string;
  amount: number;
  createAt: string;
  deliveryInfo?: {
    receiveName: string;
    email: string;
  };
}

interface SystemStatus {
  name: string;
  status: 'online' | 'warning' | 'offline';
  uptime: string;
  icon: React.ElementType;
}

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [usersData, productsData, ordersData] = await Promise.all([
        userApi.getAll(),
        productApi.getAll(),
        invoiceApi.getAll().catch(() => []),
      ]);
      setUsers(usersData);
      setTotalProducts(productsData.length);
      setOrders(ordersData || []);
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

  // User statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active).length;
  const blockedUsers = users.filter((u) => !u.active).length;

  // Order statistics (only used for recent orders display)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime())
    .slice(0, 5);

  // System status
  const systemStatus: SystemStatus[] = [
    { name: 'Backend API', status: 'online', uptime: '99.9%', icon: Server },
    { name: 'Database', status: 'online', uptime: '99.8%', icon: Database },
    { name: 'Frontend', status: 'online', uptime: '100%', icon: Globe },
    { name: 'Auth Service', status: 'online', uptime: '99.9%', icon: Lock },
  ];

  // Get newest users sorted by createdAt
  const newestUsers = [...users]
    .sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  // Quick stats for admin
  const quickStats = [
    {
      label: 'Tổng người dùng',
      value: totalUsers,
      icon: Users,
      color: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      badge: 'Người dùng',
      badgeColor: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Đang hoạt động',
      value: activeUsers,
      icon: UserCheck,
      color: 'from-green-100 to-green-200',
      iconColor: 'text-green-600',
      badge: 'Active',
      badgeColor: 'bg-green-50 text-green-600',
    },
    {
      label: 'Bị khóa',
      value: blockedUsers,
      icon: UserX,
      color: 'from-red-100 to-red-200',
      iconColor: 'text-red-600',
      badge: 'Blocked',
      badgeColor: 'bg-red-50 text-red-600',
    },
    {
      label: 'Tổng sản phẩm',
      value: totalProducts,
      icon: Database,
      color: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600',
      badge: 'Sản phẩm',
      badgeColor: 'bg-purple-50 text-purple-600',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <BadgeCheck className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg">Hoàn thành</span>;
      case 'PENDING_PROCESSING':
        return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg">Chờ xử lý</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg">Từ chối</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">Đã hủy</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg">{status}</span>;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-purple-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Quản lý hệ thống và người dùng
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
              to="/user-management"
              style={{ backgroundColor: '#DC2626', color: 'white' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-soft text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              Quản lý Người dùng
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 hover:shadow-soft-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className={`text-xs font-medium ${stat.badgeColor} px-2 py-1 rounded-lg`}>
                  {stat.badge}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* System Status & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full" />
              Trạng thái hệ thống
            </h3>
            <div className="space-y-4">
              {systemStatus.map((system, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <system.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{system.name}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {system.uptime}</p>
                    </div>
                  </div>
                  {getStatusIcon(system.status)}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders (Real Data) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
                Đơn hàng gần đây
              </h3>
              <Link
                to="/order-management"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Đơn #{order.id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.deliveryInfo?.receiveName || 'Khách hàng'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">
                        {(order.amount || 0).toLocaleString('vi-VN')}₫
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>

        {/* User List Preview - Real Data */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full" />
              Người dùng mới nhất
            </h3>
            <Link
              to="/user-management"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Quản lý tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {newestUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Người dùng
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Vai trò
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Ngày tạo
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {newestUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium ${user.role === 'ADMIN'
                              ? 'bg-gradient-to-br from-red-400 to-red-600'
                              : user.role === 'MANAGER_PRODUCT'
                                ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                                : 'bg-gradient-to-br from-cyan-400 to-cyan-600'
                              }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : user.role === 'MANAGER_PRODUCT'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-cyan-100 text-cyan-700'
                            }`}
                        >
                          <Shield className="w-3 h-3" />
                          {user.role === 'ADMIN'
                            ? 'Admin'
                            : user.role === 'MANAGER_PRODUCT'
                              ? 'Quản lý SP'
                              : 'Khách hàng'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(user.createdAt || '')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${user.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {user.active ? (
                            <>
                              <BadgeCheck className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Blocked
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có người dùng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
