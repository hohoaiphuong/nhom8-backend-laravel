// Constants for the application
export const API_BASE_URL = 'http://localhost:8000/api';

export const PRODUCT_CATEGORIES = [
  { id: 1, name: 'Tiểu thuyết', icon: '📖' },
  { id: 2, name: 'Khoa học', icon: '🔬' },
  { id: 3, name: 'Lập trình', icon: '💻' },
  { id: 4, name: 'Kỹ năng', icon: '🎯' },
];

export const ORDER_STATUS = {
  PENDING: 'cho_xu_ly',
  SHIPPING: 'dang_giao',
  COMPLETED: 'hoan_thanh',
  CANCELLED: 'da_huy',
};

export const PAYMENT_METHODS = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
};
