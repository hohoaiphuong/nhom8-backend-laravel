import { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, User, Search, LayoutGrid, Bell, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { categoryApi } from '../../api/categoryApi';
import { bookApi } from '../../api/bookApi';

const Header = () => {
  const navigate = useNavigate();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCategoryBooks, setActiveCategoryBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const closeTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { logout } = useLogout();
  
  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }
    
    setShowSearchSuggestions(true);
    setLoadingSuggestions(true);
    
    // Debounce API call
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await bookApi.getBooks({ search: value });
        setSearchSuggestions(response.data.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSearchSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionClick = (book) => {
    navigate(`/products/${book.id}`);
    setSearchTerm('');
    setShowSearchSuggestions(false);
    setSearchSuggestions([]);
  };

  // Handle menu close with delay
  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  // Handle menu enter - clear timeout
  const handleMenuEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  };

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const isAuthenticated = !!userId;

  // Fetch books for selected category - wrapped with useCallback to prevent infinite loop
  const handleCategoryHover = useCallback(async (category) => {
    console.log('🔵 handleCategoryHover - category:', category);
    setActiveCategory(category);
    setLoadingBooks(true);
    try {
      console.log('🟢 Fetching books for category ID:', category.id);
      const response = await bookApi.getBooks({ category: category.id, page: 1 });
      console.log('🟡 API Response:', response);
      console.log('🟡 Response data:', response.data);
      console.log('🟡 Response data.data:', response.data.data);
      setActiveCategoryBooks(response.data.data || []);
    } catch (error) {
      console.error('🔴 Error fetching books:', error);
      console.error('🔴 Error response:', error.response?.data);
      setActiveCategoryBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  // Update cart count from localStorage or API
  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (userId) {
          // Nếu đã login, fetch cart từ API
          const response = await fetch(`http://localhost:8000/api/cart/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('🛒 Cart data from API:', data);
            const cartItems = data.data?.chi_tiet_gio_hang || [];
            console.log('🛒 Cart items:', cartItems);
            const totalCount = cartItems.reduce((sum, item) => sum + (item.so_luong || 1), 0);
            console.log('🛒 Total count:', totalCount);
            setCartCount(totalCount);
          } else {
            console.error('❌ Failed to fetch cart:', response.status);
          }
        } else {
          // Nếu chưa login, lấy từ tempCart
          const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
          const totalCount = tempCart.reduce((sum, item) => sum + (item.so_luong || 1), 0);
          console.log('🛒 Guest cart count:', totalCount);
          setCartCount(totalCount);
        }
      } catch (error) {
        console.error('❌ Error updating cart count:', error);
      }
    };
    
    updateCartCount();
    
    // Listen for custom cartUpdated event
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    const handleUserLoggedIn = () => {
      // Trigger cart update when user logs in
      window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleUserLoggedOut = () => {
      // Reset cart count when user logs out
      setCartCount(0);
      window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleStorageChange = (e) => {
      if (e.key === 'userId') {
        // Khi userId thay đổi, nếu có value (user vừa login) thì clear tempCart
        if (e.newValue) {
          localStorage.removeItem('tempCart');
          // Trigger cart update
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Clear tempCart on mount if user is already logged in
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      localStorage.removeItem('tempCart');
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories();
        const categories = response.data.data || [];
        
        const transformedCategories = categories.map((cat) => ({
          id: cat.id,
          name: cat.ten
        }));
        
        setCategoriesData(transformedCategories);
        if (transformedCategories.length > 0) {
          handleCategoryHover(transformedCategories[0]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [handleCategoryHover]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="bg-white text-gray-800 sticky top-0 z-50 shadow-sm border-b">
      <div className="relative w-full">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-8">
            
            {/* Logo & Category Button */}
            <div className="flex items-center gap-6 relative">
              <Link to="/" className="text-3xl font-bold text-red-600 tracking-tighter">
                Bookstore
              </Link>
              
              <div
                className="relative"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 transition p-2"
                >
                  <LayoutGrid size={28} />
                </button>
              </div>
            </div>

          {/* Mega Menu Dropdown - hiển thị khi hover vào icon danh mục */}
          {isMegaMenuOpen && categoriesData.length > 0 && (
            <div 
              className="fixed top-16 left-0 right-0 w-full bg-white border-b shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <div className="container mx-auto flex h-96">
                {/* Sidebar Danh mục */}
                <div className="w-1/4 border-r py-4 overflow-y-auto bg-gray-50">
                  <h3 className="px-6 py-2 font-bold text-gray-400 text-xs uppercase">Danh mục</h3>
                  {categoriesData.map((cat) => (
                    <div
                      key={cat.id}
                      onMouseEnter={() => handleCategoryHover(cat)}
                      className={`px-6 py-3 flex justify-between items-center cursor-pointer transition text-sm ${activeCategory?.id === cat.id ? 'bg-white text-red-600 font-bold' : 'hover:bg-gray-100'}`}
                    >
                      {cat.name}
                      <ChevronRight size={16} />
                    </div>
                  ))}
                </div>

                {/* Books Grid */}
                <div className="flex-1 p-8 overflow-y-auto bg-white">
                  {loadingBooks ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-400">Đang tải...</div>
                    </div>
                  ) : activeCategoryBooks.length > 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                      {activeCategoryBooks.slice(0, 8).map((book) => (
                        <Link 
                          key={book.id}
                          to={`/products/${book.id}`}
                          className="group text-center hover:shadow-lg transition rounded-lg p-2"
                        >
                          <div className="bg-gray-100 rounded-lg mb-2 h-40 flex items-center justify-center overflow-hidden">
                            {book.hinh_anh ? (
                              <img src={book.hinh_anh} alt={book.ten_sach} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-gray-300 text-2xl">📖</div>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600 transition">
                            {book.ten_sach}
                          </p>
                          <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                            {book.tac_gia}
                          </p>
                          <p className="text-red-600 font-bold text-sm">
                            {Number(book.gia).toLocaleString('vi-VN')}đ
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Không có sách</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar - Phong cách Fahasa */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="w-full flex border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-red-500 transition">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm mong muốn..."
                className="w-full px-4 py-2 outline-none text-sm"
                value={searchTerm}
                onChange={handleSearchInput}
                onFocus={() => searchTerm.trim().length >= 2 && setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              />
              <button type="submit" className="bg-red-600 text-white px-6 py-2 hover:bg-red-700 transition">
                <Search size={20} />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-xl mt-0 z-40 max-h-80 overflow-y-auto">
                {loadingSuggestions ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Đang tìm kiếm...
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <div>
                    {searchSuggestions.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleSuggestionClick(book)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition flex items-center gap-3"
                      >
                        {book.hinh_anh && (
                          <img 
                            src={book.hinh_anh} 
                            alt={book.ten_sach}
                            className="w-8 h-10 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">
                            {book.ten_sach}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {book.tac_gia}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-red-600 flex-shrink-0">
                          {Number(book.gia).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Không tìm thấy sách nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-6 text-gray-500">
            <div className="flex flex-col items-center cursor-pointer hover:text-red-600 transition">
              <Bell size={24} />
              <span className="text-[11px] mt-1">Thông báo</span>
            </div>
            
            <Link to="/cart" className="flex flex-col items-center relative hover:text-red-600 transition">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartCount}</span>
              )}
              <span className="text-[11px] mt-1">Giỏ hàng</span>
            </Link>

            <div 
              className="flex flex-col items-center cursor-pointer hover:text-red-600 transition relative group"
              onMouseEnter={() => setIsUserDropdownOpen(true)}
            >
              <User size={24} />
              <span className="text-[11px] mt-1 text-center line-clamp-1">
                {isAuthenticated ? `Xin chào ${userName || 'bạn'}` : 'Đăng nhập'}
              </span>
              
              {/* Dropdown User */}
              {isUserDropdownOpen && (
                <div 
                  className="absolute top-full right-0 w-56 bg-white shadow-xl border rounded-md p-3 mt-1 z-50"
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      {/* User Info */}
                      <div className="px-2 py-2 border-b mb-2">
                        <p className="text-sm font-semibold text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500">ID: {userId}</p>
                      </div>
                      
                      {/* Options */}
                      <Link to="/profile" className="block p-2 hover:bg-gray-100 rounded text-sm text-gray-700 font-medium">
                        👤 Trang cá nhân
                      </Link>
                      <Link to="/profile/edit" className="block p-2 hover:bg-gray-100 rounded text-sm text-gray-700 font-medium">
                        ✏️ Chỉnh sửa thông tin
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left p-2 hover:bg-red-50 rounded text-sm text-red-600 font-medium border-t mt-2"
                      >
                        🚪 Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block p-2 hover:bg-gray-100 rounded text-sm text-gray-700">Đăng nhập</Link>
                      <Link to="/register" className="block p-2 hover:bg-gray-100 rounded text-sm text-blue-600 border-t mt-1">Đăng ký</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </header>
    );
};

export default Header;