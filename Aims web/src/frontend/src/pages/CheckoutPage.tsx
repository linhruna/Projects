import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CreditCard, BadgeCheck, ShoppingBag, Package, Truck, Tag, Loader2, QrCode, ExternalLink, XCircle, ArrowLeft, Copy, User, Phone, MapPin, Mail, Receipt, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ShippingInfo } from '../types';
import { invoiceApi, paymentApi, shippingApi, VietQrResponse, PaypalResponse, InvoiceResponse } from '../services/api';
import { toast } from 'sonner';
import AddressSelector from '../components/AddressSelector';

type PaymentStatus = 'idle' | 'processing' | 'qr_display' | 'confirming' | 'paypal_redirect' | 'success' | 'failed';

interface CompletedOrderInfo {
  orderId: string;
  transactionId: string;
  transactionContent: string;
  transactionDateTime: string;
  amount: number;
  paymentMethod: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  orderAccessToken?: string;
}

// Persist cart and order info before PayPal redirect
const saveCartToSession = (cart: any[], total: number) => {
  sessionStorage.setItem('aims_cart_backup', JSON.stringify(cart));
  sessionStorage.setItem('aims_cart_total', total.toString());
};

const saveOrderInfoToSession = (invoiceId: string, shippingInfo: ShippingInfo, paymentMethod: string) => {
  sessionStorage.setItem('aims_invoice_id', invoiceId);
  sessionStorage.setItem('aims_shipping_info', JSON.stringify(shippingInfo));
  sessionStorage.setItem('aims_payment_method', paymentMethod);
};

const getOrderInfoFromSession = () => {
  const invoiceId = sessionStorage.getItem('aims_invoice_id');
  const shippingInfoStr = sessionStorage.getItem('aims_shipping_info');
  const paymentMethod = sessionStorage.getItem('aims_payment_method');
  return {
    invoiceId,
    shippingInfo: shippingInfoStr ? JSON.parse(shippingInfoStr) as ShippingInfo : null,
    paymentMethod,
  };
};

const clearCartFromSession = () => {
  sessionStorage.removeItem('aims_cart_backup');
  sessionStorage.removeItem('aims_cart_total');
  sessionStorage.removeItem('aims_invoice_id');
  sessionStorage.removeItem('aims_shipping_info');
  sessionStorage.removeItem('aims_payment_method');
};

export const CheckoutPage: React.FC = () => {
  const { cart, getCartTotal, getCartWeight, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    phone: '',
    address: '',
    city: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'paypal'>('vietqr');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [qrData, setQrData] = useState<VietQrResponse | null>(null);
  const [paypalData, setPaypalData] = useState<PaypalResponse | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPaypalReturn, setIsPaypalReturn] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderInfo | null>(null);
  const [email, setEmail] = useState<string>('');
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState<boolean>(false);

  // Ref to track if PayPal return has been processed
  const paypalProcessedRef = useRef(false);

  // Check for PayPal return FIRST before anything else - runs only once
  useEffect(() => {
    // Prevent duplicate processing
    if (paypalProcessedRef.current) return;

    const paypalSuccess = searchParams.get('paypal_success');
    const paypalCancel = searchParams.get('paypal_cancel');

    if (paypalSuccess === 'true') {
      paypalProcessedRef.current = true;
      setIsPaypalReturn(true);

      // Clear URL params immediately to prevent re-triggering
      setSearchParams({}, { replace: true });

      // Process PayPal payment completion
      const processPaypalSuccess = async () => {
        try {
          // Retrieve saved order info from session
          const savedOrderInfo = getOrderInfoFromSession();

          if (savedOrderInfo.invoiceId && savedOrderInfo.shippingInfo) {
            // Generate transaction info
            const transactionId = `PAYPAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const transactionContent = `PayPal Payment - Order ${savedOrderInfo.invoiceId.substring(0, 8).toUpperCase()}`;

            // Complete payment on backend and get order access token
            let orderAccessToken: string | undefined;
            try {
              const completedInvoice = await invoiceApi.completePayment(savedOrderInfo.invoiceId, transactionId, transactionContent);
              orderAccessToken = completedInvoice.orderAccessToken;
            } catch (error) {
              console.error('Failed to complete payment on backend:', error);
            }

            // Get total from session
            const savedTotal = parseFloat(sessionStorage.getItem('aims_cart_total') || '0');

            // Set completed order info for success screen
            setCompletedOrder({
              orderId: savedOrderInfo.invoiceId,
              transactionId,
              transactionContent,
              transactionDateTime: new Date().toISOString(),
              amount: savedTotal,
              paymentMethod: 'PayPal',
              customerName: savedOrderInfo.shippingInfo.name,
              phone: savedOrderInfo.shippingInfo.phone,
              email: savedOrderInfo.shippingInfo.email,
              address: savedOrderInfo.shippingInfo.address,
              city: savedOrderInfo.shippingInfo.city,
              orderAccessToken,
            });

            // Also update local state for display
            setShippingInfo(savedOrderInfo.shippingInfo);
            setInvoiceId(savedOrderInfo.invoiceId);
            // Restore email state from session
            if (savedOrderInfo.shippingInfo.email) {
              setEmail(savedOrderInfo.shippingInfo.email);
            }
          }

          // Clear cart and session
          clearCart();
          clearCartFromSession();

          setPaymentStatus('success');
          toast.success(`🎉 Thanh toán PayPal thành công!`, {
            duration: 3000,
          });
        } catch (error) {
          console.error('Error processing PayPal success:', error);
          toast.error('Có lỗi xảy ra khi xử lý thanh toán');
          navigate('/', { replace: true });
        }
      };

      processPaypalSuccess();
    } else if (paypalCancel === 'true') {
      paypalProcessedRef.current = true;
      setIsPaypalReturn(true);
      toast.error('Thanh toán PayPal đã bị hủy');

      // Clear URL params and session
      setSearchParams({}, { replace: true });
      clearCartFromSession();

      // Redirect back to home since cart might be empty
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate shipping fee from backend API - MUST be before any early returns
  const calculateShippingFee = useCallback(async () => {
    const weight = getCartWeight();
    const subtotalValue = getCartTotal();
    const city = shippingInfo.city;

    // Only call API if we have a city selected
    if (!city || city.trim() === '') {
      setShippingFee(0);
      return;
    }

    setIsCalculatingShipping(true);
    try {
      const response = await shippingApi.calculateShippingFee({
        totalWeight: weight || 0.5,
        city: city,
        subtotal: subtotalValue,
      });
      setShippingFee(response.shippingFee);
    } catch (error) {
      console.error('Failed to calculate shipping fee:', error);
      // Fallback: Calculate locally using the same formula as backend
      const FREE_SHIPPING_THRESHOLD = 100000;
      const MAX_FREE_SHIPPING_DISCOUNT = 25000;
      const WEIGHT_UNIT = 0.5;
      const ADDITIONAL_FEE_PER_UNIT = 2500;

      // Check if metro city (Hanoi or HCM)
      const cityLower = city.toLowerCase();
      const isMetro = cityLower.includes('hà nội') || cityLower.includes('ha noi') ||
        cityLower.includes('hanoi') || cityLower === 'hn' ||
        cityLower.includes('hồ chí minh') || cityLower.includes('ho chi minh') ||
        cityLower.includes('hcm') || cityLower.includes('sài gòn');

      let baseFee: number;
      let baseWeight: number;

      if (isMetro) {
        baseFee = 22000; // First 3kg
        baseWeight = 3;
      } else {
        baseFee = 30000; // First 0.5kg
        baseWeight = 0.5;
      }

      let calculatedFee = baseFee;
      const actualWeight = weight || 0.5;
      if (actualWeight > baseWeight) {
        const extraWeight = actualWeight - baseWeight;
        const extraUnits = Math.ceil(extraWeight / WEIGHT_UNIT);
        calculatedFee += extraUnits * ADDITIONAL_FEE_PER_UNIT;
      }

      // Apply free shipping discount
      const freeShippingDiscount = subtotalValue > FREE_SHIPPING_THRESHOLD ? MAX_FREE_SHIPPING_DISCOUNT : 0;
      const discount = Math.min(calculatedFee, freeShippingDiscount);
      setShippingFee(Math.max(0, calculatedFee - discount));
    } finally {
      setIsCalculatingShipping(false);
    }
  }, [getCartWeight, getCartTotal, shippingInfo.city]);

  // Recalculate shipping fee when city or cart changes
  useEffect(() => {
    calculateShippingFee();
  }, [calculateShippingFee]);

  // Calculate totals (can be used in early returns too)
  const subtotal = getCartTotal();
  const VAT_RATE = 0.1;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat + shippingFee;

  const handlePaymentSuccess = async (method: string, txId?: string, txContent?: string, totalAmount?: number) => {
    // Store info before clearing cart
    const orderInfo: CompletedOrderInfo = {
      orderId: invoiceId || 'N/A',
      transactionId: txId || `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      transactionContent: txContent || `AIMS Payment - Order ${invoiceId?.substring(0, 8).toUpperCase()}`,
      transactionDateTime: new Date().toISOString(),
      amount: totalAmount || 0,
      paymentMethod: method,
      customerName: shippingInfo.name,
      phone: shippingInfo.phone,
      email: email,
      address: shippingInfo.address,
      city: shippingInfo.city,
    };

    clearCart();
    clearCartFromSession();

    // Complete payment on backend and get order access token
    if (invoiceId) {
      try {
        const completedInvoice = await invoiceApi.completePayment(invoiceId, orderInfo.transactionId, orderInfo.transactionContent);
        // Get the order access token for email link
        if (completedInvoice.orderAccessToken) {
          orderInfo.orderAccessToken = completedInvoice.orderAccessToken;
        }
      } catch (error) {
        console.error('Failed to complete payment on backend:', error);
      }
    }

    // Store completed order info for display
    setCompletedOrder(orderInfo);

    setPaymentStatus('success');
    toast.success(`🎉 Thanh toán ${method} thành công!`, {
      duration: 3000,
    });
  };

  // Success Screen (for PayPal return and VietQR completion)
  if (paymentStatus === 'success') {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-8 text-center mb-6">

            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
              <BadgeCheck className="w-10 h-10 text-white relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-emerald-600">Thanh toán thành công!</h2>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã mua hàng tại AIMS Store
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm">
              <Clock className="w-4 h-4" />
              Đơn hàng đang chờ xử lý
            </div>
          </div>

          {completedOrder && (
            <>
              {/* Order Info */}
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Thông tin đơn hàng
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                    <p className="font-mono font-bold text-lg">#{completedOrder.orderId.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Tổng thanh toán</p>
                    <p className="font-bold text-lg text-primary-dark">{formatCurrency(completedOrder.amount)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Thông tin giao hàng
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-dark" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Người nhận</p>
                      <p className="font-medium">{completedOrder.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary-dark" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{completedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-dark" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">{completedOrder.address}</p>
                      <p className="text-sm text-muted-foreground">{completedOrder.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Thông tin giao dịch
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-sm text-emerald-600 mb-1">Mã giao dịch</p>
                    <p className="font-mono font-medium text-emerald-700">{completedOrder.transactionId}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-sm text-emerald-600 mb-1">Phương thức</p>
                    <p className="font-medium text-emerald-700">{completedOrder.paymentMethod}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Nội dung giao dịch</p>
                    <p className="font-medium">{completedOrder.transactionContent}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Thời gian giao dịch</p>
                    <p className="font-medium">{formatDate(completedOrder.transactionDateTime)}</p>
                  </div>
                </div>
              </div>

              {/* Email Notice with Order Link */}
              {completedOrder.email && (
                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-700">Thông tin đơn hàng đã được gửi đến email</p>
                      <p className="text-sm text-blue-600">{completedOrder.email}</p>
                      {completedOrder.orderAccessToken && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-blue-500">Link xem và hủy đơn hàng (có thể dùng từ email):</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                              to={`/order/view/${completedOrder.orderAccessToken}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Package className="w-4 h-4" />
                              Xem đơn hàng
                            </Link>
                            <button
                              onClick={() => {
                                const link = `${window.location.origin}/order/view/${completedOrder.orderAccessToken}`;
                                navigator.clipboard.writeText(link);
                                toast.success('Đã sao chép link vào clipboard');
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Sao chép link
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {completedOrder && (
              <Link
                to={`/order/${completedOrder.orderId}`}
                className="flex-1 bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white py-4 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all text-center font-medium shadow-soft"
              >
                Xem chi tiết đơn hàng
              </Link>
            )}
            <Link
              to="/"
              className="flex-1 bg-muted text-foreground py-4 rounded-xl hover:bg-muted/80 transition-colors text-center font-medium"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For PayPal return without order info (redirect immediately)
  if (isPaypalReturn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <BadgeCheck className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-emerald-600">Thanh toán thành công!</h2>
            <p className="text-muted-foreground mb-6">
              Cảm ơn bạn đã mua hàng tại AIMS Store. Đơn hàng của bạn đang được xử lý.
            </p>
            <div className="animate-pulse text-sm text-muted-foreground">
              Đang chuyển về trang chủ...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart only if NOT a paypal return
  if (cart.length === 0 && !isPaypalReturn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-[#A7C7E7]/20 to-[#C8B6FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="mb-3">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-8">
              Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white px-8 py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft font-medium"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!shippingInfo.name.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!/^\d{10}$/.test(shippingInfo.phone)) {
      toast.error('Số điện thoại không hợp lệ (10 chữ số)');
      return false;
    }
    if (!shippingInfo.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return false;
    }
    if (!shippingInfo.city.trim()) {
      toast.error('Vui lòng nhập tỉnh/thành phố');
      return false;
    }
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create order ID
      let createdInvoiceId = invoiceId || `AIMS-${Date.now()}`;
      setInvoiceId(createdInvoiceId);

      // Try to create invoice via API
      try {
        const invoiceResponse = await invoiceApi.create({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        });
        createdInvoiceId = invoiceResponse.id;
        setInvoiceId(createdInvoiceId);

        await invoiceApi.update(createdInvoiceId, {
          deliveryInfo: {
            receiveName: shippingInfo.name,
            phoneNumber: shippingInfo.phone,
            email: email || `${shippingInfo.phone}@aims.vn`,
            city: shippingInfo.city,
            detailAddress: shippingInfo.address,
          },
          paymentMethod: paymentMethod === 'vietqr' ? 'VIETQR' : 'PAYPAL',
        });
      } catch (invoiceError) {
        console.warn('Invoice API not available, proceeding with payment only');
      }

      // Process payment based on method
      if (paymentMethod === 'vietqr') {
        await processVietQrPayment(createdInvoiceId);
      } else {
        await processPaypalPayment(createdInvoiceId);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không thể xử lý thanh toán');
      setPaymentStatus('failed');
      toast.error('Không thể xử lý thanh toán. Vui lòng thử lại.');
    }
  };

  // VietQR bank info - MB Bank
  const VIETQR_BANK_BIN = '970422'; // MB Bank BIN code
  const VIETQR_ACCOUNT_NO = '0859991285';
  const VIETQR_ACCOUNT_NAME = 'THAI MINH QUAN';
  const VIETQR_BANK_NAME = 'MB Bank (Ngân hàng Quân đội)';

  // Generate VietQR image URL using public API
  const generateVietQrImageUrl = (amount: number, content: string) => {
    const encodedAccountName = encodeURIComponent(VIETQR_ACCOUNT_NAME);
    const encodedContent = encodeURIComponent(content);
    return `https://img.vietqr.io/image/${VIETQR_BANK_BIN}-${VIETQR_ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;
  };

  const processVietQrPayment = async (orderId: string) => {
    // Always use VietQR public image API (most reliable)
    const content = `AIMS${orderId.substring(0, 8)}`;
    const amount = Math.round(total);
    const qrImageUrl = generateVietQrImageUrl(amount, content);

    console.log('VietQR Image URL:', qrImageUrl);

    // Try to call backend API for invoice tracking (optional)
    try {
      await paymentApi.createVietQr({
        invoiceId: orderId,
        description: `Thanh toan don hang ${orderId}`,
        amount: amount.toString(),
      });
    } catch (error) {
      console.warn('Backend VietQR API call failed (non-critical):', error);
    }

    // Set QR data with public API URL
    setQrData({
      status: 'SUCCESS',
      message: 'Quét mã QR để thanh toán',
      bankName: VIETQR_BANK_NAME,
      bankAccount: VIETQR_ACCOUNT_NO,
      userBankName: VIETQR_ACCOUNT_NAME,
      amount: amount.toString(),
      content: content,
      qrLink: qrImageUrl,
    });
    setPaymentStatus('qr_display');
    toast.success('Đã tạo mã QR thanh toán!');
  };

  const processPaypalPayment = async (orderId: string) => {
    // Save cart and order info to session before redirect
    saveCartToSession(cart, total);
    // Include email in shippingInfo for retrieval after PayPal redirect
    const shippingInfoWithEmail = { ...shippingInfo, email };
    saveOrderInfoToSession(orderId, shippingInfoWithEmail, 'paypal');

    // Convert VND to USD
    const amountUSD = Math.max(1, Math.ceil(total / 24000));

    const paypalResponse = await paymentApi.createPaypal({
      invoiceId: orderId,
      description: `AIMS Order ${orderId}`,
      amount: amountUSD,
      currency: 'USD',
    });

    console.log('PayPal Response:', paypalResponse);

    if (paypalResponse.links && paypalResponse.links.length > 0) {
      setPaypalData(paypalResponse);

      // Find the approval URL
      const approvalLink = paypalResponse.links.find(link =>
        link.rel === 'approve' || link.rel === 'payer-action'
      );

      if (approvalLink) {
        setPaymentStatus('paypal_redirect');
        toast.success('Đang chuyển đến PayPal Sandbox...');

        // Redirect to PayPal immediately
        setTimeout(() => {
          window.location.href = approvalLink.href;
        }, 1000);
        return;
      }
    }

    // If no approval link found, throw error
    throw new Error('Không tìm thấy link thanh toán PayPal. Vui lòng thử lại.');
  };

  const handleVietQrPaymentComplete = async () => {
    if (!invoiceId) {
      toast.error('Không tìm thấy mã giao dịch');
      return;
    }

    setPaymentStatus('confirming');
    toast.info('Đang xác nhận thanh toán...');

    try {
      // Call confirm endpoint to mark payment as confirmed
      await paymentApi.confirmVietQrPayment(invoiceId);

      // Poll for status confirmation
      let attempts = 0;
      const maxAttempts = 10;

      const checkStatus = async () => {
        attempts++;
        const status = await paymentApi.checkVietQrStatus(invoiceId);

        if (status.status === 'CONFIRMED') {
          handlePaymentSuccess('VietQR', undefined, undefined, total);
          return true;
        }

        if (attempts >= maxAttempts) {
          throw new Error('Quá thời gian chờ xác nhận. Vui lòng liên hệ hỗ trợ.');
        }

        return false;
      };

      // Check immediately after confirm
      const confirmed = await checkStatus();
      if (!confirmed) {
        // If not confirmed immediately, wait and check again
        setTimeout(async () => {
          try {
            await checkStatus();
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Lỗi xác nhận thanh toán');
            setPaymentStatus('failed');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Không thể xác nhận thanh toán');
      setPaymentStatus('failed');
      toast.error('Không thể xác nhận thanh toán. Vui lòng thử lại.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  // Cities array removed - now using AddressSelector with full Vietnam provinces data

  // Error Screen
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-red-600">Thanh toán thất bại</h2>
            <p className="text-muted-foreground mb-6">
              {errorMessage || 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentStatus('idle')}
                className="w-full bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft font-medium"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-muted text-foreground py-3 rounded-xl hover:bg-muted/80 transition-colors font-medium"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PayPal Redirect Screen
  if (paymentStatus === 'paypal_redirect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-3">Đang chuyển đến PayPal...</h2>
            <p className="text-muted-foreground mb-6">
              Vui lòng hoàn tất thanh toán trên trang PayPal. Bạn sẽ được chuyển về sau khi hoàn tất.
            </p>
            {paypalData?.links && (
              <div className="text-sm text-muted-foreground">
                Nếu không tự động chuyển hướng,
                <button
                  onClick={() => {
                    const link = paypalData.links?.find(l => l.rel === 'approve' || l.rel === 'payer-action');
                    if (link) window.location.href = link.href;
                  }}
                  className="text-blue-600 underline ml-1"
                >
                  nhấn vào đây
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VietQR Confirming Screen
  if (paymentStatus === 'confirming') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-amber-600">Đang xác nhận thanh toán...</h2>
            <p className="text-muted-foreground mb-4">
              Hệ thống đang kiểm tra giao dịch chuyển khoản của bạn.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Vui lòng đợi trong giây lát. Quá trình này có thể mất vài giây.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QR Code Display Screen
  if (paymentStatus === 'qr_display' && qrData) {
    const bankAccount = qrData.bankAccount || qrData.vaAccount || '0859991285';
    const bankName = qrData.bankName || 'MB Bank';
    const accountName = qrData.userBankName || 'THAI MINH QUAN';
    const amount = qrData.amount || Math.round(total).toString();
    const content = qrData.content || `AIMS ${invoiceId}`;

    // Build QR image source - handle base64 and URL formats
    let qrImageSrc: string | null = null;
    if (qrData.qrCode) {
      // qrCode is base64 encoded image
      qrImageSrc = qrData.qrCode.startsWith('data:')
        ? qrData.qrCode
        : `data:image/png;base64,${qrData.qrCode}`;
    } else if (qrData.qrLink) {
      // qrLink is a URL to the QR image
      qrImageSrc = qrData.qrLink;
    } else if (qrData.qrDataURL) {
      qrImageSrc = qrData.qrDataURL;
    }

    console.log('QR Image Source:', qrImageSrc);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Back button */}
            <button
              onClick={() => setPaymentStatus('idle')}
              className="flex items-center gap-2 text-foreground hover:text-primary-dark mb-6 group transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Quay lại</span>
            </button>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#A7C7E7] to-[#C8B6FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Thanh toán chuyển khoản</h2>
                <p className="text-muted-foreground">
                  {qrImageSrc ? 'Quét mã QR hoặc chuyển khoản thủ công' : 'Chuyển khoản theo thông tin bên dưới'}
                </p>
              </div>

              {/* QR Code Image - Smaller size */}
              {qrImageSrc && (
                <div className="bg-white border border-gray-200 rounded-lg p-2 mb-4 mx-auto" style={{ maxWidth: '300px' }}>
                  <img
                    src={qrImageSrc}
                    alt="QR Code thanh toán"
                    className="w-full h-auto"
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Bank Transfer Info - Always show */}
              <div className="bg-gradient-to-r from-[#A7C7E7]/10 to-[#C8B6FF]/10 rounded-xl p-5 mb-6">
                <h3 className="font-semibold mb-4 text-primary-dark flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thông tin chuyển khoản
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Ngân hàng:</span>
                    <span className="font-semibold">{bankName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono text-lg">{bankAccount}</span>
                      <button
                        onClick={() => copyToClipboard(bankAccount, 'số tài khoản')}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Sao chép"
                      >
                        <Copy className="w-4 h-4 text-primary-dark" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Chủ tài khoản:</span>
                    <span className="font-semibold">{accountName}</span>
                  </div>

                  <div className="border-t border-primary/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Số tiền:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xl bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                          {Number(amount).toLocaleString('vi-VN')}₫
                        </span>
                        <button
                          onClick={() => copyToClipboard(amount, 'số tiền')}
                          className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                          title="Sao chép"
                        >
                          <Copy className="w-4 h-4 text-primary-dark" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Nội dung CK:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary-dark">{content}</span>
                      <button
                        onClick={() => copyToClipboard(content, 'nội dung')}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Sao chép"
                      >
                        <Copy className="w-4 h-4 text-primary-dark" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-warning font-medium">
                  ⚠️ Vui lòng chuyển đúng số tiền và nội dung để đơn hàng được xác nhận
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVietQrPaymentComplete}
                  style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                  className="w-full py-4 rounded-xl hover:opacity-90 transition-all shadow-soft font-medium flex items-center justify-center gap-2"
                >
                  <BadgeCheck className="w-5 h-5" />
                  <span>Tôi đã chuyển khoản xong</span>
                </button>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="w-full bg-muted text-foreground py-4 rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  Hủy và quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Checkout Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2">Thanh toán</h1>
          <p className="text-muted-foreground">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Info Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
              <h2 className="mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                <Truck className="w-5 h-5 text-primary-dark" />
                Thông tin giao hàng
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-foreground font-medium mb-2">
                    Họ và tên <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Nguyễn Văn A"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-2">
                    Số điện thoại <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="0123456789"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>

                {/* Province and Address Selector with Map */}
                <AddressSelector
                  selectedProvince={shippingInfo.city}
                  detailedAddress={shippingInfo.address}
                  onProvinceChange={(province) => setShippingInfo(prev => ({ ...prev, city: province }))}
                  onAddressChange={(address) => setShippingInfo(prev => ({ ...prev, address: address }))}
                  disabled={paymentStatus === 'processing'}
                />

                <div className="md:col-span-2">
                  <label className="block text-foreground font-medium mb-2">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="email@example.com"
                    disabled={paymentStatus === 'processing'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Thông tin đơn hàng sẽ được gửi đến email này
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
              <h2 className="mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                <CreditCard className="w-5 h-5 text-primary-dark" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all group ${paymentMethod === 'vietqr'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                  } ${paymentStatus === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="vietqr"
                    checked={paymentMethod === 'vietqr'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'vietqr')}
                    className="w-5 h-5 mt-0.5 accent-primary"
                    disabled={paymentStatus === 'processing'}
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-primary-dark" />
                      <p className="font-medium text-foreground">VietQR - Chuyển khoản ngân hàng</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quét mã QR hoặc chuyển khoản thủ công
                    </p>
                  </div>
                </label>

                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all group ${paymentMethod === 'paypal'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                  } ${paymentStatus === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
                    className="w-5 h-5 mt-0.5 accent-primary"
                    disabled={paymentStatus === 'processing'}
                  />
                  <div className="ml-3 flex items-center gap-2 flex-1">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">PayPal / Thẻ quốc tế</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Thanh toán an toàn qua PayPal Sandbox
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'vietqr' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-[#A7C7E7]/10 to-[#C8B6FF]/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-primary-dark font-medium flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Bạn sẽ nhận được mã QR và thông tin chuyển khoản
                  </p>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Bạn sẽ được chuyển đến PayPal để hoàn tất thanh toán
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 sticky top-24">
              <h2 className="mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                Đơn hàng của bạn
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 font-medium mb-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {item.product.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-5 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">VAT (10%):</span>
                  <span className="font-semibold">{vat.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Phí vận chuyển:
                  </span>
                  {isCalculatingShipping ? (
                    <span className="font-semibold flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Đang tính...
                    </span>
                  ) : (
                    <span className="font-semibold">{shippingFee.toLocaleString('vi-VN')}₫</span>
                  )}
                </div>
                {subtotal > 100000 && (
                  <div className="flex items-start gap-2 p-3 bg-success/10 rounded-xl text-xs text-success border border-success/20">
                    <Tag className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Đã giảm tối đa 25.000₫ phí ship cho đơn hàng trên 100k</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-medium">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                    {total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                {paymentMethod === 'paypal' && (
                  <div className="text-xs text-muted-foreground text-right">
                    ≈ ${Math.max(1, Math.ceil(total / 24000))} USD
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <Package className="w-4 h-4" />
                  <span>Trọng lượng: {getCartWeight().toFixed(2)} kg</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={paymentStatus === 'processing'}
                  className="w-full bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white py-4 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-soft hover:shadow-soft-lg font-medium group"
                >
                  {paymentStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'vietqr' ? (
                        <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      ) : (
                        <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                      <span>
                        {paymentMethod === 'vietqr' ? 'Thanh toán VietQR' : 'Thanh toán PayPal'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  disabled={paymentStatus === 'processing'}
                  className="w-full bg-muted text-foreground py-4 rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50 font-medium"
                >
                  Quay lại giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
