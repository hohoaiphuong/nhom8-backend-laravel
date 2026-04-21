import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronLeft, Plus, Minus } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { cartApi } from '../../api/cartApi';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      if (userId) {
        // Fetch từ API nếu đã đăng nhập
        const res = await cartApi.getCart(userId);
        const items = (res.data.data.chi_tiet_gio_hang || []).map(item => ({
          id: item.id,
          gio_hang_id: item.gio_hang_id,
          sach_id: item.sach_id,
          so_luong: item.so_luong,
          ten_sach: item.sach?.ten_sach || '',
          tac_gia: item.sach?.tac_gia || '',
          gia: item.sach?.gia || 0,
          hinh_anh: item.sach?.hinh_anh || '',
        }));
        setCartItems(items);
      } else {
        // Lấy từ localStorage nếu chưa đăng nhập
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        setCartItems(tempCart);
      }
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error fetching cart:', error);
      setMessage({ type: 'error', text: 'Lỗi khi tải giỏ hàng' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item, idx) => idx)));
    }
  };

  const handleUpdateQuantity = async (idx, newQuantity) => {
    if (newQuantity < 1) return;

    if (userId) {
      try {
        const item = cartItems[idx];
        await cartApi.updateCartItem(userId, item.id, newQuantity);
        const newItems = [...cartItems];
        newItems[idx].so_luong = newQuantity;
        setCartItems(newItems);
      } catch (error) {
        console.error('Error updating quantity:', error);
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật số lượng' });
      }
    } else {
      // Update tempCart
      const newItems = [...cartItems];
      newItems[idx].so_luong = newQuantity;
      setCartItems(newItems);
      localStorage.setItem('tempCart', JSON.stringify(newItems));
    }
  };

  const handleRemoveItem = async (idx) => {
    if (userId) {
      try {
        const item = cartItems[idx];
        await cartApi.removeFromCart(userId, item.id);
        const newItems = cartItems.filter((_, i) => i !== idx);
        setCartItems(newItems);
        setMessage({ type: 'success', text: 'Đã xóa sản phẩm' });
        setTimeout(() => setMessage(null), 2000);
      } catch (error) {
        console.error('Error removing item:', error);
        setMessage({ type: 'error', text: 'Lỗi khi xóa sản phẩm' });
      }
    } else {
      // Remove from tempCart
      const newItems = cartItems.filter((_, i) => i !== idx);
      setCartItems(newItems);
      localStorage.setItem('tempCart', JSON.stringify(newItems));
      setMessage({ type: 'success', text: 'Đã xóa sản phẩm' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const selectedItemsData = Array.from(selectedItems).map(idx => cartItems[idx]);
  const subtotal = selectedItemsData.reduce((sum, item) => {
    return sum + (item.gia * item.so_luong);
  }, 0);

  const total = subtotal;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          GIỎ HÀNG ({cartItems.length} sản phẩm)
        </h1>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow">
            <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT - Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              {/* Select All Header */}
              <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 cursor-pointer"
                />
                <label className="font-semibold text-gray-700 cursor-pointer">
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </label>
              </div>

              {/* Items List */}
              <div className="divide-y">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="p-4 flex gap-4 hover:bg-gray-50 transition">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.has(idx)}
                      onChange={() => handleSelectItem(idx)}
                      className="w-5 h-5 cursor-pointer mt-2 flex-shrink-0"
                    />

                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.hinh_anh ? (
                        <img
                          src={item.hinh_anh}
                          alt={item.ten_sach}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          📖
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {item.ten_sach}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.tac_gia}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(item.gia)}
                        </span>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(idx, item.so_luong - 1)}
                          className="p-1 border rounded hover:bg-gray-100 transition"
                          disabled={item.so_luong <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.so_luong}</span>
                        <button
                          onClick={() => handleUpdateQuantity(idx, item.so_luong + 1)}
                          className="p-1 border rounded hover:bg-gray-100 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <p className="font-bold text-gray-800">
                        {formatPrice(item.gia * item.so_luong)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t-2 border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🛍️</span>
                  <h3 className="text-lg font-bold text-gray-800">Tiếp tục mua sắm</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Bạn có muốn thêm sản phẩm khác vào giỏ hàng?</p>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Khám phá thêm sản phẩm
                </button>
              </div>
            </div>

            {/* RIGHT - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                {/* Selected Items */}
                <div>
                  <p className="font-semibold text-gray-800 mb-2">
                    Đã chọn: {selectedItems.size} sản phẩm
                  </p>
                </div>

                {/* Price Summary */}
                <div className="space-y-3 py-4 border-y">
                  <div className="flex justify-between text-gray-700">
                    <span>Thành tiền</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Tổng số tiền</span>
                  <p className="text-3xl font-bold text-red-600">
                    {formatPrice(total)}
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  disabled={selectedItems.size === 0}
                  onClick={() => {
                    if (selectedItems.size === 0) {
                      setMessage({ type: 'error', text: 'Vui lòng chọn sản phẩm để thanh toán' });
                      return;
                    }
                    navigate('/checkout', { state: { selectedItems: Array.from(selectedItems) } });
                  }}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition text-lg"
                >
                  THANH TOÁN
                </button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center">
                  (Giảm giá trên web chỉ áp dụng cho bản lẻ)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;
