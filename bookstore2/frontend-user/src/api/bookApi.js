import client from './client';

export const bookApi = {
  // Lấy danh sách sách
  getBooks: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category_id', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    return client.get(`/books?${params.toString()}`);
  },

  // Lấy chi tiết một sách
  getBook: (id) => client.get(`/books/${id}`),

  // Lấy sách mới nhất
  getLatestBooks: (limit = 8) => client.get(`/books?limit=${limit}&sort=newest`),

  // Lấy sách bán chạy nhất
  getBestsellers: (limit = 8) => client.get(`/books?limit=${limit}&sort=bestseller`),
};
