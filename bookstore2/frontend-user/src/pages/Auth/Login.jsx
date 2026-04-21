import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/authApi';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    mat_khau: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.mat_khau) {
      newErrors.mat_khau = 'Vui lòng nhập mật khẩu';
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
      const response = await authApi.login({
        email: formData.email,
        mat_khau: formData.mat_khau
      });

      if (response.data.success && response.data.data) {
        const { id, api_token, ten } = response.data.data;
        
        // Lưu token, userId và tên người dùng vào localStorage
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
        setGeneralError(response.data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 401) {
        setGeneralError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
      } else if (error.response?.status === 422) {
        setGeneralError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
      } else {
        setGeneralError(error.response?.data?.message || 'Lỗi đăng nhập. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">📚 Bookstore</h1>
          <p className="text-gray-600">Chào mừng bạn quay lại</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {generalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
              {errors.mat_khau && (
                <p className="mt-1 text-sm text-red-600">{errors.mat_khau}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2" disabled={loading} />
                Nhớ mật khẩu
              </label>
              <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">HOẶC</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-semibold mb-2">💡 Tài khoản demo:</p>
          <p>Email: <code className="bg-yellow-100 px-2 py-1 rounded">user@gmail.com</code></p>
          <p>Mật khẩu: <code className="bg-yellow-100 px-2 py-1 rounded">123456</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
