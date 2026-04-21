import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import ProductCard from '../../components/shared/ProductCard';
import { bookApi } from '../../api/bookApi';
import { categoryApi } from '../../api/categoryApi';
import { Filter } from 'lucide-react';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categoryFilter = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksRes, catRes] = await Promise.all([
          bookApi.getBooks({
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            search: searchTerm,
          }),
          categoryApi.getCategories(),
        ]);
        setBooks(booksRes.data.data || []);
        setCategories(catRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, categoryFilter]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Cửa hàng</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Tìm theo tên sách hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Filter and Sort */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={20} />
              <span className="font-semibold">Lọc theo:</span>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.ten}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Đang tải sách...</p>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <ProductCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Không tìm thấy sách nào</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
