import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, X, Sparkles, Loader2, BadgeCheck } from 'lucide-react';
import { productApi } from '../services/api';
import { mapApiToProduct } from '../services/productMapper';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductType } from '../types';
import { toast } from 'sonner';

export const HomePage: React.FC = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Check for payment success from navigation state
  useEffect(() => {
    const state = location.state as { paymentSuccess?: boolean; paymentMethod?: string } | null;
    if (state?.paymentSuccess) {
      setShowSuccessBanner(true);
      toast.success(`🎉 Đơn hàng của bạn đã được xác nhận!`, {
        duration: 5000,
        description: `Thanh toán qua ${state.paymentMethod || 'thành công'}. Cảm ơn bạn đã mua hàng!`,
      });

      // Clear the state after showing
      window.history.replaceState({}, document.title);

      // Hide banner after 8 seconds
      setTimeout(() => setShowSuccessBanner(false), 8000);
    }
  }, [location.state]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiProducts = await productApi.getAll();
        const mappedProducts = apiProducts.map(mapApiToProduct);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.isActive);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        if (max) {
          return p.price >= min && p.price < max;
        } else {
          return p.price >= min;
        }
      });
    }

    return filtered;
  }, [products, searchQuery, selectedType, priceRange]);

  const priceRanges = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Dưới 100k', value: '0-100000' },
    { label: '100k - 200k', value: '100000-200000' },
    { label: '200k - 300k', value: '200000-300000' },
    { label: 'Trên 300k', value: '300000' }
  ];

  const productTypes = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Sách', value: 'book' },
    { label: 'Báo', value: 'newspaper' },
    { label: 'CD', value: 'cd' },
    { label: 'DVD', value: 'dvd' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <BadgeCheck className="w-6 h-6" />
              <span className="font-medium">
                🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại AIMS Store.
              </span>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="ml-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#A7C7E7]/20 via-white to-[#C8B6FF]/20 border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 gradient-blend rounded-2xl flex items-center justify-center shadow-soft">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
              Chào mừng đến AIMS Store
            </h1>
            <p className="text-lg text-muted-foreground">
              Khám phá bộ sưu tập media phong phú với sách, báo, CD và DVD chất lượng cao
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 px-4 py-3 rounded-xl mb-4 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Bộ lọc</span>
          </button>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Loại sản phẩm</label>
                <div className="flex flex-wrap gap-2">
                  {productTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value as ProductType | 'all')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedType === type.value
                        ? 'bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white shadow-soft'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Khoảng giá</label>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${priceRange === range.value
                        ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white shadow-soft'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <span className="font-semibold text-foreground">{filteredProducts.length}</span> sản phẩm
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
          </div>
        )}
      </div>
    </div>
  );
};
