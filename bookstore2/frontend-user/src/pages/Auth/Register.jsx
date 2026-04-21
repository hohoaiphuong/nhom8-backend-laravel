import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader, Eye, EyeOff, Phone } from 'lucide-react';
import { authApi } from '../../api/authApi';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ten: '',
    email: '',
    mat_khau: '',
    mat_khau_confirm: '',
    so_dien_thoai: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ten.trim()) {
      newErrors.ten = 'Vui lòng nhập họ tên';
    } else if (formData.ten.trim().length < 3) {
      newErrors.ten = 'Họ tên phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.mat_khau) {
      newErrors.mat_khau = 'Vui lòng nhập mật khẩu';
    } else if (formData.mat_khau.length < 6) {
      newErrors.mat_khau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.mat_khau_confirm) {
      newErrors.mat_khau_confirm = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.mat_khau !== formData.mat_khau_confirm) {
      newErrors.mat_khau_confirm = 'Mật khẩu không khớp';
    }

    if (formData.so_dien_thoai && !/^[0-9]{10}$/.test(formData.so_dien_thoai.replace(/\s/g, ''))) {
      newErrors.so_dien_thoai = 'Số điện thoại không hợp lệ';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      const response = await authApi.register({
        ten: formData.ten,
        email: formData.email,
        mat_khau: formData.mat_khau,
        so_dien_thoai: formData.so_dien_thoai || null
      });

      if (response.data.success && response.data.data) {
        const { id, api_token, ten } = response.data.data;
        
        // Lưu token, userId và tên người dùng vào localStorage (auto-login)
        localStorage.setItem('token', api_token);
        localStorage.setItem('userId', id);
        localStorage.setItem('userName', ten);
        
        // Clear guest cart
        localStorage.removeItem('tempCart');
        
        // Dispatch event để notify Header về login thành công
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // Redirect tới trang chủ
        navigate('/');
      } else {
        setGeneralError(response.data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Register error:', error);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 422) {
        const messages = error.response?.data?.message;
        if (typeof messages === 'string') {
          setGeneralError(messages);
        } else {
          setGeneralError(error.response?.data?.errors?.email?.[0] || 'Email hoặc thông tin không hợp lệ');
        }
      } else {
        setGeneralError(error.response?.data?.message || 'Lỗi đăng ký. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">📚 Bookstore</h1>
          <p className="text-gray-600">Tạo tài khoản mới</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {generalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ tên
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="ten"
                  value={formData.ten}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg outline-none transition-all ${
                    errors.ten
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="Nguyễn Văn A"
                  disabled={loading}
                />
              </div>
              {errors.ten && <p className="mt-1 text-sm text-red-600">{errors.ten}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg outline-none transition-all ${
                    errors.email
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại (Tùy chọn)
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="tel"
                  name="so_dien_thoai"
                  value={formData.so_dien_thoai}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg outline-none transition-all ${
                    errors.so_dien_thoai
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="0123456789"
                  disabled={loading}
                />
              </div>
              {errors.so_dien_thoai && (
                <p className="mt-1 text-sm text-red-600">{errors.so_dien_thoai}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="mat_khau"
                  value={formData.mat_khau}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg outline-none transition-all ${
                    errors.mat_khau
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.mat_khau && <p className="mt-1 text-sm text-red-600">{errors.mat_khau}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="mat_khau_confirm"
                  value={formData.mat_khau_confirm}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg outline-none transition-all ${
                    errors.mat_khau_confirm
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.mat_khau_confirm && (
                <p className="mt-1 text-sm text-red-600">{errors.mat_khau_confirm}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (e.target.checked && errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  className="mt-1"
                  disabled={loading}
                />
                <span className="text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Điều khoản sử dụng
                  </Link>
                  {' '}và{' '}
                  <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="mt-2 text-sm text-red-600">{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">HOẶC</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
