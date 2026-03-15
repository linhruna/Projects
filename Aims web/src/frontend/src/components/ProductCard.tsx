import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Package, Edit } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isProductManager = currentUser?.role === 'productManager';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } else {
      toast.error('Sản phẩm hết hàng');
    }
  };

  const getProductTypeLabel = (type: string) => {
    const labels = {
      book: 'Sách',
      newspaper: 'Báo',
      cd: 'CD',
      dvd: 'DVD'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getProductTypeBadgeColor = (type: string) => {
    const colors = {
      book: 'from-blue-400 to-blue-500',
      newspaper: 'from-emerald-400 to-emerald-500',
      cd: 'from-purple-400 to-purple-500',
      dvd: 'from-pink-400 to-pink-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col h-full border border-gray-100/50">
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Type Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-gradient-to-r ${getProductTypeBadgeColor(product.type)} shadow-soft backdrop-blur-sm`}>
              {getProductTypeLabel(product.type)}
            </span>
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end justify-center pb-8">
              <div className="bg-destructive text-white px-5 py-2 rounded-xl font-medium shadow-lg">
                Hết hàng
              </div>
            </div>
          )}

          {/* Quick view overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <div className="text-white text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 mb-3 hover:text-primary-dark transition-colors min-h-[3rem] leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Chưa bao gồm VAT</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Package className="w-4 h-4" />
          <span>Còn lại: <span className={product.stock < 10 ? 'text-warning font-medium' : 'font-medium'}>{product.stock}</span></span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            to={`/product/${product.id}`}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-foreground hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group/btn"
          >
            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span className="text-sm font-medium">Chi tiết</span>
          </Link>
          {isProductManager ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/product-management?edit=${product.id}`);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white hover:from-[#B09EF0] hover:to-[#9F8FE0] transition-all flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg group/btn"
            >
              <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-sm font-medium">Chỉnh sửa</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg group/btn"
            >
              <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span className="text-sm font-medium">Thêm</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};