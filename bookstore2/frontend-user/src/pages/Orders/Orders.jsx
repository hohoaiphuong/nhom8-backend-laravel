import { useState, useEffect } from 'react';
import { Loader, ChevronRight, Package } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { orderApi } from '../../api/orderApi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setError('Bạn cần đăng nhập');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Get user profile which includes orders
        const response = await orderApi.getUserOrders(userId);
        setOrders(response.data.orders || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        // Try alternative endpoint
        try {
          const response = await orderApi.getOrders();
          const userOrders = response.data.data?.filter(o => o.nguoi_dung_id === parseInt(userId)) || [];
          setOrders(userOrders);
        } catch (err2) {
          setError('Không thể tải lịch sử đơn hàng');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      cho_xu_ly: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      dang_giao: { label: 'Đang giao', color: 'bg-blue-100 text-blue-800' },
      hoan_thanh: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      da_huy: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${info.color}`}>{info.label}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader className="animate-spin" size={32} />
        </div>
      </MainLayout>
    );
  }

  if (!userId) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Bạn cần đăng nhập để xem lịch sử đơn hàng</p>
          <a href="/login" className="text-blue-600 hover:underline">Đăng nhập tại đây</a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Lịch sử đơn hàng</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Package size={24} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Đơn hàng #{order.id}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.ngay_tao)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.trang_thai)}
                    <p className="font-bold text-lg text-gray-800 min-w-max">
                      {formatPrice(order.tong_tien)}
                    </p>
                    <ChevronRight
                      size={24}
                      className={`text-gray-400 transition-transform ${
                        expandedOrder === order.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Order Details */}
                {expandedOrder === order.id && (
                  <div className="border-t px-6 py-4 bg-gray-50">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Sản phẩm</h3>
                      <div className="space-y-3">
                        {order.chi_tiet_don_hang && order.chi_tiet_don_hang.length > 0 ? (
                          order.chi_tiet_don_hang.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 pb-3 border-b">
                              {item.sach && item.sach.hinh_anh && (
                                <img
                                  src={item.sach.hinh_anh}
                                  alt={item.sach.ten_sach}
                                  className="w-16 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">
                                  {item.sach?.ten_sach || 'Sản phẩm'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.so_luong} x {formatPrice(item.gia)}
                                </p>
                              </div>
                              <p className="font-bold text-gray-800">
                                {formatPrice(item.so_luong * item.gia)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600">Không có thông tin sản phẩm</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.dia_chi && (
                      <div className="mb-6 p-4 bg-white rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</h3>
                        <p className="text-gray-700">{order.dia_chi.dia_chi}</p>
                      </div>
                    )}

                    {/* Payment Info */}
                    {order.payment && (
                      <div className="mb-6 p-4 bg-white rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Thông tin thanh toán</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phương thức:</span>
                            <span className="font-semibold">{order.payment.phuong_thuc || 'Chưa xác định'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái thanh toán:</span>
                            <span className="font-semibold">{order.payment.trang_thai || 'Chờ xử lý'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg p-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Tổng tiền hàng:</span>
                          <span>{formatPrice(order.tong_tien)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Tổng cộng:</span>
                          <span className="text-blue-600">{formatPrice(order.tong_tien)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
            <a href="/products" className="text-blue-600 hover:underline font-semibold">
              Tiếp tục mua sắm
            </a>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;

