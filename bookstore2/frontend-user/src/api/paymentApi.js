import client from './client';

export const paymentApi = {
  // Get all payments (admin)
  getPayments: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.trang_thai) params.append('trang_thai', filters.trang_thai);
    return client.get(`/payments?${params.toString()}`);
  },

  // Get payment by order
  getOrderPayment: (orderId) => client.get(`/payments?don_hang_id=${orderId}`),

  // Create payment
  createPayment: (data) => client.post('/payments', data),

  // Update payment status
  updatePaymentStatus: (id, trang_thai) => client.put(`/payments/${id}/status`, { trang_thai }),

  // Get payment details
  getPayment: (id) => client.get(`/payments/${id}`),
};
