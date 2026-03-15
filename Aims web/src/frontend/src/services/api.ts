// API Service Layer - Connects Frontend to Backend
const API_BASE_URL = '/api';

// Store JWT token
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Base fetch function with auth headers
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// ==================== AUTH API ====================
export const authApi = {
  login: async (email: string, password: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const token = await response.text();
    setAuthToken(token);
    return token;
  },

  logout: () => {
    setAuthToken(null);
  },
};

// ==================== PRODUCT API ====================
export interface ProductApiResponse {
  id: string;
  category: string;
  title: string;
  originalValue?: number;
  currentPrice: number;
  quantity: number;
  imageURL: string;
  weight?: number; // Trọng lượng sản phẩm (kg)
  // Book fields
  bookType?: string;
  publisher?: string;
  publishDate?: string;
  language?: string;
  pages?: number; // Số trang
  genre?: string; // Thể loại
  authors?: { id: string; name: string; bio?: string }[];
  // CD fields
  artist?: string;
  recordLabel?: string;
  musicType?: string;
  releaseDate?: string;
  tracks?: { id: string; title: string; length: string }[];
  // DVD fields
  discType?: string;
  director?: string;
  runTime?: number;
  studio?: string;
  subtitle?: string;
  filmType?: string;
  // Newspaper fields
  edition?: string;
  section?: { id: string; title: string; description?: string };
}

export interface ProductApiRequest {
  category: string;
  title: string;
  originalValue?: number;
  currentPrice: number;
  quantity: number;
  imageURL: string;
  createdBy?: string;
  weight?: number; // Trọng lượng sản phẩm (kg)
  // Book fields
  publisher?: string;
  publishDate?: string;
  language?: string;
  bookType?: string;
  authorIds?: string[];
  pages?: number; // Số trang
  genre?: string; // Thể loại
  // CD fields
  artist?: string;
  recordLabel?: string;
  musicType?: string;
  cdReleaseDate?: string;
  trackDetails?: { title: string; length: string }[];
  // DVD fields
  discType?: string;
  director?: string;
  runTime?: number;
  studio?: string;
  subtitle?: string;
  dvdReleaseDate?: string;
  filmType?: string;
  // Newspaper fields
  newspaperPublisher?: string;
  newspaperLanguage?: string;
  newspaperPublishDate?: string;
  edition?: string;
  sectionId?: string;
}

export const productApi = {
  getAll: async (type?: string): Promise<ProductApiResponse[]> => {
    const url = type ? `/products?type=${type}` : '/products';
    return fetchWithAuth(url);
  },

  getById: async (id: string): Promise<ProductApiResponse> => {
    return fetchWithAuth(`/products/${id}`);
  },

  getByCategory: async (category: string): Promise<ProductApiResponse[]> => {
    return fetchWithAuth(`/products/type/${category}`);
  },

  create: async (product: ProductApiRequest): Promise<ProductApiResponse> => {
    return fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: ProductApiRequest): Promise<ProductApiResponse> => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PRODUCT HISTORY API ====================
export interface ProductHistoryApiResponse {
  id: string;
  productId: string;
  productName: string;
  action: string;
  timestamp: string;
  userName: string;
  details?: string;
}

export interface ProductHistoryApiRequest {
  productId: string;
  productName: string;
  action: string; // ADD, EDIT, DELETE, DEACTIVATE
  userName: string;
  details?: string;
}

export const productHistoryApi = {
  getAll: async (): Promise<ProductHistoryApiResponse[]> => {
    return fetchWithAuth('/product-history');
  },

  getByProductId: async (productId: string): Promise<ProductHistoryApiResponse[]> => {
    return fetchWithAuth(`/product-history/product/${productId}`);
  },

  create: async (history: ProductHistoryApiRequest): Promise<ProductHistoryApiResponse> => {
    return fetchWithAuth('/product-history', {
      method: 'POST',
      body: JSON.stringify(history),
    });
  },

  deleteAll: async (): Promise<void> => {
    return fetchWithAuth('/product-history', {
      method: 'DELETE',
    });
  },
};

// ==================== USER API ====================
export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER_PRODUCT';
  active: boolean;
  createdAt?: string;
}

export interface UserApiRequest {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'MANAGER_PRODUCT';
}

export const userApi = {
  getAll: async (): Promise<UserApiResponse[]> => {
    return fetchWithAuth('/users');
  },

  getById: async (id: string): Promise<UserApiResponse> => {
    return fetchWithAuth(`/users/${id}`);
  },

  create: async (user: UserApiRequest): Promise<UserApiResponse> => {
    return fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  update: async (id: string, user: UserApiRequest): Promise<UserApiResponse> => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // New methods for user management
  block: async (id: string): Promise<UserApiResponse> => {
    return fetchWithAuth(`/users/${id}/block`, {
      method: 'PUT',
    });
  },

  unblock: async (id: string): Promise<UserApiResponse> => {
    return fetchWithAuth(`/users/${id}/unblock`, {
      method: 'PUT',
    });
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    return fetchWithAuth(`/users/${id}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },

  getCurrentUser: async (): Promise<UserApiResponse> => {
    return fetchWithAuth('/users/me');
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    return fetchWithAuth('/users/me/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  },
};

// ==================== INVOICE API ====================
export interface InvoiceItemRequest {
  productId: string;
  quantity: number;
}

export interface DeliveryInfoRequest {
  receiveName: string;
  phoneNumber: string;
  email: string;
  city: string;
  ward?: string;
  detailAddress: string;
  note?: string;
}

export interface InvoiceRequest {
  items?: InvoiceItemRequest[];
  deliveryInfo?: DeliveryInfoRequest;
  paymentMethod?: string;
}

export interface InvoiceItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface DeliveryInfoResponse {
  id: string;
  receiveName: string;
  phoneNumber: string;
  email: string;
  city: string;
  ward?: string;
  detailAddress: string;
  note?: string;
}

export interface InvoiceResponse {
  id: string;
  createAt: string;
  status: string;
  amount: number;
  paymentMethod: string;
  // Transaction info
  transactionId?: string;
  transactionContent?: string;
  transactionDateTime?: string;
  // Approval info
  approvedBy?: string;
  approvedDateTime?: string;
  // Rejection/Cancellation info
  rejectionReason?: string;
  rejectionDateTime?: string;
  rejectedBy?: string;
  cancelledDateTime?: string;
  cancellationReason?: string;
  // Email tracking
  emailSent?: boolean;
  emailSentAt?: string;
  // Order access token for email links
  orderAccessToken?: string;
  // Delivery info
  deliveryInfo?: DeliveryInfoResponse;
  // Items
  items?: InvoiceItemResponse[];
}

export interface PaginatedInvoiceResponse {
  content: InvoiceResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const invoiceApi = {
  create: async (invoice: InvoiceRequest): Promise<InvoiceResponse> => {
    return fetchWithAuth('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  },

  update: async (id: string, invoice: InvoiceRequest): Promise<InvoiceResponse> => {
    return fetchWithAuth(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  },

  getById: async (id: string): Promise<InvoiceResponse> => {
    return fetchWithAuth(`/invoices/${id}`);
  },

  getAll: async (): Promise<InvoiceResponse[]> => {
    return fetchWithAuth('/invoices');
  },

  getPending: async (page: number = 0, size: number = 30): Promise<PaginatedInvoiceResponse> => {
    return fetchWithAuth(`/invoices/pending?page=${page}&size=${size}`);
  },

  getProcessed: async (page: number = 0, size: number = 30): Promise<PaginatedInvoiceResponse> => {
    return fetchWithAuth(`/invoices/processed?page=${page}&size=${size}`);
  },

  completePayment: async (id: string, transactionId: string, transactionContent: string): Promise<InvoiceResponse> => {
    return fetchWithAuth(`/invoices/${id}/complete-payment`, {
      method: 'POST',
      body: JSON.stringify({ transactionId, transactionContent }),
    });
  },

  approve: async (id: string, approvedBy: string): Promise<InvoiceResponse> => {
    return fetchWithAuth(`/invoices/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy }),
    });
  },

  reject: async (id: string, rejectedBy: string, reason: string): Promise<InvoiceResponse> => {
    return fetchWithAuth(`/invoices/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectedBy, reason }),
    });
  },

  cancel: async (id: string, reason: string): Promise<InvoiceResponse> => {
    return fetchWithAuth(`/invoices/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getByEmail: async (email: string): Promise<InvoiceResponse[]> => {
    return fetchWithAuth(`/invoices/by-email?email=${encodeURIComponent(email)}`);
  },

  // Public access via order access token (for email links - no auth required)
  getByAccessToken: async (token: string): Promise<InvoiceResponse> => {
    const response = await fetch(`${API_BASE_URL}/invoices/public/${token}`);
    if (!response.ok) {
      throw new Error('Order not found');
    }
    return response.json();
  },

  cancelByAccessToken: async (token: string, reason?: string): Promise<InvoiceResponse> => {
    const response = await fetch(`${API_BASE_URL}/invoices/public/${token}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || 'Customer requested cancellation via email link' }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to cancel order');
    }
    return response.json();
  },
};

// ==================== PAYMENT API ====================
export interface VietQrRequest {
  invoiceId?: string;
  description: string;
  amount: string;
  bankCode?: string;
  accountNo?: string;
  accountName?: string;
  content?: string;
  template?: string;
}

export interface VietQrResponse {
  status?: string;
  message?: string;
  bankCode?: string;
  bankName?: string;
  bankAccount?: string;
  userBankName?: string;
  amount?: string;
  content?: string;
  qrCode?: string;
  imgId?: string;
  qrLink?: string;
  qrDataURL?: string;
  transactionId?: string;
  transactionRefId?: string;
  orderId?: string;
  vaAccount?: string;
  existing?: number;
  terminalCode?: string;
  subTerminalCode?: string;
  serviceCode?: string;
  additionalData?: any[];
}

export interface PaypalRequest {
  invoiceId?: string;
  description: string;
  amount: number;
  currency?: string;
}

export interface PaypalResponse {
  id: string;
  status: string;
  message?: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export const paymentApi = {
  createVietQr: async (request: VietQrRequest): Promise<VietQrResponse> => {
    // Map fields to match backend DTO
    const requestBody = {
      invoiceId: request.invoiceId,
      description: request.description,
      amount: request.amount,
      bankCode: request.bankCode,
      accountNo: request.accountNo,
      accountName: request.accountName,
      content: request.content || request.description,
      template: request.template || 'compact',
    };

    console.log('VietQR Request:', requestBody);

    const response = await fetch(`${API_BASE_URL}/payment/vietqr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('VietQR Error:', error);
      throw new Error(error || 'VietQR payment failed');
    }

    const result = await response.json();
    console.log('VietQR Response:', result);
    return result;
  },

  createPaypal: async (request: PaypalRequest): Promise<PaypalResponse> => {
    const requestBody = {
      invoiceId: request.invoiceId,
      description: request.description,
      amount: request.amount,
      currency: request.currency || 'USD',
    };

    console.log('PayPal Request:', requestBody);

    const response = await fetch(`${API_BASE_URL}/payment/paypal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal Error:', error);
      throw new Error(error || 'PayPal payment failed');
    }

    const result = await response.json();
    console.log('PayPal Response:', result);
    return result;
  },

  // Check VietQR payment status
  checkVietQrStatus: async (transactionId: string): Promise<{ transactionId: string; status: string; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/payment/vietqr/status/${transactionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    return response.json();
  },

  // Confirm VietQR payment (manual confirmation)
  confirmVietQrPayment: async (transactionId: string): Promise<{ transactionId: string; status: string; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/payment/vietqr/confirm/${transactionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return response.json();
  },
};

// ==================== AUTHOR API ====================
export interface AuthorResponse {
  id: string;
  name: string;
  bio?: string;
}

export const authorApi = {
  getAll: async (): Promise<AuthorResponse[]> => {
    return fetchWithAuth('/authors');
  },
};

// ==================== SECTION API ====================
export interface SectionResponse {
  id: string;
  title: string;
  description?: string;
}

export const sectionApi = {
  getAll: async (): Promise<SectionResponse[]> => {
    return fetchWithAuth('/sections');
  },
};

// ==================== MEDIA API ====================
export interface MediaResponse {
  publicId: string;
  url: string;
  secureUrl: string;
}

export const mediaApi = {
  // Upload a file to Cloudinary
  upload: async (file: File): Promise<MediaResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to upload image');
    }

    return response.json();
  },

  // Get a media URL by public ID
  get: async (publicId: string): Promise<MediaResponse> => {
    return fetchWithAuth(`/media/${publicId}`);
  },
};

// ==================== SHIPPING API ====================
export interface ShippingCalculationRequest {
  totalWeight: number; // Total weight in kg
  city: string; // Delivery city/province
  subtotal: number; // Order subtotal for free shipping calculation
}

export interface ShippingCalculationResponse {
  shippingFee: number; // Calculated shipping fee in VND
  freeShippingDiscount: number; // Applied free shipping discount
  isMetroCity: boolean; // Whether delivery is to a metro city
  city: string; // Delivery city/province
  totalWeight: number; // Total weight used for calculation
  subtotal: number; // Order subtotal used for calculation
  freeShippingThreshold: number; // Order amount for free shipping eligibility
  maxFreeShippingDiscount: number; // Maximum free shipping discount
}

export const shippingApi = {
  calculateShippingFee: async (request: ShippingCalculationRequest): Promise<ShippingCalculationResponse> => {
    const response = await fetch(`${API_BASE_URL}/shipping/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to calculate shipping fee');
    }

    return response.json();
  },

  getMetroCities: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/shipping/metro-cities`);
    if (!response.ok) {
      throw new Error('Failed to get metro cities');
    }
    return response.json();
  },
};
