import { useState, useEffect } from 'react';
import { Loader, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { orderApi } from '../../api/orderApi';
import { cartApi } from '../../api/cartApi';
import { paymentApi } from '../../api/paymentApi';

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const [formData, setFormData] = useState({
    ten_khach: '',
    email: '',
    so_dien_thoai: '',
    dia_chi: '',
    phuong_thuc_thanh_toan: 'tien_mat',
    phuong_thuc_van_chuyen: 'standard'
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);

      if (userId) {
        const cartRes = await cartApi.getCart(userId);
        const items = (cartRes.data.data?.chi_tiet_gio_hang || []).map(item => ({
          id: item.id,
          sach_id: item.sach_id,
          so_luong: item.so_luong,
          ten_sach: item.sach?.ten_sach || '',
          tac_gia: item.sach?.tac_gia || '',
          gia: item.sach?.gia || 0,
          hinh_anh: item.sach?.hinh_anh || '',
        }));
        setCartItems(items);
      } else {
        const tempCart = localStorage.getItem('tempCart');
        if (tempCart) {
          const parsedCart = JSON.parse(tempCart);
          // Map guest cart items: use 'id' as sach_id if sach_id doesn't exist
          const items = parsedCart.map(item => ({
            id: item.id,
            sach_id: item.sach_id || item.id,
            so_luong: item.so_luong || 1,
            ten_sach: item.ten_sach || '',
            tac_gia: item.tac_gia || '',
            gia: item.gia || 0,
            hinh_anh: item.hinh_anh || '',
          }));
          setCartItems(items);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Không thể tải thông tin giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateOrder = async () => {
    if (!formData.ten_khach) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    if (!formData.so_dien_thoai) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.dia_chi) {
      setError('Vui lòng nhập địa chỉ');
      return;
    }

    setSubmitting(true);
    try {
      if (!cartItems || cartItems.length === 0) {
        setError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán');
        setSubmitting(false);
        return;
      }

      const items = cartItems.map(item => ({
        sach_id: parseInt(item.sach_id),
        so_luong: parseInt(item.so_luong),
        gia: parseFloat(item.gia)
      }));

      const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.gia) * parseInt(item.so_luong)), 0);

      const orderPayload = {
        ten_khach: formData.ten_khach.trim(),
        email: formData.email.trim(),
        so_dien_thoai: formData.so_dien_thoai.trim(),
        dia_chi: formData.dia_chi.trim(),
        items: items,
        tong_tien: parseFloat(subtotal.toFixed(2)),
        phuong_thuc_van_chuyen: formData.phuong_thuc_van_chuyen
      };

      if (userId) {
        orderPayload.nguoi_dung_id = parseInt(userId);
      }

      console.log('Order Payload:', orderPayload);
      
      const orderRes = await orderApi.createOrder(orderPayload);
      const createdOrder = orderRes.data.data;

      const paymentRes = await paymentApi.createPayment({
        don_hang_id: createdOrder.id,
        phuong_thuc: formData.phuong_thuc_thanh_toan,
        trang_thai: 'cho_xu_ly'
      });

      if (userId) {
        await cartApi.clearCart(userId);
      } else {
        localStorage.removeItem('tempCart');
      }

      setOrderData({
        order: createdOrder,
        payment: paymentRes.data.data,
        total: subtotal
      });
      setError(null);

    } catch (err) {
      console.error('Error creating order:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      let errorMsg = 'Lỗi tạo đơn hàng';
      if (err.response?.data?.errors) {
        // Laravel validation errors
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMsg += ': ' + (Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (err.response?.data?.message) {
        errorMsg += ': ' + err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg += ': ' + err.response.data.error;
      }
      
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.gia * item.so_luong), 0);
  const total = subtotal;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader className="animate-spin" size={32} />
        </div>
      </MainLayout>
    );
  }

  if (cartItems.length === 0 && !orderData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Giỏ hàng của bạn trống</p>
          <a href="/products" className="text-blue-600 hover:underline">Tiếp tục mua sắm</a>
        </div>
      </MainLayout>
    );
  }

  if (orderData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
              <Check size={48} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-6">Mã đơn hàng: <span className="font-bold text-lg">#{orderData.order.id}</span></p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-lg font-semibold text-gray-800">
                Tổng tiền: {formatPrice(orderData.total)}
              </p>
              <p className="text-sm text-gray-600">
                Phương thức: {orderData.payment.phuong_thuc}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/products')}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {!userId && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start gap-3">
            <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">Bạn đã là thành viên?</p>
              <a href="/login" className="text-yellow-600 hover:text-yellow-700 underline">Đăng nhập ngay</a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700">
                <p className="font-semibold">Lỗi:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ĐỊA CHỈ GIAO HÀNG</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên người nhận</label>
                  <input
                    type="text"
                    name="ten_khach"
                    value={formData.ten_khach}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="so_dien_thoai"
                    value={formData.so_dien_thoai}
                    onChange={handleInputChange}
                    placeholder="Vd: 0979123xxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</label>
                  <textarea
                    name="dia_chi"
                    value={formData.dia_chi}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường, quận, thành phố)"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">PHƯƠNG THỨC VẬN CHUYỂN</h3>
              
              <div className="space-y-3">
                {[
                  { value: 'standard', label: 'Giao hàng tiêu chuẩn', time: '3-5 ngày' },
                  { value: 'express', label: 'Giao hàng nhanh', time: '1-2 ngày' },
                  { value: 'same_day', label: 'Giao cùng ngày', time: 'Hôm nay' }
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border-2 rounded cursor-pointer hover:bg-blue-50 transition" style={{borderColor: formData.phuong_thuc_van_chuyen === method.value ? '#2563eb' : '#e5e7eb'}}>
                    <input
                      type="radio"
                      name="phuong_thuc_van_chuyen"
                      value={method.value}
                      checked={formData.phuong_thuc_van_chuyen === method.value}
                      onChange={handleInputChange}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{method.label}</p>
                      <p className="text-sm text-gray-600">{method.time}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">PHƯƠNG THỨC THANH TOÁN</h3>
              
              <div className="space-y-3">
                {[
                  { value: 'tien_mat', label: 'Tiền mặt khi nhận hàng', icon: '💵' },
                  { value: 'chuyen_khoan', label: 'Chuyển khoản ngân hàng', icon: '🏦' },
                  { value: 'vi_dien_tu', label: 'Ví điện tử (Momo, ZaloPay)', icon: '📱' }
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-4 p-3 border-2 rounded cursor-pointer hover:bg-blue-50 transition" style={{borderColor: formData.phuong_thuc_thanh_toan === method.value ? '#2563eb' : '#e5e7eb'}}>
                    <input
                      type="radio"
                      name="phuong_thuc_thanh_toan"
                      value={method.value}
                      checked={formData.phuong_thuc_thanh_toan === method.value}
                      onChange={handleInputChange}
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <p className="font-semibold text-gray-800">{method.label}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Đơn hàng của bạn</h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3 pb-3 border-b">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 line-clamp-2">{item.ten_sach}</p>
                      <p className="text-xs text-gray-500">{item.so_luong}x</p>
                    </div>
                    <p className="font-bold text-red-600 whitespace-nowrap">
                      {formatPrice(item.gia * item.so_luong)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-4 border-t border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Thành tiền:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="font-bold text-gray-800">Tổng tiền:</span>
                <p className="text-3xl font-bold text-red-600">
                  {formatPrice(total)}
                </p>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={submitting}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Bằng việc kín hành Mua hàng, bạn đã công y với<br/>
                <a href="#" className="text-blue-600 hover:underline">Điều khoản & Điều kiện</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;

