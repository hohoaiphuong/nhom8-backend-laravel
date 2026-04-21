import client from './client';

export const cartApi = {
  // Get user's cart
  getCart: (userId) => client.get(`/cart/user/${userId}`),

  // Add book to cart
  addToCart: (userId, bookId, quantity = 1) => 
    client.post(`/cart/user/${userId}/add`, { sach_id: bookId, so_luong: quantity }),

  // Update cart item quantity
  updateCartItem: (userId, itemId, quantity) => 
    client.put(`/cart/user/${userId}/item/${itemId}`, { so_luong: quantity }),

  // Remove item from cart
  removeFromCart: (userId, itemId) => 
    client.delete(`/cart/user/${userId}/item/${itemId}`),

  // Clear entire cart
  clearCart: (userId) => client.delete(`/cart/user/${userId}/clear`),
};
