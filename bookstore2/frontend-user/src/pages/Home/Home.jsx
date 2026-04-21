import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import ProductCard from '../../components/shared/ProductCard';
import { bookApi } from '../../api/bookApi';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const slides = [
    {
      id: 1,
      title: 'Chào mừng đến với Bookstore!',
      subtitle: 'Khám phá thế giới sách và tri thức',
      image: 'https://via.placeholder.com/1200x400?text=Slide+1',
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      title: 'Sách mới mỗi tuần',
      subtitle: 'Cập nhật bộ sưu tập sách hay nhất',
      image: 'https://via.placeholder.com/1200x400?text=Slide+2',
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: 3,
      title: 'Ưu đãi tháng này',
      subtitle: 'Giảm giá đến 30% cho các sách được chọn',
      image: 'https://via.placeholder.com/1200x400?text=Slide+3',
      color: 'from-orange-400 to-orange-600',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await bookApi.getBooks({ page: 1 });
        console.log('Home - Books fetched:', response.data.data);
        setRecommendedBooks(response.data.data?.slice(0, 8) || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <MainLayout>
      {/* Slider */}
      <div className="relative h-96 overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color}`} />
            <div className="relative h-full flex items-center justify-center text-white text-center">
              <div>
                <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl mb-8">{slide.subtitle}</p>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                  Mua sắm ngay
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition z-10"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Recommended Books */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Sách gợi ý cho bạn</h3>
            <Link 
              to="/products" 
              className="text-red-600 font-semibold hover:text-red-700 transition"
            >
              Xem tất cả →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : recommendedBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedBooks.map((book) => (
                <ProductCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Không có sách nào</div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;
