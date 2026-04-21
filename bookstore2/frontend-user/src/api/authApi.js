import client from './client';

export const authApi = {
  // Đăng ký
  register: (data) => client.post('/auth/register', data),

  // Đăng nhập
  login: (data) => client.post('/auth/login', data),

  // Đăng xuất
  logout: () => client.post('/auth/logout'),

  // Lấy thông tin user hiện tại
  getCurrentUser: () => client.get('/user'),

  // Cập nhật thông tin user
  updateProfile: (data) => client.put('/user', data),

  // Đổi mật khẩu
  changePassword: (data) => client.post('/change-password', data),
};
