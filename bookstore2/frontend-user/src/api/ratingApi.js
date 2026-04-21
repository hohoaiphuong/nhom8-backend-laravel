import client from './client';

export const ratingApi = {
  // Lấy đánh giá của một sách
  getBookRatings: (bookId) => client.get(`/books/${bookId}/ratings`),

  // Tạo đánh giá
  createRating: (bookId, data) => client.post(`/books/${bookId}/ratings`, data),

  // Cập nhật đánh giá
  updateRating: (ratingId, data) => client.put(`/ratings/${ratingId}`, data),

  // Xóa đánh giá
  deleteRating: (ratingId) => client.delete(`/ratings/${ratingId}`),
};
