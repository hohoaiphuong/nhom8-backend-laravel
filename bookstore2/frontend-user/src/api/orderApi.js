import client from './client';

export const orderApi = {
  // Get all orders
  getOrders: () => client.get('/orders'),

  // Get user's orders
  getUserOrders: (userId) => client.get(`/orders/user/${userId}`),

  // Get order details
  getOrder: (id) => client.get(`/orders/${id}`),

  // Create new order
  createOrder: (data) => client.post('/orders', data),

  // Update order
  updateOrder: (id, data) => client.put(`/orders/${id}`, data),

  // Cancel order
  cancelOrder: (id) => client.post(`/orders/${id}/cancel`),

  // Update order status
  updateOrderStatus: (id, trang_thai) => client.put(`/orders/${id}/status`, { trang_thai }),
};
