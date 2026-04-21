  import { Link } from 'react-router-dom';
  import { Mail, Phone, MapPin, Share2 } from 'lucide-react';

  const Footer = () => {
    return (
      <footer className="bg-slate-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Thông tin shop */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl"></span>
                <span>BOOKSTORE</span>
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Nhóm 8 sáng thứ 4: <br />
                Tên-MSSV: Nguyễn Văn Tuấn Anh-DH52200334 <br />
                Tên-MSSV: Trần Tiến Phát-DH52201199 <br />
                Tên-MSSV: Hồ Hoài Phương-Dh52201274
              </p>
            </div>

            {/* Liên kết nhanh */}
            <div>
              <h4 className="font-bold mb-4 text-base">Liên kết nhanh</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="#" className="hover:text-white hover:translate-x-1 transition duration-200">Trang chủ</Link></li>
                <li><Link to="/products" className="hover:text-white hover:translate-x-1 transition duration-200">Cửa hàng</Link></li>
                <li><Link to="#" className="hover:text-white hover:translate-x-1 transition duration-200">Sách mới</Link></li>
                <li><Link to="#" className="hover:text-white hover:translate-x-1 transition duration-200">Bán chạy nhất</Link></li>
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h4 className="font-bold mb-4 text-base">Hỗ trợ</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white hover:translate-x-1 transition duration-200">Liên hệ chúng tôi</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 transition duration-200">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 transition duration-200">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 transition duration-200">Chính sách bảo mật</a></li>
              </ul>
            </div>

            {/* Mạng xã hội */}
            <div>
              <h4 className="font-bold mb-4 text-base">Theo dõi chúng tôi</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-slate-800 p-2.5 rounded-full hover:bg-blue-600 hover:scale-110 transition duration-200" title="Facebook">
                  <span className="text-xl">f</span>
                </a>
                <a href="#" className="bg-slate-800 p-2.5 rounded-full hover:bg-pink-500 hover:scale-110 transition duration-200" title="Instagram">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="bg-slate-800 p-2.5 rounded-full hover:bg-blue-500 hover:scale-110 transition duration-200" title="LinkedIn">
                  <span className="text-xl">in</span>
                </a>
                <a href="#" className="bg-slate-800 p-2.5 rounded-full hover:bg-blue-400 hover:scale-110 transition duration-200" title="Email">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-700 my-8" />

          {/* Copyright */}
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2026 Bookstore. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    );
  };

  export default Footer;
