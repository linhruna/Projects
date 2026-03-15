import React, { useState, useEffect } from 'react';
import {
  Package,
  BadgeCheck,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Receipt,
  Loader2,
  Eye,
  RefreshCw,
  AlertTriangle,
  History,
  UserCheck
} from 'lucide-react';
import { invoiceApi, InvoiceResponse, PaginatedInvoiceResponse } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    'PENDING': { label: 'Đang tạo', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    'CONFIRMED': { label: 'Đã xác nhận', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    'PENDING_PROCESSING': { label: 'Chờ xử lý', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    'APPROVED': { label: 'Đã duyệt', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    'REJECTED': { label: 'Bị từ chối', color: 'text-red-600', bgColor: 'bg-red-100' },
    'CANCELLED': { label: 'Đã hủy', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  };

  const config = statusConfig[status] || statusConfig['PENDING'];

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
      {config.label}
    </span>
  );
};

type TabType = 'pending' | 'processed';

export const OrderManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [orders, setOrders] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<InvoiceResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response: PaginatedInvoiceResponse;
      if (activeTab === 'pending') {
        response = await invoiceApi.getPending(page, 30);
      } else {
        response = await invoiceApi.getProcessed(page, 30);
      }
      setOrders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const rejectReasonRef = React.useRef<HTMLSelectElement>(null);
  const detailModalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab]);

  // Focus on reason input when reject modal opens
  useEffect(() => {
    if (showRejectModal && rejectReasonRef.current) {
      // Small timeout to allow render
      setTimeout(() => {
        rejectReasonRef.current?.focus();
        rejectReasonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [showRejectModal]);

  // Ensure detail section is visible when opened
  useEffect(() => {
    if (showDetailModal && detailModalRef.current) {
      detailModalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showDetailModal, selectedOrder]);

  const handleViewDetail = (order: InvoiceResponse) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleApprove = async (order: InvoiceResponse) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    try {
      setProcessing(true);
      await invoiceApi.approve(order.id, currentUser.name);
      toast.success('Đã duyệt đơn hàng thành công');
      setShowDetailModal(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to approve order:', error);
      toast.error(error.message || 'Không thể duyệt đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (order: InvoiceResponse) => {
    setSelectedOrder(order);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedOrder || !currentUser) return;

    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessing(true);
      await invoiceApi.reject(selectedOrder.id, currentUser.name, rejectReason);
      toast.success('Đã từ chối đơn hàng');
      setShowRejectModal(false);
      setShowDetailModal(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to reject order:', error);
      toast.error(error.message || 'Không thể từ chối đơn hàng');
    } finally {
      setProcessing(false);
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Package className="w-7 h-7 text-primary" />
                Quản lý Đơn hàng
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === 'pending'
                  ? `${totalElements} đơn hàng đang chờ xử lý`
                  : `${totalElements} đơn hàng đã xử lý`}
              </p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'pending'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-muted/50 border border-gray-200'
                }`}
            >
              <Clock className="w-4 h-4" />
              Chờ xử lý
            </button>
            <button
              onClick={() => setActiveTab('processed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'processed'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-muted/50 border border-gray-200'
                }`}
            >
              <History className="w-4 h-4" />
              Đã xử lý
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Mã đơn</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Khách hàng</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Tổng tiền</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Thanh toán</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Ngày đặt</th>
                  <th className="text-left py-4 px-4 font-semibold text-sm">Trạng thái</th>
                  {activeTab === 'processed' && (
                    <th className="text-left py-4 px-4 font-semibold text-sm">Người xử lý</th>
                  )}
                  <th className="text-center py-4 px-4 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'processed' ? 8 : 7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">
                          {activeTab === 'pending'
                            ? 'Không có đơn hàng nào đang chờ xử lý'
                            : 'Chưa có đơn hàng nào được xử lý'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-medium">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-sm">{order.deliveryInfo?.receiveName || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{order.deliveryInfo?.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-primary-dark">{formatCurrency(order.amount)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm capitalize">{order.paymentMethod}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">{formatDate(order.createAt)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      {activeTab === 'processed' && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {order.status === 'APPROVED' && order.approvedBy && (
                              <>
                                <UserCheck className="w-4 h-4 text-emerald-500" />
                                <div>
                                  <p className="text-sm font-medium text-emerald-600">{order.approvedBy}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.approvedDateTime)}</p>
                                </div>
                              </>
                            )}
                            {order.status === 'REJECTED' && order.rejectedBy && (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <div>
                                  <p className="text-sm font-medium text-red-600">{order.rejectedBy}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.rejectionDateTime)}</p>
                                </div>
                              </>
                            )}
                            {order.status === 'CANCELLED' && (
                              <>
                                <AlertTriangle className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.cancelledDateTime)}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group shadow-sm hover:shadow-md"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                          {activeTab === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(order)}
                                disabled={processing}
                                className="p-2 hover:bg-emerald-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group shadow-sm hover:shadow-md"
                                title="Duyệt đơn"
                              >
                                <BadgeCheck className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                              </button>
                              <button
                                onClick={() => handleRejectClick(order)}
                                disabled={processing}
                                className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group shadow-sm hover:shadow-md"
                                title="Từ chối"
                              >
                                <XCircle className="w-4 h-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Trang {page + 1} / {totalPages} ({totalElements} đơn hàng)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border bg-white hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border bg-white hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {showDetailModal && selectedOrder && (
          <div ref={detailModalRef} className="mt-6 bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden scroll-mt-24 animate-in slide-in-from-bottom-5 duration-300">
            {/* Section Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Đơn hàng #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.createAt)}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Section Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Thông tin khách hàng
                </h4>
                {selectedOrder.deliveryInfo ? (
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Họ tên:</span>
                      <p className="font-medium">{selectedOrder.deliveryInfo.receiveName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SĐT:</span>
                      <p className="font-medium">{selectedOrder.deliveryInfo.phoneNumber}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Địa chỉ:</span>
                      <p className="font-medium">{selectedOrder.deliveryInfo.detailAddress}, {selectedOrder.deliveryInfo.city}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Không có thông tin</p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Sản phẩm
                </h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-primary-dark self-center">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Không có sản phẩm</p>
                )}
              </div>

              {/* Transaction Info */}
              {selectedOrder.transactionId && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-700">
                    <CreditCard className="w-4 h-4" />
                    Thông tin thanh toán
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mã GD:</span>
                      <p className="font-mono font-medium">{selectedOrder.transactionId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phương thức:</span>
                      <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nội dung:</span>
                      <p className="font-medium">{selectedOrder.transactionContent}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thời gian:</span>
                      <p className="font-medium">{formatDate(selectedOrder.transactionDateTime)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Decision Info - Show for approved/rejected/cancelled orders */}
              {selectedOrder.status === 'APPROVED' && selectedOrder.approvedBy && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-700">
                    <UserCheck className="w-4 h-4" />
                    Thông tin duyệt đơn
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Người duyệt:</span>
                      <p className="font-medium text-emerald-600">{selectedOrder.approvedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thời gian duyệt:</span>
                      <p className="font-medium">{formatDate(selectedOrder.approvedDateTime)}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'REJECTED' && selectedOrder.rejectedBy && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                    <XCircle className="w-4 h-4" />
                    Thông tin từ chối
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Người từ chối:</span>
                      <p className="font-medium text-red-600">{selectedOrder.rejectedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thời gian từ chối:</span>
                      <p className="font-medium">{formatDate(selectedOrder.rejectionDateTime)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Lý do:</span>
                      <p className="font-medium text-red-600">{selectedOrder.rejectionReason || 'Không có lý do'}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'CANCELLED' && (
                <div className="bg-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                    <AlertTriangle className="w-4 h-4" />
                    Thông tin hủy đơn
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Hủy bởi:</span>
                      <p className="font-medium text-gray-600">Khách hàng</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thời gian hủy:</span>
                      <p className="font-medium">{formatDate(selectedOrder.cancelledDateTime)}</p>
                    </div>
                    {selectedOrder.cancellationReason && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Lý do:</span>
                        <p className="font-medium text-gray-600">{selectedOrder.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                <span className="font-semibold">Tổng thanh toán</span>
                <span className="text-xl font-bold text-primary-dark">{formatCurrency(selectedOrder.amount)}</span>
              </div>
            </div>

            {/* Section Footer */}
            <div className="bg-muted/20 border-t px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }}
                className={`${activeTab === 'pending' ? 'flex-1' : 'w-full'} px-4 py-3 border rounded-xl hover:bg-gray-200 transition-all duration-200 hover:shadow-md active:scale-[0.98] font-medium`}
              >
                Đóng
              </button>
              {activeTab === 'pending' && selectedOrder.status === 'PENDING_PROCESSING' && (
                <>
                  <button
                    onClick={() => handleRejectClick(selectedOrder)}
                    disabled={processing}
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                    className="flex-1 px-4 py-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(selectedOrder)}
                    disabled={processing}
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                    className="flex-1 px-4 py-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="w-4 h-4" />
                    )}
                    Duyệt đơn
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Từ chối đơn hàng</h3>
                  <p className="text-sm text-muted-foreground">#{selectedOrder.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Lý do từ chối *</label>
                <select
                  ref={rejectReasonRef}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-2"
                >
                  <option value="">Chọn lý do...</option>
                  <option value="Hết hàng">Hết hàng</option>
                  <option value="Không thể giao đến địa chỉ này">Không thể giao đến địa chỉ này</option>
                  <option value="Không tìm thấy sản phẩm trong kho">Không tìm thấy sản phẩm trong kho</option>
                  <option value="Thông tin khách hàng không hợp lệ">Thông tin khách hàng không hợp lệ</option>
                  <option value="Khác">Khác</option>
                </select>
                {rejectReason === 'Khác' && (
                  <textarea
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do cụ thể..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    rows={2}
                  />
                )}
              </div>

              <div className="bg-amber-50 p-3 rounded-xl mb-4">
                <p className="text-sm text-amber-700">
                  ⚠️ Tiền sẽ được hoàn trả cho khách hàng và thông báo sẽ được gửi qua email.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  style={{ backgroundColor: '#e5e7eb', color: '#374151', borderColor: '#d1d5db' }}
                  className="px-4 py-3 border rounded-xl hover:opacity-80 transition-all duration-200 hover:shadow-md active:scale-[0.98] font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectReason.trim() || rejectReason === 'Khác'}
                  style={{
                    backgroundColor: (processing || !rejectReason.trim() || rejectReason === 'Khác') ? '#d1d5db' : '#dc2626',
                    color: (processing || !rejectReason.trim() || rejectReason === 'Khác') ? '#6b7280' : 'white'
                  }}
                  className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </>
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

