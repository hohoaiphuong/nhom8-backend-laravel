import client from './client';

export const userApi = {
  // Get user profile with addresses and orders
  getProfile: (userId) => client.get(`/auth/profile/${userId}`),

  // Update user profile
  updateProfile: (userId, data) => client.put(`/auth/profile/${userId}`, data),

  // Get user's addresses
  getAddresses: (userId) => client.get(`/addresses/user/${userId}`),

  // Add new address
  addAddress: (data) => client.post('/addresses', data),

  // Update address
  updateAddress: (addressId, data) => client.put(`/addresses/${addressId}`, data),

  // Delete address
  deleteAddress: (addressId) => client.delete(`/addresses/${addressId}`),

  // Set address as default
  setDefaultAddress: (addressId) => client.put(`/addresses/${addressId}`, { mac_dinh: true }),
};
