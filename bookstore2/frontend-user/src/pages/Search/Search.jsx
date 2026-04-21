import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import ProductCard from '../../components/shared/ProductCard';
import { bookApi } from '../../api/bookApi';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await bookApi.getBooks({ search: query });
        console.log('Search results:', response);
        setResults(response.data.data || []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Lỗi khi tìm kiếm sách');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-gray-600">
            {query && (
              <>
                Tìm kiếm: <span className="font-bold text-red-600">"{query}"</span>
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <Loader size={40} className="text-red-600 animate-spin" />
            <p className="text-gray-500 font-medium">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <AlertCircle size={40} className="text-red-500" />
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <div>
            <p className="text-gray-600 mb-6">
              Tìm thấy <span className="font-bold text-red-600">{results.length}</span> kết quả
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((book) => (
                <ProductCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && query && (
          <div className="py-20 text-center">
            <p className="text-gray-500 text-lg mb-4">
              Không tìm thấy sách nào khớp với tìm kiếm của bạn.
            </p>
            <p className="text-gray-400">
              Hãy thử với từ khóa khác hoặc duyệt qua danh mục sản phẩm.
            </p>
          </div>
        )}

        {/* Empty Search */}
        {!loading && !error && !query && (
          <div className="py-20 text-center">
            <p className="text-gray-500 text-lg">
              Vui lòng nhập từ khóa để tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Search;
