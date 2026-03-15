import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productApi } from '../services/api';
import { mapApiToProduct } from '../services/productMapper';
import { toast } from 'sonner';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, addToCart } = useCart();
  const navigate = useNavigate();
  const [syncedStock, setSyncedStock] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync cart items with latest stock from API
  const syncCartWithApi = async () => {
    if (cart.length === 0) return;

    setIsRefreshing(true);
    try {
      const apiProducts = await productApi.getAll();
      const productsMap = new Map(apiProducts.map(p => {
        const mapped = mapApiToProduct(p);
        return [mapped.id, mapped];
      }));

      const newSyncedStock: Record<string, number> = {};
      let hasStockChanges = false;

      cart.forEach(item => {
        const latestProduct = productsMap.get(item.product.id);
        if (latestProduct) {
          newSyncedStock[item.product.id] = latestProduct.stock;

          // Check if stock changed
          if (latestProduct.stock !== item.product.stock) {
            hasStockChanges = true;
          }

          // Auto-adjust quantity if it exceeds current stock
          if (item.quantity > latestProduct.stock && latestProduct.stock > 0) {
            updateQuantity(item.product.id, latestProduct.stock);
            toast.warning(`Số lượng "${item.product.name}" đã được điều chỉnh theo tồn kho mới`);
          } else if (latestProduct.stock === 0) {
            // Product is out of stock
            toast.error(`"${item.product.name}" đã hết hàng`);
          }
        }
      });

      setSyncedStock(newSyncedStock);

      if (hasStockChanges) {
        toast.info('Đã cập nhật tồn kho sản phẩm');
      }
    } catch (error) {
      console.error('Failed to sync cart with API:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sync on mount and when cart changes
  useEffect(() => {
    syncCartWithApi();
  }, []); // Only sync on mount

  // Get the current stock for a product (use synced value if available)
  const getCurrentStock = (productId: string, fallbackStock: number) => {
    return syncedStock[productId] !== undefined ? syncedStock[productId] : fallbackStock;
  };

  const handleQuantityChange = (productId: string, newQuantity: number, stock: number) => {
    const currentStock = getCurrentStock(productId, stock);
    if (newQuantity > currentStock) {
      toast.error(`Chỉ còn ${currentStock} sản phẩm trong kho`);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.success(`Đã xóa "${productName}" khỏi giỏ hàng`);
  };

  const subtotal = getCartTotal();
  const VAT_RATE = 0.1;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-[#A7C7E7]/20 to-[#C8B6FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="mb-3">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white px-8 py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft font-medium"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="mb-2">Giỏ hàng của bạn</h1>
            <p className="text-muted-foreground">Bạn có {cart.length} sản phẩm trong giỏ hàng</p>
          </div>
          <button
            onClick={syncCartWithApi}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Cập nhật tồn kho
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-soft-lg transition-all"
              >
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="mb-3 line-clamp-2 leading-tight">{item.product.name}</h3>
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                      Đơn giá: <span className="font-semibold text-foreground">{item.product.price.toLocaleString('vi-VN')}₫</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Còn lại: <span className={getCurrentStock(item.product.id, item.product.stock) < 10 ? 'text-warning font-medium' : 'font-medium text-foreground'}>
                          {getCurrentStock(item.product.id, item.product.stock)}
                        </span>
                        {syncedStock[item.product.id] !== undefined && syncedStock[item.product.id] !== item.product.stock && (
                          <span className="text-xs text-primary ml-1">(đã cập nhật)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col justify-between items-end gap-4">
                  <button
                    onClick={() => handleRemove(item.product.id, item.product.name)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors group"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-muted rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.quantity - 1,
                            getCurrentStock(item.product.id, item.product.stock)
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold bg-white px-3 py-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.quantity + 1,
                            getCurrentStock(item.product.id, item.product.stock)
                          )
                        }
                        disabled={item.quantity >= getCurrentStock(item.product.id, item.product.stock)}
                        className="p-2 hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Thành tiền</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>

                    {item.quantity > getCurrentStock(item.product.id, item.product.stock) && (
                      <div className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
                        <AlertCircle className="w-3 h-3" />
                        <span>Vượt quá tồn kho</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 sticky top-24">
              <h2 className="mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-xl">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-xl">
                  <span className="text-muted-foreground">VAT (10%):</span>
                  <span className="font-semibold">{vat.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-medium">Tổng cộng:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                    {total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white py-4 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft hover:shadow-soft-lg font-medium"
                >
                  Đặt hàng
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-muted text-foreground py-4 rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};