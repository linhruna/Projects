import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AlertTriangle,
    Loader2,
    Home,
    XCircle,
    BadgeCheck,
    ArrowLeft,
    Receipt
} from 'lucide-react';
import { invoiceApi, InvoiceResponse } from '../services/api';
import { toast } from 'sonner';

/**
 * PublicOrderCancelPage - Direct cancel page from email link
 * Route: /order/:token/cancel
 * 
 * This page allows customers to cancel their order directly from the email link.
 * It shows order summary and confirmation dialog.
 */
export const PublicOrderCancelPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<InvoiceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token) {
                setError('Invalid cancel link');
                setLoading(false);
                return;
            }

            try {
                const orderData = await invoiceApi.getByAccessToken(token);
                setOrder(orderData);

                // Check if already cancelled or not cancellable
                if (orderData.status === 'CANCELLED') {
                    setCancelled(true);
                } else if (orderData.status !== 'PENDING_PROCESSING') {
                    setError(`Đơn hàng không thể hủy. Trạng thái hiện tại: ${getStatusLabel(orderData.status)}`);
                }
            } catch (err) {
                setError('Không tìm thấy đơn hàng hoặc link đã hết hạn');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [token]);

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'Đang tạo',
            'CONFIRMED': 'Đã xác nhận',
            'PENDING_PROCESSING': 'Chờ xử lý',
            'APPROVED': 'Đã duyệt',
            'REJECTED': 'Bị từ chối',
            'CANCELLED': 'Đã hủy',
        };
        return labels[status] || status;
    };

    const handleCancelOrder = async () => {
        if (!token) return;

        try {
            setCancelling(true);
            await invoiceApi.cancelByAccessToken(token, cancelReason || 'Khách hàng hủy qua email link');
            setCancelled(true);
            toast.success('Đơn hàng đã được hủy thành công. Tiền sẽ được hoàn lại trong 3-5 ngày làm việc.');
        } catch (err: any) {
            toast.error(err.message || 'Không thể hủy đơn hàng');
        } finally {
            setCancelling(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Loading state
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

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-3">Không thể hủy đơn hàng</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {token && (
                                <Link
                                    to={`/order/public/${token}`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                                >
                                    <Receipt className="w-4 h-4" />
                                    Xem đơn hàng
                                </Link>
                            )}
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Already cancelled state
    if (cancelled) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
                <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', padding: '48px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <BadgeCheck style={{ width: '40px', height: '40px', color: '#22c55e' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#111827' }}>Đơn hàng đã được hủy</h2>
                        <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                            Đơn hàng #{order?.id.substring(0, 8).toUpperCase()} đã được hủy thành công.
                        </p>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            Số tiền <strong style={{ color: '#111827' }}>{formatCurrency(order?.amount || 0)}</strong> sẽ được hoàn trả vào phương thức thanh toán ban đầu trong vòng 3-5 ngày làm việc.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {token && (
                                <Link
                                    to={`/order/public/${token}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '12px 24px',
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Xem chi tiết đơn hàng
                                </Link>
                            )}
                            <Link
                                to="/"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '12px 24px',
                                    backgroundColor: '#7c3aed',
                                    color: 'white',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Cancel confirmation form
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb, #ffffff)', padding: '32px 0' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px' }}>
                {/* Back link */}
                <Link
                    to={`/order/public/${token}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6b7280', marginBottom: '24px', textDecoration: 'none' }}
                >
                    ← Quay lại xem đơn hàng
                </Link>

                {/* Cancel Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '32px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Xác nhận hủy đơn hàng</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', fontSize: '16px' }}>Mã đơn hàng: #{order?.id.substring(0, 8).toUpperCase()}</p>
                    </div>

                    {/* Order Summary */}
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#111827' }}>Thông tin đơn hàng</h3>
                        <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>Người nhận:</span>
                                <span style={{ fontWeight: 500, color: '#111827' }}>{order?.deliveryInfo?.receiveName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>Số điện thoại:</span>
                                <span style={{ fontWeight: 500, color: '#111827' }}>{order?.deliveryInfo?.phoneNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>Số sản phẩm:</span>
                                <span style={{ fontWeight: 500, color: '#111827' }}>{order?.items?.length || 0} sản phẩm</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#111827' }}>Tổng tiền:</span>
                                <span style={{ fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(order?.amount || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cancel Reason */}
                    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#111827' }}>
                            Lý do hủy đơn hàng <span style={{ color: '#6b7280' }}>(không bắt buộc)</span>
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng..."
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '12px',
                                resize: 'none',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                            rows={3}
                        />
                    </div>

                    {/* Warning */}
                    <div style={{ padding: '24px', backgroundColor: '#fef3c7', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '14px', color: '#92400e' }}>
                                <p style={{ fontWeight: 500, marginBottom: '4px' }}>Lưu ý quan trọng:</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#b45309' }}>
                                    <li style={{ marginBottom: '4px' }}>Thao tác này không thể hoàn tác</li>
                                    <li style={{ marginBottom: '4px' }}>Tiền sẽ được hoàn lại trong 3-5 ngày làm việc</li>
                                    <li>Bạn sẽ nhận được email xác nhận sau khi hủy</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '24px', display: 'flex', gap: '16px' }}>
                        <Link
                            to={`/order/public/${token}`}
                            style={{
                                flex: 1,
                                padding: '14px 20px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '16px',
                                textAlign: 'center',
                                textDecoration: 'none',
                                color: '#374151',
                                display: 'block'
                            }}
                        >
                            Không, giữ đơn hàng
                        </Link>
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            style={{
                                flex: 1,
                                padding: '14px 20px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '16px',
                                border: 'none',
                                cursor: cancelling ? 'not-allowed' : 'pointer',
                                opacity: cancelling ? 0.5 : 1
                            }}
                        >
                            {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy đơn hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
