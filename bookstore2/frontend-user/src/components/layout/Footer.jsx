  import { Link } from 'react-router-dom';
  import { Mail, Phone, MapPin, Share2 } from 'lucide-react';

  const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Thông tin shop */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>📚</span>
                BookStu
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Cửa hàng sách online hàng đầu với đa dạng các thể loại sách chất lượng cao.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>0123456789</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>support@bookstore.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>123 Đường ABC, TP.HCM</span>
                </div>
              </div>
            </div>

            {/* Liên kết nhanh */}
            <div>
              <h4 className="font-bold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Trang chủ</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Cửa hàng</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Sách mới</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Bán chạy nhất</Link></li>
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h4 className="font-bold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Liên hệ chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-white transition">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
              </ul>
            </div>

            {/* Mạng xã hội */}
            <div>
              <h4 className="font-bold mb-4">Theo dõi chúng tôi</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition">
                  <Share2 size={20} />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-800 my-8" />

          {/* Copyright */}
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2026 Bookstore. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    );
  };

  export default Footer;
