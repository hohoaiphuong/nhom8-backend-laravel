# Frontend User - Bookstore

Frontend người dùng cho ứng dụng bán sách online Bookstore, được xây dựng với React, Vite, Tailwind CSS và React Router.

## 📁 Cấu trúc thư mục

```
src/
├── assets/             # Hình ảnh, icons, fonts, file CSS global
├── components/         # Các thành phần giao diện có thể tái sử dụng
│   ├── common/         # Button, Input, Modal, Loading chuẩn
│   ├── layout/         # Header, Footer
│   └── shared/         # ProductCard và các component dùng chung
├── constants/          # Lưu hằng số: API_URL, STATUS_CODE, MENU_ITEMS
├── hooks/              # Các Custom Hooks
├── layouts/            # Khung giao diện chính (MainLayout)
├── pages/              # Mỗi folder là một tính năng lớn
│   ├── Home/           # Trang chủ
│   ├── Products/       # Danh sách sách
│   ├── ProductDetail/  # Chi tiết sách
│   ├── Cart/           # Giỏ hàng
│   ├── Checkout/       # Thanh toán
│   ├── Account/        # Tài khoản người dùng
│   └── Orders/         # Đơn hàng
├── api/                # API calls (Axios)
│   ├── client.js       # Axios instance
│   ├── bookApi.js      # API sách
│   ├── cartApi.js      # API giỏ hàng
│   ├── categoryApi.js  # API danh mục
│   ├── orderApi.js     # API đơn hàng
│   ├── authApi.js      # API xác thực
│   ├── ratingApi.js    # API đánh giá
│   └── addressApi.js   # API địa chỉ
├── services/           # Quản lý logic nghiệp vụ
├── store/              # Quản lý State toàn cục (nếu cần)
├── utils/              # Các hàm bổ trợ
├── App.jsx             # File root component
├── main.jsx            # Entry point
├── index.css           # Global styles
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── eslint.config.js    # ESLint configuration
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd frontend-user
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5173`

### 3. Build cho production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

## 📦 Dependencies

- **React** 19.2.4 - UI library
- **React Router** 7.14.1 - Client-side routing
- **Tailwind CSS** 4.2.2 - Utility-first CSS framework
- **Axios** 1.15.0 - HTTP client
- **Lucide React** 1.8.0 - Icon library
- **Vite** 8.0.4 - Build tool

## 🎨 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Product listing và filtering
- ✅ Product detail page
- ✅ Shopping cart
- ✅ User authentication
- ✅ Order management
- ✅ Rating & reviews
- ✅ Address management
- ✅ Modern UI with Tailwind CSS

## 🔗 API Integration

Tất cả API calls được quản lý trong thư mục `src/api/`. Axios instance được cấu hình tự động với:
- Base URL từ `http://localhost:8000/api`
- Authorization token từ localStorage
- Error handling cho 401 responses

## 📝 Pages

- **Home** (`/`) - Trang chủ với slider, categories, featured books, bestsellers, testimonials
- **Products** (`/products`) - Danh sách sách với filter và search
- **Product Detail** (`/products/:id`) - Chi tiết sách
- **Cart** (`/cart`) - Giỏ hàng
- **Checkout** (`/checkout`) - Thanh toán (in progress)
- **Account** (`/account`) - Tài khoản người dùng (in progress)
- **Orders** (`/orders`) - Đơn hàng của user (in progress)

## 🛠 Development

Các trang còn lại (Checkout, Account, Orders) sẽ được hoàn thành sau. Bạn có thể tiếp tục phát triển bằng cách:

1. Tạo file component trong thư mục `pages/`
2. Import vào `App.jsx` và thêm route
3. Sử dụng API endpoints từ `api/` folder

## 📝 Notes

- Tất cả components sử dụng Tailwind CSS cho styling
- Lucide React icons được sử dụng cho icons
- Layout sử dụng MainLayout component bao gồm Header, Footer
- Component reusability được ưu tiên
