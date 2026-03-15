import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, BadgeCheck, AlertCircle, Loader2, Edit } from 'lucide-react';
import { productApi } from '../services/api';
import { mapApiToProduct } from '../services/productMapper';
import { Book, Newspaper, CD, DVD, Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isProductManager = currentUser?.role === 'productManager';

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiProduct = await productApi.getById(id);
        const mappedProduct = mapApiToProduct(apiProduct);
        setProduct(mappedProduct);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(true);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-muted-foreground mb-6">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white px-6 py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getProductTypeBadge = (type: string) => {
    const badges = {
      book: { label: 'Sách', color: 'from-blue-400 to-blue-500' },
      newspaper: { label: 'Báo', color: 'from-emerald-400 to-emerald-500' },
      cd: { label: 'CD', color: 'from-purple-400 to-purple-500' },
      dvd: { label: 'DVD', color: 'from-pink-400 to-pink-500' }
    };
    return badges[type as keyof typeof badges] || { label: type, color: 'from-gray-400 to-gray-500' };
  };

  const renderProductDetails = () => {
    switch (product.type) {
      case 'book':
        const book = product as Book;
        return (
          <div className="space-y-3">
            <DetailRow label="Tác giả" value={book.author || 'N/A'} />
            <DetailRow label="Loại bìa" value={book.coverType || 'N/A'} />
            <DetailRow label="Nhà xuất bản" value={book.publisher || 'N/A'} />
            <DetailRow label="Ngày xuất bản" value={book.publicationDate ? new Date(book.publicationDate).toLocaleDateString('vi-VN') : 'N/A'} />
            {book.pages > 0 && <DetailRow label="Số trang" value={book.pages.toString()} />}
            <DetailRow label="Ngôn ngữ" value={book.language || 'N/A'} />
            {book.genre && <DetailRow label="Thể loại" value={book.genre} />}
          </div>
        );

      case 'newspaper':
        const newspaper = product as Newspaper;
        return (
          <div className="space-y-3">
            {newspaper.editor && <DetailRow label="Tổng biên tập" value={newspaper.editor} />}
            <DetailRow label="Nhà xuất bản" value={newspaper.publisher || 'N/A'} />
            <DetailRow label="Ngày xuất bản" value={newspaper.publicationDate ? new Date(newspaper.publicationDate).toLocaleDateString('vi-VN') : 'N/A'} />
            <DetailRow label="Số phát hành" value={newspaper.issueNumber || 'N/A'} />
            {newspaper.frequency && <DetailRow label="Tần suất" value={newspaper.frequency} />}
            {newspaper.issn && <DetailRow label="ISSN" value={newspaper.issn} />}
            <DetailRow label="Ngôn ngữ" value={newspaper.language || 'N/A'} />
            {newspaper.sections && newspaper.sections.length > 0 && (
              <DetailRow
                label="Các mục"
                value={newspaper.sections.join(', ')}
              />
            )}
          </div>
        );

      case 'cd':
        const cd = product as CD;
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <DetailRow label="Nghệ sĩ" value={cd.artist || 'N/A'} />
              <DetailRow label="Hãng thu" value={cd.recordLabel || 'N/A'} />
              <DetailRow label="Thể loại" value={cd.genre || 'N/A'} />
              <DetailRow label="Ngày phát hành" value={cd.releaseDate ? new Date(cd.releaseDate).toLocaleDateString('vi-VN') : 'N/A'} />
            </div>
            {cd.tracks && cd.tracks.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Danh sách track:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cd.tracks.map((track, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-muted/50 p-3 rounded-xl hover:bg-muted transition-colors">
                      <span className="text-foreground">{index + 1}. {track.name}</span>
                      <span className="text-muted-foreground font-medium">{track.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'dvd':
        const dvd = product as DVD;
        return (
          <div className="space-y-3">
            <DetailRow label="Loại đĩa" value={dvd.discType || 'DVD'} />
            <DetailRow label="Đạo diễn" value={dvd.director || 'N/A'} />
            {dvd.runtime > 0 && <DetailRow label="Thời lượng" value={`${dvd.runtime} phút`} />}
            <DetailRow label="Studio" value={dvd.studio || 'N/A'} />
            {dvd.language && <DetailRow label="Ngôn ngữ" value={dvd.language} />}
            {dvd.subtitles && dvd.subtitles.length > 0 && <DetailRow label="Phụ đề" value={dvd.subtitles.join(', ')} />}
            <DetailRow label="Ngày phát hành" value={dvd.releaseDate ? new Date(dvd.releaseDate).toLocaleDateString('vi-VN') : 'N/A'} />
            {dvd.genre && <DetailRow label="Thể loại" value={dvd.genre} />}
          </div>
        );

      default:
        return null;
    }
  };

  const typeBadge = getProductTypeBadge(product.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-foreground hover:text-primary-dark mb-8 group transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-8">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto max-h-[600px] object-contain rounded-xl"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${typeBadge.color} shadow-soft`}>
                  {typeBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
              <h1 className="mb-4 leading-tight">{product.name}</h1>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="text-sm text-muted-foreground">(chưa VAT)</span>
                </div>

                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <>
                      <BadgeCheck className="w-5 h-5 text-success" />
                      <span className="text-sm text-success font-medium">
                        Còn {product.stock} sản phẩm
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-sm text-destructive font-medium">
                        Hết hàng
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
                <h3 className="mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                  Mô tả
                </h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                Chi tiết sản phẩm
              </h3>
              {renderProductDetails()}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6">
              <label className="block text-foreground font-medium mb-3">Số lượng</label>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center bg-muted rounded-xl overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-5 py-3 hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-8 py-3 bg-white font-semibold min-w-[80px] text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="px-5 py-3 hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {quantity >= product.stock && product.stock > 0 && (
                  <span className="text-sm text-warning font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Đã đạt số lượng tối đa
                  </span>
                )}
              </div>

              {isProductManager ? (
                <button
                  onClick={() => navigate(`/product-management?edit=${product.id}`)}
                  className="w-full bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white py-4 rounded-xl hover:from-[#B09EF0] hover:to-[#9F8FE0] transition-all flex items-center justify-center gap-3 shadow-soft hover:shadow-soft-lg font-medium group"
                >
                  <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Chỉnh sửa sản phẩm</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white py-4 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-soft hover:shadow-soft-lg font-medium group"
                >
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Thêm vào giỏ hàng</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex text-sm py-2">
    <span className="text-muted-foreground min-w-[140px]">{label}:</span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);
