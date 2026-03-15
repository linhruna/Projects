import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, History, X, Package, Book as BookIcon, Newspaper as NewspaperIcon, Disc, Film, Loader2, LogIn, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { productApi, productHistoryApi, authApi, getAuthToken, mediaApi } from '../services/api';
import { mapApiToProduct, mapProductToApi } from '../services/productMapper';
import { Product, ProductHistory, Book, Newspaper, CD, DVD, ProductType } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export const ProductManagementPage: React.FC = () => {
  const { currentUser, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<ProductType | ''>('');
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('');

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check if user is authenticated with a real token
  const isAuthenticated = !!getAuthToken();

  // Ref for scrolling to form
  const formRef = useRef<HTMLDivElement>(null);

  // Track if we've processed the edit param
  const editParamProcessed = useRef(false);

  // Fetch products and history from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const apiProducts = await productApi.getAll();
        const mappedProducts = apiProducts.map(mapApiToProduct);
        setProducts(mappedProducts);

        // Fetch history
        try {
          const historyData = await productHistoryApi.getAll();
          const mappedHistory: ProductHistory[] = historyData.map(h => ({
            id: h.id,
            productId: h.productId,
            productName: h.productName,
            action: h.action.toLowerCase() as ProductHistory['action'],
            timestamp: h.timestamp,
            user: h.userName
          }));
          setProductHistory(mappedHistory);
        } catch (historyError) {
          console.error('Failed to fetch history:', historyError);
          // Continue without history
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle edit query parameter from URL (when navigating from mainpage/detailpage)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && products.length > 0 && !editParamProcessed.current) {
      editParamProcessed.current = true;

      const productToEdit = products.find(p => p.id === editId);
      if (productToEdit) {
        // Auto-open the edit form for this product
        setEditingProduct({ ...productToEdit });
        setSelectedType(productToEdit.type);
        setIsCreating(false);
        setShowForm(true);

        // Clear the URL parameter
        setSearchParams({}, { replace: true });

        // Scroll to form after a short delay
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        toast.info(`Đang chỉnh sửa sản phẩm: ${productToEdit.name}`);
      } else {
        toast.error('Không tìm thấy sản phẩm để chỉnh sửa');
        setSearchParams({}, { replace: true });
      }
    }
  }, [products, searchParams, setSearchParams]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        setShowLoginModal(false);
        setLoginEmail('');
        setLoginPassword('');
        toast.success('Đăng nhập thành công! Bạn có thể quản lý sản phẩm.');
      }
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Check authentication before performing CRUD operations
  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    action();
  };

  const handleDeactivate = (product: Product) => {
    requireAuth(async () => {
      if (product.stock > 0) {
        try {
          // Only set isActive to false, keep the original stock quantity
          const updatedProduct = { ...product, isActive: false };
          const apiRequest = mapProductToApi(updatedProduct);
          await productApi.update(product.id, apiRequest);

          setProducts(products.map(p =>
            p.id === product.id ? { ...p, isActive: false } : p
          ));
          await addHistory(product.id, product.name, 'deactivate');
          toast.success(`Đã chuyển "${product.name}" sang trạng thái deactivated`);
        } catch (error) {
          console.error('Failed to deactivate product:', error);
          toast.error('Không thể deactivate sản phẩm. Vui lòng đăng nhập lại.');
        }
      } else {
        toast.error('Không thể deactivate sản phẩm có tồn kho = 0');
      }
    });
  };

  const handleDelete = (product: Product) => {
    requireAuth(async () => {
      if (product.stock === 0) {
        try {
          await productApi.delete(product.id);
          setProducts(products.filter(p => p.id !== product.id));
          await addHistory(product.id, product.name, 'delete');
          toast.success(`Đã xóa sản phẩm "${product.name}"`);
        } catch (error) {
          console.error('Failed to delete product:', error);
          toast.error('Không thể xóa sản phẩm. Vui lòng đăng nhập lại.');
        }
      } else {
        toast.error('Chỉ có thể xóa sản phẩm khi tồn kho = 0');
      }
    });
  };

  const handleActivate = (product: Product) => {
    requireAuth(async () => {
      try {
        const updatedProduct = { ...product, isActive: true };
        const apiRequest = mapProductToApi(updatedProduct);
        await productApi.update(product.id, apiRequest);

        setProducts(products.map(p =>
          p.id === product.id ? { ...p, isActive: true } : p
        ));
        toast.success(`Đã kích hoạt lại "${product.name}"`);
      } catch (error) {
        console.error('Failed to activate product:', error);
        toast.error('Không thể kích hoạt sản phẩm. Vui lòng đăng nhập lại.');
      }
    });
  };

  const addHistory = async (productId: string, productName: string, action: ProductHistory['action'], details?: string) => {
    try {
      const userName = currentUser?.name || 'Product Manager';
      const response = await productHistoryApi.create({
        productId,
        productName,
        action: action.toUpperCase(),
        userName,
        details,
      });

      // Add to local state with proper mapping
      const newHistory: ProductHistory = {
        id: response.id,
        productId: response.productId,
        productName: response.productName,
        action: response.action.toLowerCase() as ProductHistory['action'],
        timestamp: response.timestamp,
        user: response.userName
      };
      setProductHistory([newHistory, ...productHistory]);
    } catch (error) {
      console.error('Failed to save history:', error);
      // Still add to local state as fallback
      const newHistory: ProductHistory = {
        id: Date.now().toString(),
        productId,
        productName,
        action,
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'Product Manager'
      };
      setProductHistory([newHistory, ...productHistory]);
    }
  };

  const handleCreateNew = () => {
    requireAuth(() => {
      setSelectedType('');
      setEditingProduct(null);
      setIsCreating(true);
      setShowForm(true);

      // Scroll to form after state update
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  };

  const handleTypeSelect = (type: ProductType) => {
    setSelectedType(type);
    const baseProduct = {
      id: Date.now().toString(),
      name: '',
      originalValue: 0,
      price: 0,
      type,
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
      stock: 0,
      weight: 0,
      description: '',
      isActive: true
    };

    switch (type) {
      case 'book':
        setEditingProduct({
          ...baseProduct,
          type: 'book',
          author: '',
          coverType: 'Bìa mềm',
          publisher: '',
          publicationDate: new Date().toISOString().split('T')[0],
          pages: 0,
          language: 'Tiếng Việt',
          genre: ''
        } as Book);
        break;
      case 'newspaper':
        setEditingProduct({
          ...baseProduct,
          type: 'newspaper',
          editor: '',
          publisher: '',
          publicationDate: new Date().toISOString().split('T')[0],
          issueNumber: '',
          frequency: 'Hàng tuần',
          issn: '',
          language: 'Tiếng Việt',
          sections: []
        } as Newspaper);
        break;
      case 'cd':
        setEditingProduct({
          ...baseProduct,
          type: 'cd',
          artist: '',
          recordLabel: '',
          tracks: [],
          genre: '',
          releaseDate: new Date().toISOString().split('T')[0]
        } as CD);
        break;
      case 'dvd':
        setEditingProduct({
          ...baseProduct,
          type: 'dvd',
          discType: 'DVD',
          director: '',
          runtime: 0,
          studio: '',
          language: 'Tiếng Việt',
          subtitles: [],
          releaseDate: new Date().toISOString().split('T')[0],
          genre: ''
        } as DVD);
        break;
    }
  };

  const handleEditClick = (product: Product) => {
    requireAuth(() => {
      setEditingProduct({ ...product });
      setSelectedType(product.type);
      setIsCreating(false);
      setShowForm(true);

      // Scroll to form after state update
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    // Common validation
    if (!editingProduct.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!editingProduct.price || editingProduct.price <= 0) {
      toast.error('Giá phải lớn hơn 0');
      return;
    }

    // For new products, originalValue will be set to price
    // For existing products, validate price is between 30% and 150% of original value
    let productToSave = { ...editingProduct };

    if (isCreating) {
      // Set original value to the first price when creating
      productToSave.originalValue = editingProduct.price;
    } else {
      // Validate price range for existing products
      const originalValue = editingProduct.originalValue || editingProduct.price;
      const minPrice = Math.round(originalValue * 0.30);
      const maxPrice = Math.round(originalValue * 1.50);
      if (editingProduct.price < minPrice || editingProduct.price > maxPrice) {
        toast.error(`Giá phải từ 30% đến 150% giá gốc (${minPrice.toLocaleString('vi-VN')}₫ - ${maxPrice.toLocaleString('vi-VN')}₫)`);
        return;
      }
    }

    if (editingProduct.stock < 0) {
      toast.error('Số lượng tồn kho không được âm');
      return;
    }
    if (editingProduct.weight <= 0) {
      toast.error('Trọng lượng phải lớn hơn 0');
      return;
    }

    // Type-specific validation
    switch (editingProduct.type) {
      case 'book':
        const book = editingProduct as Book;
        if (!book.author.trim()) {
          toast.error('Vui lòng nhập tác giả');
          return;
        }
        if (book.pages <= 0) {
          toast.error('Số trang phải lớn hơn 0');
          return;
        }
        break;
      case 'newspaper':
        const newspaper = editingProduct as Newspaper;
        if (!newspaper.editor.trim()) {
          toast.error('Vui lòng nhập tổng biên tập');
          return;
        }
        if (!newspaper.issueNumber.trim()) {
          toast.error('Vui lòng nhập số phát hành');
          return;
        }
        break;
      case 'cd':
        const cd = editingProduct as CD;
        if (!cd.artist.trim()) {
          toast.error('Vui lòng nhập nghệ sĩ');
          return;
        }
        if (cd.tracks.length === 0) {
          toast.error('Vui lòng thêm ít nhất một track');
          return;
        }
        break;
      case 'dvd':
        const dvd = editingProduct as DVD;
        if (!dvd.director.trim()) {
          toast.error('Vui lòng nhập đạo diễn');
          return;
        }
        if (dvd.runtime <= 0) {
          toast.error('Thời lượng phải lớn hơn 0');
          return;
        }
        break;
    }

    try {
      setSaving(true);
      const apiRequest = mapProductToApi(productToSave);

      if (isCreating) {
        const createdProduct = await productApi.create(apiRequest);
        const mappedProduct = mapApiToProduct(createdProduct);
        setProducts([...products, mappedProduct]);
        await addHistory(mappedProduct.id, mappedProduct.name, 'add');
        toast.success(`Đã thêm sản phẩm "${mappedProduct.name}"`);
      } else {
        await productApi.update(productToSave.id, apiRequest);
        setProducts(products.map(p =>
          p.id === productToSave.id ? productToSave : p
        ));
        await addHistory(productToSave.id, productToSave.name, 'edit');
        toast.success('Đã cập nhật sản phẩm');
      }

      setShowForm(false);
      setEditingProduct(null);
      setIsCreating(false);
      setSelectedType('');
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(isCreating ? 'Không thể thêm sản phẩm' : 'Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const getActionBadge = (action: ProductHistory['action']) => {
    const config = {
      add: { label: 'Thêm mới', color: 'from-emerald-400 to-emerald-500' },
      edit: { label: 'Chỉnh sửa', color: 'from-blue-400 to-blue-500' },
      delete: { label: 'Xóa', color: 'from-red-400 to-red-500' },
      deactivate: { label: 'Vô hiệu hóa', color: 'from-orange-400 to-orange-500' }
    };
    return config[action];
  };

  const updateField = (field: string, value: any) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    }
  };

  // Helper to handle number input value display (show empty string for 0)
  const getNumberInputValue = (value: number | undefined): string => {
    if (value === undefined || value === 0) return '';
    return String(value);
  };

  // Helper to handle number input change
  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    updateField(field, numValue);
  };

  // Calculate valid price range based on original value (only for editing existing products)
  const getValidPriceRange = () => {
    // Only show price range when editing existing products (not creating new ones)
    if (isCreating) return null;
    const originalValue = editingProduct?.originalValue || 0;
    if (originalValue <= 0) return null;
    return {
      min: Math.round(originalValue * 0.30),
      max: Math.round(originalValue * 1.50),
    };
  };

  const priceRange = getValidPriceRange();
  const isPriceValid = () => {
    if (!priceRange || !editingProduct?.price) return true;
    return editingProduct.price >= priceRange.min && editingProduct.price <= priceRange.max;
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await mediaApi.upload(file);
      updateField('image', response.secureUrl);
      toast.success('Tải hình ảnh thành công!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Không thể tải hình ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const renderCommonFields = () => (
    <>
      <div>
        <label className="block text-foreground font-medium mb-2">Tên sản phẩm *</label>
        <input
          type="text"
          value={editingProduct?.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          placeholder="Nhập tên sản phẩm"
        />
      </div>
      <div>
        <label className="block text-foreground font-medium mb-2">Giá (VNĐ) *</label>
        <input
          type="number"
          value={getNumberInputValue(editingProduct?.price)}
          onChange={(e) => handleNumberChange('price', e.target.value)}
          className={`w-full px-4 py-3 bg-muted/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${priceRange && !isPriceValid() ? 'border-destructive' : 'border-transparent'
            }`}
          placeholder="0"
          min="0"
        />
        {priceRange ? (
          <p className={`text-xs mt-1 ${isPriceValid() ? 'text-muted-foreground' : 'text-destructive'}`}>
            Giá gốc: {editingProduct?.originalValue?.toLocaleString('vi-VN')}₫ | Giá cho phép: {priceRange.min.toLocaleString('vi-VN')}₫ - {priceRange.max.toLocaleString('vi-VN')}₫ (30%-150%)
          </p>
        ) : isCreating && (
          <p className="text-xs text-muted-foreground mt-1">Giá này sẽ là giá gốc của sản phẩm</p>
        )}
      </div>
      <div>
        <label className="block text-foreground font-medium mb-2">Số lượng *</label>
        <input
          type="number"
          value={getNumberInputValue(editingProduct?.stock)}
          onChange={(e) => handleNumberChange('stock', e.target.value)}
          className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          placeholder="0"
          min="0"
        />
      </div>
      <div>
        <label className="block text-foreground font-medium mb-2">Trọng lượng (kg) *</label>
        <input
          type="number"
          step="0.1"
          value={getNumberInputValue(editingProduct?.weight)}
          onChange={(e) => handleNumberChange('weight', e.target.value)}
          className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          placeholder="0.0"
          min="0"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-foreground font-medium mb-2">Mô tả</label>
        <textarea
          value={editingProduct?.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          placeholder="Nhập mô tả sản phẩm"
          rows={3}
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-foreground font-medium mb-2">Hình ảnh sản phẩm</label>
        <div className="flex flex-col gap-4">
          {/* Image Preview and Upload Button Row */}
          <div className="flex items-start gap-4">
            {/* Image Preview */}
            {editingProduct?.image && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-muted flex-shrink-0">
                <img
                  src={editingProduct.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => updateField('image', '')}
                  className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Upload Button - Always visible */}
            <div className="flex flex-col gap-2">
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                  color: 'white',
                  borderRadius: '12px',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  opacity: uploadingImage ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Chọn ảnh từ máy tính
                  </>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-muted-foreground">
                PNG, JPG, WEBP (tối đa 5MB)
              </span>
            </div>
          </div>

          {/* Alternative: URL Input */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Hoặc nhập URL hình ảnh:</span>
            <input
              type="text"
              value={editingProduct?.image || ''}
              onChange={(e) => updateField('image', e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderBookFields = () => {
    const book = editingProduct as Book;

    const languages = [
      'Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Tây Ban Nha',
      'Tiếng Bồ Đào Nha', 'Tiếng Ý', 'Tiếng Nga', 'Tiếng Trung', 'Tiếng Nhật',
      'Tiếng Hàn', 'Tiếng Ả Rập', 'Tiếng Hindi', 'Tiếng Thái', 'Tiếng Indonesia'
    ];

    const genres = [
      'Văn học', 'Tiểu thuyết', 'Khoa học', 'Lịch sử', 'Triết học', 'Kinh tế',
      'Tâm lý học', 'Tự lực', 'Thiếu nhi', 'Giáo dục', 'Y học', 'Công nghệ',
      'Nghệ thuật', 'Nấu ăn', 'Du lịch', 'Thể thao', 'Tôn giáo', 'Hồi ký',
      'Truyện tranh', 'Khác'
    ];

    return (
      <>
        <div>
          <label className="block text-foreground font-medium mb-2">Tác giả *</label>
          <input
            type="text"
            value={book.author}
            onChange={(e) => updateField('author', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên tác giả"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Loại bìa</label>
          <select
            value={book.coverType}
            onChange={(e) => updateField('coverType', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="Bìa mềm">Bìa mềm</option>
            <option value="Bìa cứng">Bìa cứng</option>
          </select>
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Nhà xuất bản</label>
          <input
            type="text"
            value={book.publisher}
            onChange={(e) => updateField('publisher', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên nhà xuất bản"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngày xuất bản</label>
          <input
            type="date"
            value={book.publicationDate}
            onChange={(e) => updateField('publicationDate', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Số trang *</label>
          <input
            type="number"
            value={getNumberInputValue(book.pages)}
            onChange={(e) => handleNumberChange('pages', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="0"
            min="0"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngôn ngữ</label>
          <select
            value={book.language}
            onChange={(e) => updateField('language', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Thể loại</label>
          <select
            value={book.genre}
            onChange={(e) => updateField('genre', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">-- Chọn thể loại --</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </>
    );
  };

  const renderNewspaperFields = () => {
    const newspaper = editingProduct as Newspaper;

    const languages = [
      'Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Tây Ban Nha',
      'Tiếng Bồ Đào Nha', 'Tiếng Ý', 'Tiếng Nga', 'Tiếng Trung', 'Tiếng Nhật',
      'Tiếng Hàn', 'Tiếng Ả Rập', 'Tiếng Hindi', 'Tiếng Thái', 'Tiếng Indonesia'
    ];

    const sectionOptions = [
      'Thời sự', 'Kinh tế', 'Văn hóa', 'Xã hội', 'Thể thao', 'Giải trí',
      'Khoa học', 'Công nghệ', 'Giáo dục', 'Sức khỏe', 'Pháp luật',
      'Quốc tế', 'Đời sống', 'Du lịch', 'Bất động sản', 'Chứng khoán'
    ];

    const toggleSection = (section: string) => {
      const current = newspaper.sections || [];
      if (current.includes(section)) {
        updateField('sections', current.filter(s => s !== section));
      } else {
        updateField('sections', [...current, section]);
      }
    };

    return (
      <>
        <div>
          <label className="block text-foreground font-medium mb-2">Tổng biên tập *</label>
          <input
            type="text"
            value={newspaper.editor}
            onChange={(e) => updateField('editor', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên tổng biên tập"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Nhà xuất bản</label>
          <input
            type="text"
            value={newspaper.publisher}
            onChange={(e) => updateField('publisher', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên nhà xuất bản"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngày xuất bản</label>
          <input
            type="date"
            value={newspaper.publicationDate}
            onChange={(e) => updateField('publicationDate', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Số phát hành *</label>
          <input
            type="text"
            value={newspaper.issueNumber}
            onChange={(e) => updateField('issueNumber', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Số 123"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Tần suất</label>
          <select
            value={newspaper.frequency}
            onChange={(e) => updateField('frequency', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="Hàng ngày">Hàng ngày</option>
            <option value="Hàng tuần">Hàng tuần</option>
            <option value="Hàng tháng">Hàng tháng</option>
          </select>
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">ISSN</label>
          <input
            type="text"
            value={newspaper.issn}
            onChange={(e) => updateField('issn', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="XXXX-XXXX"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngôn ngữ</label>
          <select
            value={newspaper.language}
            onChange={(e) => updateField('language', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-foreground font-medium mb-2">Các mục</label>
          <div className="flex flex-wrap gap-2">
            {sectionOptions.map(section => (
              <button
                key={section}
                type="button"
                onClick={() => toggleSection(section)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${newspaper.sections?.includes(section)
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-muted/50 text-foreground hover:bg-muted'
                  }`}
              >
                {section}
              </button>
            ))}
          </div>
          {newspaper.sections?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">Đã chọn: {newspaper.sections.join(', ')}</p>
          )}
        </div>
      </>
    );
  };

  const addTrack = () => {
    if (editingProduct && editingProduct.type === 'cd') {
      const cd = editingProduct as CD;
      if (newTrackName && newTrackDuration) {
        updateField('tracks', [...cd.tracks, { name: newTrackName, duration: newTrackDuration }]);
        setNewTrackName('');
        setNewTrackDuration('');
      }
    }
  };

  const removeTrack = (index: number) => {
    if (editingProduct && editingProduct.type === 'cd') {
      const cd = editingProduct as CD;
      updateField('tracks', cd.tracks.filter((_, i) => i !== index));
    }
  };

  const renderCDFields = () => {
    const cd = editingProduct as CD;

    const musicGenres = [
      'Pop', 'Rock', 'Jazz', 'Classical', 'Hip Hop', 'R&B', 'Country',
      'Electronic', 'Blues', 'Reggae', 'Metal', 'Folk', 'Soul', 'Funk',
      'Indie', 'K-Pop', 'V-Pop', 'World Music', 'Soundtrack', 'Khác'
    ];

    return (
      <>
        <div>
          <label className="block text-foreground font-medium mb-2">Nghệ sĩ *</label>
          <input
            type="text"
            value={cd.artist}
            onChange={(e) => updateField('artist', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên nghệ sĩ"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Hãng thu</label>
          <input
            type="text"
            value={cd.recordLabel}
            onChange={(e) => updateField('recordLabel', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên hãng thu"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Thể loại</label>
          <select
            value={cd.genre}
            onChange={(e) => updateField('genre', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">-- Chọn thể loại --</option>
            {musicGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngày phát hành</label>
          <input
            type="date"
            value={cd.releaseDate}
            onChange={(e) => updateField('releaseDate', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-foreground font-medium mb-2">Danh sách track *</label>
          <div className="space-y-3">
            {cd.tracks.map((track, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <span className="flex-1 font-medium">{index + 1}. {track.name}</span>
                <span className="text-muted-foreground">{track.duration}</span>
                <button
                  onClick={() => removeTrack(index)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-3">
              <input
                type="text"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                className="flex-1 px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="Tên track"
              />
              <input
                type="text"
                value={newTrackDuration}
                onChange={(e) => setNewTrackDuration(e.target.value)}
                className="w-24 px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="3:45"
              />
              <button
                onClick={addTrack}
                className="px-4 py-3 bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all font-medium"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderDVDFields = () => {
    const dvd = editingProduct as DVD;

    const languages = [
      'Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Tây Ban Nha',
      'Tiếng Bồ Đào Nha', 'Tiếng Ý', 'Tiếng Nga', 'Tiếng Trung', 'Tiếng Nhật',
      'Tiếng Hàn', 'Tiếng Ả Rập', 'Tiếng Hindi', 'Tiếng Thái', 'Tiếng Indonesia'
    ];

    const filmGenres = [
      'Hành động', 'Tâm lý', 'Hài kịch', 'Kinh dị', 'Tình cảm', 'Khoa học viễn tưởng',
      'Hoạt hình', 'Tài liệu', 'Chiến tranh', 'Phát triển', 'Gia đình', 'Thiếu nhi',
      'Thể thao', 'Nhạc kịch', 'Lịch sử', 'Trinh thám', 'Khác'
    ];

    const subtitleOptions = [
      'Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp', 'Tiếng Đức', 'Tiếng Tây Ban Nha',
      'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Thái', 'Tiếng Indonesia'
    ];

    const toggleSubtitle = (subtitle: string) => {
      const current = dvd.subtitles || [];
      if (current.includes(subtitle)) {
        updateField('subtitles', current.filter(s => s !== subtitle));
      } else {
        updateField('subtitles', [...current, subtitle]);
      }
    };

    return (
      <>
        <div>
          <label className="block text-foreground font-medium mb-2">Loại đĩa</label>
          <select
            value={dvd.discType}
            onChange={(e) => updateField('discType', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="DVD">DVD</option>
            <option value="Blu-ray">Blu-ray</option>
          </select>
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Đạo diễn *</label>
          <input
            type="text"
            value={dvd.director}
            onChange={(e) => updateField('director', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên đạo diễn"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Thời lượng (phút) *</label>
          <input
            type="number"
            value={getNumberInputValue(dvd.runtime)}
            onChange={(e) => handleNumberChange('runtime', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="120"
            min="0"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Studio</label>
          <input
            type="text"
            value={dvd.studio}
            onChange={(e) => updateField('studio', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            placeholder="Tên studio"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngôn ngữ</label>
          <select
            value={dvd.language}
            onChange={(e) => updateField('language', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Ngày phát hành</label>
          <input
            type="date"
            value={dvd.releaseDate}
            onChange={(e) => updateField('releaseDate', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-foreground font-medium mb-2">Thể loại</label>
          <select
            value={dvd.genre}
            onChange={(e) => updateField('genre', e.target.value)}
            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">-- Chọn thể loại --</option>
            {filmGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-foreground font-medium mb-2">Phụ đề</label>
          <div className="flex flex-wrap gap-2">
            {subtitleOptions.map(subtitle => (
              <button
                key={subtitle}
                type="button"
                onClick={() => toggleSubtitle(subtitle)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${dvd.subtitles?.includes(subtitle)
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-muted/50 text-foreground hover:bg-muted'
                  }`}
              >
                {subtitle}
              </button>
            ))}
          </div>
          {dvd.subtitles?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">Đã chọn: {dvd.subtitles.join(', ')}</p>
          )}
        </div>
      </>
    );
  };

  const typeOptions = [
    { value: 'book', label: 'Sách', icon: BookIcon, color: 'from-blue-400 to-blue-500' },
    { value: 'newspaper', label: 'Báo', icon: NewspaperIcon, color: 'from-emerald-400 to-emerald-500' },
    { value: 'cd', label: 'CD', icon: Disc, color: 'from-purple-400 to-purple-500' },
    { value: 'dvd', label: 'DVD', icon: Film, color: 'from-pink-400 to-pink-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#A7C7E7] to-[#C8B6FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Đăng nhập để quản lý sản phẩm</h2>
              <p className="text-muted-foreground text-sm">
                Bạn cần đăng nhập với tài khoản Product Manager để thực hiện thao tác này.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="pm@aims.com"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">💡 Tài khoản test:</p>
                <p className="text-blue-600">Email: <code className="bg-blue-100 px-1 rounded">pm@aims.com</code></p>
                <p className="text-blue-600">Mật khẩu: <code className="bg-blue-100 px-1 rounded">123456</code></p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Auth Warning Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Chế độ xem chỉ đọc</p>
                <p className="text-sm text-amber-600">
                  Bạn cần <button onClick={() => setShowLoginModal(true)} className="underline font-medium hover:text-amber-800">đăng nhập</button> để thêm, sửa hoặc xóa sản phẩm.
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="mb-2">Quản lý sản phẩm</h1>
            <p className="text-muted-foreground">Thêm, sửa, xóa và quản lý trạng thái sản phẩm</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all shadow-soft font-medium ${showHistory
                ? 'bg-gradient-to-r from-[#C8B6FF] to-[#B09EF0] text-white'
                : 'bg-white text-foreground hover:bg-muted border border-gray-200'
                }`}
            >
              <History className="w-5 h-5" />
              <span>Lịch sử</span>
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white px-4 py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
                Lịch sử thao tác
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {productHistory.map((history) => {
                const badge = getActionBadge(history.action);
                return (
                  <div
                    key={history.id}
                    className="flex justify-between items-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${badge.color}`}>
                          {badge.label}
                        </span>
                        <p className="font-medium">{history.productName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Bởi {history.user} • {new Date(history.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {productHistory.length === 0 && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Chưa có lịch sử thao tác</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} className="bg-white rounded-2xl shadow-soft border border-gray-100/50 p-6 mb-6">
            <h2 className="mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#A7C7E7] to-[#C8B6FF] rounded-full"></div>
              {isCreating ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
            </h2>

            {/* Type Selection for Creating */}
            {isCreating && !selectedType && (
              <div>
                <label className="block text-foreground font-medium mb-4">Chọn loại sản phẩm *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {typeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleTypeSelect(option.value as ProductType)}
                        className="p-6 border-2 border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group text-center"
                      >
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-medium text-foreground">{option.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Form */}
            {((isCreating && selectedType) || !isCreating) && editingProduct && (
              <>
                <div className="mb-6 p-4 bg-gradient-to-r from-[#A7C7E7]/10 to-[#C8B6FF]/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    {typeOptions.find(t => t.value === editingProduct.type) && (
                      <>
                        {React.createElement(typeOptions.find(t => t.value === editingProduct.type)!.icon, {
                          className: 'w-5 h-5 text-primary-dark'
                        })}
                        <span className="font-medium text-primary-dark">
                          Loại sản phẩm: {typeOptions.find(t => t.value === editingProduct.type)?.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {renderCommonFields()}
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Thông tin chi tiết</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {editingProduct.type === 'book' && renderBookFields()}
                    {editingProduct.type === 'newspaper' && renderNewspaperFields()}
                    {editingProduct.type === 'cd' && renderCDFields()}
                    {editingProduct.type === 'dvd' && renderDVDFields()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-[#A7C7E7] to-[#7EA8D1] text-white px-6 py-3 rounded-xl hover:from-[#7EA8D1] hover:to-[#6A95BD] transition-all shadow-soft font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCreating ? 'Thêm sản phẩm' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setIsCreating(false);
                      setSelectedType('');
                    }}
                    className="bg-muted text-foreground px-6 py-3 rounded-xl hover:bg-muted/80 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/50 to-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className={`${!product.isActive ? 'bg-muted/20' : ''} hover:bg-muted/30 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl"
                        />
                        <div>
                          <div className="text-sm font-medium line-clamp-2 max-w-xs">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground uppercase">
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold bg-gradient-to-r from-[#7EA8D1] to-[#B09EF0] bg-clip-text text-transparent">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className={`text-sm font-medium ${product.stock < 10 ? 'text-warning' : 'text-foreground'}`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs font-medium rounded-xl ${product.isActive
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                          }`}
                      >
                        {product.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {product.isActive ? (
                          <button
                            onClick={() => handleDeactivate(product)}
                            className="p-2 text-warning hover:bg-warning/10 rounded-lg transition-colors"
                            title="Vô hiệu hóa"
                          >
                            <EyeOff className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(product)}
                            className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                            title="Kích hoạt"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={product.stock > 0}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={product.stock > 0 ? 'Chỉ xóa khi tồn kho = 0' : 'Xóa'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
