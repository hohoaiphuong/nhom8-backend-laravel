import client from './client';

export const categoryApi = {
  // Lấy danh sách danh mục
  getCategories: () => client.get('/categories'),

  // Lấy chi tiết danh mục
  getCategory: (id) => client.get(`/categories/${id}`),
};
