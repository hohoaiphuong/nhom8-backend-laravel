import { Star, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cartApi } from '../../api/cartApi';

const ProductCard = ({ book }) => {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  const formatPrice = (price) => {
    if (!price) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    try {
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        // Nếu đã đăng nhập → thêm vào DB
        console.log('🛒 Adding to cart from product card - userId:', userId, 'bookId:', book.id);
        await cartApi.addToCart(userId, book.id, 1);
      } else {
        // Nếu chưa đăng nhập → lưu vào localStorage
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const existingItem = tempCart.find(item => (item.sach_id || item.id) === book.id);
        
        if (existingItem) {
          existingItem.so_luong += 1;
        } else {
          tempCart.push({
            sach_id: book.id,
            id: book.id,
            ten_sach: book.ten_sach,
            hinh_anh: book.hinh_anh,
            tac_gia: book.tac_gia,
            gia: parseFloat(book.gia),
            so_luong: 1,
            the_loai_id: book.the_loai_id,
          });
        }
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
      }
      
      // 🔔 Dispatch custom event to update cart count in Header
      window.dispatchEvent(new Event('cartUpdated'));
      
      setMessage({ type: 'success', text: 'Đã thêm vào giỏ' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setMessage({ type: 'error', text: 'Lỗi khi thêm vào giỏ' });
    } finally {
      setAddingToCart(false);
    }
  };

  // Calculate average rating from ratings data
  const calculateRating = () => {
    if (!book.ratings || book.ratings.length === 0) {
      return 0;
    }
    const avgRating = book.ratings.reduce((sum, r) => sum + (r.so_sao || 0), 0) / book.ratings.length;
    return Math.round(avgRating * 10) / 10;
  };

  const rating = calculateRating();

  return (
    <Link to={`/products/${book.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 h-48">
          {book.hinh_anh ? (
            <img
              src={book.hinh_anh}
              alt={book.ten_sach}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>Không có ảnh</span>
            </div>
          )}
          {book.so_luong < 10 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
              Sắp hết
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
            {book.category?.ten || 'N/A'}
          </p>

          {/* Title */}
          <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 h-14">
            {book.ten_sach}
          </h3>

          {/* Author */}
          <p className="text-sm text-gray-600 mb-3">
            {book.tac_gia || 'N/A'}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({rating})</span>
          </div>

          {/* Price */}
          <p className="text-lg font-bold text-blue-600 mb-3">
            {formatPrice(book.gia)}
          </p>

          {/* Stock */}
          <p className="text-xs text-gray-500 mb-3">
            Còn lại: <span className="font-semibold">{book.so_luong}</span> cuốn
          </p>

          {/* Message */}
          {message && (
            <div className={`mb-2 p-2 rounded text-xs text-center ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || book.so_luong === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
            {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
