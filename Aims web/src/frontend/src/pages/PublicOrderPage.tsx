import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  User,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  BadgeCheck,
  XCircle,
  AlertTriangle,
  Loader2,
  Home,
  Receipt,
  Mail
} from 'lucide-react';
import { invoiceApi, InvoiceResponse } from '../services/api';
import { toast } from 'sonner';

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    'PENDING': { label: 'Đang tạo', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <Clock className="w-4 h-4" /> },
    'CONFIRMED': { label: 'Đã xác nhận', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <BadgeCheck className="w-4 h-4" /> },
    'PENDING_PROCESSING': { label: 'Chờ xử lý', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <Clock className="w-4 h-4" /> },
    'APPROVED': { label: 'Đã duyệt', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: <BadgeCheck className="w-4 h-4" /> },
    'REJECTED': { label: 'Bị từ chối', color: 'text-red-600', bgColor: 'bg-red-100', icon: <XCircle className="w-4 h-4" /> },
    'CANCELLED': { label: 'Đã hủy', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: <XCircle className="w-4 h-4" /> },
  };

  const config = statusConfig[status] || statusConfig['PENDING'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export const PublicOrderPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError('Invalid order link');
        setLoading(false);
        return;
      }

      try {
        const orderData = await invoiceApi.getByAccessToken(token);
        setOrder(orderData);
      } catch (err) {
        setError('Không tìm thấy đơn hàng hoặc link đã hết hạn');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handleCancelOrder = async () => {
    if (!token) return;

    try {
      setCancelling(true);
      const updatedOrder = await invoiceApi.cancelByAccessToken(token, cancelReason || undefined);
      setOrder(updatedOrder);
      setShowCancelModal(false);
      toast.success('Đơn hàng đã được hủy thành công');
    } catch (err: any) {
      toast.error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">Không tìm thấy đơn hàng</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING_PROCESSING';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Receipt className="w-7 h-7 text-primary" />
                Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
              </h1>
              <p className="text-muted-foreground mt-1">
                Ngày đặt: {formatDate(order.createAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Order Content */}
        <div className="space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Sản phẩm
            </h2>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-primary-dark self-center">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Không có sản phẩm</p>
            )}

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold">Tổng thanh toán</span>
              <span className="text-xl font-bold text-primary-dark">{formatCurrency(order.amount)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          {order.deliveryInfo && (
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Thông tin giao hàng
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Người nhận</p>
                    <p className="font-medium">{order.deliveryInfo.receiveName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{order.deliveryInfo.phoneNumber}</p>
                  </div>
                </div>
                {order.deliveryInfo.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{order.deliveryInfo.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">{order.deliveryInfo.detailAddress}, {order.deliveryInfo.city}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          {order.transactionId && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-emerald-700">
                <CreditCard className="w-5 h-5" />
                Thông tin giao dịch
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Mã giao dịch</p>
                  <p className="font-mono font-medium">{order.transactionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phương thức</p>
                  <p className="font-medium capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nội dung</p>
                  <p className="font-medium">{order.transactionContent}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thời gian</p>
                  <p className="font-medium">{formatDate(order.transactionDateTime)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection/Cancellation Info */}
          {(order.status === 'REJECTED' || order.status === 'CANCELLED') && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                {order.status === 'REJECTED' ? 'Lý do từ chối' : 'Lý do hủy'}
              </h2>
              <p className="text-red-700">
                {order.rejectionReason || order.cancellationReason || 'Không có lý do cụ thể'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Thời gian: {formatDate(order.rejectionDateTime || order.cancelledDateTime)}
              </p>
            </div>
          )}

          {/* Cancel Button */}
          {canCancel && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-700">Hủy đơn hàng</h3>
                  <p className="text-sm text-amber-600 mt-1 mb-4">
                    Bạn có thể hủy đơn hàng này trước khi được duyệt. Tiền sẽ được hoàn lại vào phương thức thanh toán ban đầu.
                  </p>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Hủy đơn hàng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Xác nhận hủy đơn hàng</h3>
                  <p className="text-sm text-muted-foreground">#{order.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Lý do hủy (không bắt buộc)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl mb-4">
                <p className="text-sm text-amber-700">
                  ⚠️ Sau khi hủy, tiền sẽ được hoàn lại vào phương thức thanh toán ban đầu. Thao tác này không thể hoàn tác.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Xác nhận hủy'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

