import { useState, useEffect } from 'react';
import { User, MapPin, Key, LogOut, Loader, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { userApi } from '../../api/userApi';
import { authApi } from '../../api/authApi';

const Account = () => {
  // User data
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [profileData, setProfileData] = useState({
    ten: '',
    so_dien_thoai: ''
  });

  const [passwordData, setPasswordData] = useState({
    mat_khau_cu: '',
    mat_khau_moi: '',
    confirm_mat_khau: ''
  });

  const [addressData, setAddressData] = useState({
    dia_chi: '',
    mac_dinh: false
  });

  // Get userId from localStorage (set during login)
  const userId = localStorage.getItem('userId');
  const userToken = localStorage.getItem('token');

  // Fetch user profile
  useEffect(() => {
    if (!userId) {
      setError('Bạn cần đăng nhập');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await userApi.getProfile(userId);
        setUser(response.data);
        setProfileData({
          ten: response.data.ten || '',
          so_dien_thoai: response.data.so_dien_thoai || ''
        });
        
        // Fetch addresses
        const addressRes = await userApi.getAddresses(userId);
        setAddresses(addressRes.data.data || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.updateProfile(userId, profileData);
      setUser({ ...user, ...profileData });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Lỗi cập nhật thông tin: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Add address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await userApi.addAddress({
        nguoi_dung_id: userId,
        ...addressData
      });
      setAddresses([...addresses, response.data.data]);
      setAddressData({ dia_chi: '', mac_dinh: false });
      setIsAddingAddress(false);
      setError(null);
    } catch (err) {
      setError('Lỗi thêm địa chỉ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Update address
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.updateAddress(editingAddress.id, addressData);
      setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...a, ...addressData } : a));
      setEditingAddress(null);
      setAddressData({ dia_chi: '', mac_dinh: false });
      setError(null);
    } catch (err) {
      setError('Lỗi cập nhật địa chỉ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Xác nhận xóa địa chỉ này?')) return;
    
    try {
      await userApi.deleteAddress(addressId);
      setAddresses(addresses.filter(a => a.id !== addressId));
    } catch (err) {
      setError('Lỗi xóa địa chỉ: ' + err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
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
          <p className="text-xl text-gray-600 mb-4">Bạn cần đăng nhập để xem tài khoản</p>
          <a href="/login" className="text-blue-600 hover:underline">Đăng nhập tại đây</a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tài khoản của tôi</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <User size={20} /> Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'addresses' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <MapPin size={20} /> Địa chỉ
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === 'password' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <Key size={20} /> Đổi mật khẩu
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} /> Đăng xuất
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên</label>
                      <input
                        type="text"
                        value={profileData.ten}
                        onChange={(e) => setProfileData({ ...profileData, ten: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={profileData.so_dien_thoai}
                        onChange={(e) => setProfileData({ ...profileData, so_dien_thoai: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save size={18} /> {submitting ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({ ten: user.ten, so_dien_thoai: user.so_dien_thoai });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
                    </div>

                    <div className="pb-4 border-b">
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.ten || 'Chưa cập nhật'}</p>
                    </div>

                    <div className="pb-4">
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.so_dien_thoai || 'Chưa cập nhật'}</p>
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} /> Chỉnh sửa
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Địa chỉ của tôi</h2>
                  <button
                    onClick={() => {
                      setIsAddingAddress(true);
                      setAddressData({ dia_chi: '', mac_dinh: false });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} /> Thêm địa chỉ
                  </button>
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="mb-6 p-4 border-2 border-dashed rounded-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ *</label>
                      <textarea
                        value={addressData.dia_chi}
                        onChange={(e) => setAddressData({ ...addressData, dia_chi: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: 123 Đường Lê Lợi, Quận 1, TP.HCM"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={addressData.mac_dinh}
                        onChange={(e) => setAddressData({ ...addressData, mac_dinh: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save size={18} /> {submitting ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false);
                          setAddressData({ dia_chi: '', mac_dinh: false });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                {editingAddress && (
                  <form onSubmit={handleUpdateAddress} className="mb-6 p-4 border-2 border-blue-500 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Chỉnh sửa địa chỉ</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ *</label>
                      <textarea
                        value={addressData.dia_chi}
                        onChange={(e) => setAddressData({ ...addressData, dia_chi: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        checked={addressData.mac_dinh}
                        onChange={(e) => setAddressData({ ...addressData, mac_dinh: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save size={18} /> {submitting ? 'Đang lưu...' : 'Cập nhật'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setAddressData({ dia_chi: '', mac_dinh: false });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <div key={address.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-gray-800 font-semibold">{address.dia_chi}</p>
                            {address.mac_dinh && (
                              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setAddressData({ dia_chi: address.dia_chi, mac_dinh: address.mac_dinh });
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">Chưa có địa chỉ nào</p>
                  )}
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
                <form className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={passwordData.mat_khau_cu}
                      onChange={(e) => setPasswordData({ ...passwordData, mat_khau_cu: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordData.mat_khau_moi}
                      onChange={(e) => setPasswordData({ ...passwordData, mat_khau_moi: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordData.confirm_mat_khau}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_mat_khau: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Đổi mật khẩu
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;

