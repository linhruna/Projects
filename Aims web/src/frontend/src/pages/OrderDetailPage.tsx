import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  BadgeCheck,
  XCircle,
  Clock,
  ArrowLeft,
  Receipt,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Loader2,
  Copy,
  RefreshCw
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
    'REFUNDED': { label: 'Đã hoàn tiền', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <RefreshCw className="w-4 h-4" /> },
  };

  const config = statusConfig[status] || statusConfig['PENDING'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Check if coming from cancel link
  const isCancelMode = searchParams.get('cancel') === 'true';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await invoiceApi.getById(id);
        setOrder(data);

        if (isCancelMode && data.status === 'PENDING_PROCESSING') {
          setShowCancelModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isCancelMode]);

  const handleCancel = async () => {
    if (!order || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      setCancelling(true);
      await invoiceApi.cancel(order.id, cancelReason);
      toast.success('Đã hủy đơn hàng thành công. Tiền sẽ được hoàn trong 3-5 ngày.');
      setShowCancelModal(false);
      // Refresh order data
      const updatedOrder = await invoiceApi.getById(order.id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">Không tìm thấy đơn hàng</h2>
            <p className="text-muted-foreground mb-6">
              Đơn hàng không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white px-6 py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Receipt className="w-7 h-7 text-primary" />
                Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
                <button
                  onClick={() => copyToClipboard(order.id, 'mã đơn hàng')}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </h1>
              <p className="text-muted-foreground mt-1">
                Đặt lúc: {formatDate(order.createAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Rejection/Cancellation Notice */}
        {(order.status === 'REJECTED' || order.status === 'CANCELLED') && (
          <div className={`rounded-2xl p-6 mb-6 ${order.status === 'REJECTED' ? 'bg-red-50 border border-red-200' : 'bg-gray-100 border border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-6 h-6 mt-0.5 ${order.status === 'REJECTED' ? 'text-red-500' : 'text-gray-500'}`} />
              <div>
                <h3 className={`font-semibold ${order.status === 'REJECTED' ? 'text-red-700' : 'text-gray-700'}`}>
                  {order.status === 'REJECTED' ? 'Đơn hàng bị từ chối' : 'Đơn hàng đã bị hủy'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.rejectionReason || order.cancellationReason || 'Không có lý do cụ thể'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Số tiền {formatCurrency(order.amount)} sẽ được hoàn trả trong 3-5 ngày làm việc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Thông tin đơn hàng
            </h2>

            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-primary-dark">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary-dark">{formatCurrency(order.amount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Không có sản phẩm</p>
            )}
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Thông tin giao hàng
            </h2>

            {order.deliveryInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-dark" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Người nhận</p>
                    <p className="font-medium">{order.deliveryInfo.receiveName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary-dark" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{order.deliveryInfo.phoneNumber}</p>
                  </div>
                </div>

                {order.deliveryInfo.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-dark" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{order.deliveryInfo.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-dark" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Địa chỉ</p>
                    <p className="font-medium">{order.deliveryInfo.detailAddress}</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryInfo.city}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Chưa có thông tin giao hàng</p>
            )}
          </div>
        </div>

        {/* Transaction Info */}
        {order.transactionId && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mt-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Thông tin giao dịch
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Mã giao dịch</p>
                <p className="font-mono font-medium flex items-center gap-2">
                  {order.transactionId}
                  <button
                    onClick={() => copyToClipboard(order.transactionId!, 'mã giao dịch')}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  </button>
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Nội dung</p>
                <p className="font-medium">{order.transactionContent}</p>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Thời gian</p>
                <p className="font-medium">{formatDate(order.transactionDateTime)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm text-emerald-700 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" />
                Thanh toán qua {order.paymentMethod}
              </p>
            </div>
          </div>
        )}

        {/* Cancel Button - only for PENDING_PROCESSING orders */}
        {order.status === 'PENDING_PROCESSING' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl transition-colors font-medium"
            >
              Hủy đơn hàng
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              Bạn chỉ có thể hủy đơn hàng trước khi được duyệt
            </p>
          </div>
        )}

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
                  <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Lý do hủy *</label>
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
                  💰 Số tiền {formatCurrency(order.amount)} sẽ được hoàn trả trong 3-5 ngày làm việc.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  Giữ đơn hàng
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang hủy...
                    </>
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

