import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, ShoppingCart, ChevronLeft, Heart, Share2 } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import ProductCard from '../../components/shared/ProductCard';
import { bookApi } from '../../api/bookApi';
import { cartApi } from '../../api/cartApi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedBooks, setRelatedBooks] = useState([]);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        console.log('📘 Fetching book ID:', id);
        const res = await bookApi.getBook(id);
        console.log('📘 Book API Response:', res);
        setBook(res.data.data);
        
        // Fetch related books from same category
        if (res.data.data?.the_loai_id) {
          try {
            const relatedRes = await bookApi.getBooks({ category: res.data.data.the_loai_id });
            setRelatedBooks(relatedRes.data.data?.filter(b => b.id !== id).slice(0, 5) || []);
          } catch (err) {
            console.error('Error fetching related books:', err);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching book:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!book) {
      setMessage({ type: 'error', text: 'Sách chưa được tải' });
      return;
    }

    setAddingToCart(true);
    try {
      console.log('🛒 Adding to cart - userId:', userId, 'bookId:', id, 'quantity:', quantity);
      
      if (userId) {
        // Nếu đã đăng nhập → thêm vào DB
        console.log('📤 Sending API request...');
        const response = await cartApi.addToCart(userId, id, quantity);
        console.log('✅ API Response:', response);
      } else {
        // Nếu chưa đăng nhập → lưu vào localStorage
        console.log('💾 Adding to temp cart...');
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const existingItem = tempCart.find(item => item.id === parseInt(id));
        
        if (existingItem) {
          existingItem.so_luong += quantity;
          console.log('✏️ Updated existing item quantity');
        } else {
          tempCart.push({
            id: parseInt(id),
            ten_sach: book.ten_sach,
            hinh_anh: book.hinh_anh,
            tac_gia: book.tac_gia,
            gia: book.gia,
            so_luong: quantity,
            the_loai_id: book.the_loai_id,
          });
          console.log('✨ Added new item to temp cart');
        }
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
      }
      
      setMessage({ type: 'success', text: `Đã thêm ${quantity} cuốn vào giỏ hàng` });
      setQuantity(1);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('❌ Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </MainLayout>
    );
  }

  if (!book) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600 text-lg">Không tìm thấy sách</p>
        </div>
      </MainLayout>
    );
  }

  // Create image gallery (main image + placeholders for thumbnails)
  const images = book.hinh_anh ? [book.hinh_anh] : [];
  const thumbnails = [...images, ...Array(5).fill(null)]; // Placeholder thumbnails

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white p-6 rounded-lg shadow">
          {/* LEFT - Product Image & Gallery */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center aspect-square">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={book.ten_sach}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <p className="text-5xl mb-2">📖</p>
                  <p>Không có ảnh</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {thumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition border-2 ${
                    selectedImage === idx ? 'border-red-600' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    {img && <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-1" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - Product Info Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Category Link */}
              <p className="text-sm">
                <span
                  onClick={() => navigate(`/products?category=${book.the_loai_id}`)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
                >
                  {book.category?.ten || 'Sách'}
                </span>
              </p>

              {/* Title */}
              <h1 className="text-xl font-bold text-gray-800">
                {book.ten_sach}
              </h1>

              {/* Author */}
              <p className="text-sm text-gray-600">
                Tác giả: <span className="font-semibold">{book.tac_gia}</span>
              </p>

              {/* Rating */}
              {book.ratings && (
                <div className="flex items-center gap-2 py-2 border-b">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(book.ratings.reduce((sum, r) => sum + (r.so_sao || 0), 0) / book.ratings.length || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({book.ratings.length} đánh giá)</span>
                </div>
              )}

              {/* Price - HIGHLIGHTED */}
              <div className="py-3">
                <p className="text-xs text-gray-600 mb-1 font-semibold">Giá bán</p>
                <p className="text-4xl font-bold text-red-600">
                  {formatPrice(book.gia)}
                </p>
              </div>

              {/* Stock Status */}
              <div className={`p-3 rounded text-sm font-semibold ${
                book.so_luong > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {book.so_luong > 0 
                  ? `✓ Còn lại: ${book.so_luong} cuốn` 
                  : '✗ Hết hàng'}
              </div>

              {/* Quantity Selector */}
              <div className="border rounded p-3">
                <p className="text-xs text-gray-600 mb-2 font-semibold">Số lượng</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border rounded hover:bg-gray-100 font-bold disabled:opacity-50"
                    disabled={addingToCart || quantity === 1}
                  >
                    −
                  </button>
                  <span className="font-bold flex-1 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.so_luong, quantity + 1))}
                    className="w-8 h-8 border rounded hover:bg-gray-100 font-bold disabled:opacity-50"
                    disabled={addingToCart || quantity === book.so_luong}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={book.so_luong === 0 || addingToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-bold flex items-center justify-center gap-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>

              {/* Wishlist Button */}
              <button className="w-full border-2 border-gray-300 hover:border-red-600 text-gray-600 hover:text-red-600 py-2 rounded font-semibold flex items-center justify-center gap-2 transition">
                <Heart size={18} />
                Yêu thích
              </button>
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT Section */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-600 text-white p-4 font-bold">
            THÔNG TIN CHI TIẾT
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="font-semibold text-gray-700">Tên sách</span>
                <span className="text-gray-900">{book.ten_sach}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="font-semibold text-gray-700">Tác giả</span>
                <span className="text-gray-900">{book.tac_gia}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="font-semibold text-gray-700">Thể loại</span>
                <span className="text-gray-900">{book.category?.ten || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="font-semibold text-gray-700">Giá</span>
                <span className="text-red-600 font-bold">{formatPrice(book.gia)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3">
                <span className="font-semibold text-gray-700">Số lượng</span>
                <span className={book.so_luong > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {book.so_luong > 0 ? `${book.so_luong} cuốn` : 'Hết hàng'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MÔ TẢ SÁCH Section */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-600 text-white p-4 font-bold">
            MÔ TẢ SÁCH
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {book.mo_ta || 'Chưa có mô tả chi tiết cho sách này.'}
            </p>
          </div>
        </div>

        {/* ĐÁNH GIÁ Section */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-600 text-white p-4 font-bold">
            ĐÁNH GIÁ
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rating Summary */}
              <div className="text-center border-r pr-6">
                <p className="text-4xl font-bold text-red-600 mb-2">0</p>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-gray-300 text-gray-300"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Chưa có đánh giá</p>
              </div>

              {/* Rating Breakdown */}
              <div className="md:col-span-2 space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-12">{stars} ⭐</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">0</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Review */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
              <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition">
                Viết đánh giá
              </button>
            </div>

            {/* Reviews List */}
            <div className="mt-8">
              <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedBooks.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-red-600 text-white p-4 font-bold">
              SÁCH CÙNG THỂ LOẠI
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {relatedBooks.map((relatedBook) => (
                  <ProductCard key={relatedBook.id} book={relatedBook} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
