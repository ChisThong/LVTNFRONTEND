# 🛒 Marketplace Đặc Sản Nam Bộ

Nền tảng thương mại điện tử chuyên về đặc sản vùng Nam Bộ — kết nối người mua và người bán địa phương, tích hợp bản đồ đặc sản, thanh toán VNPay, và ví điện tử.

---

## 📋 Mục lục

- [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)
  - [Backend (Laravel)](#1-backend-laravel)
  - [Frontend (React)](#2-frontend-react)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Tính năng chính](#-tính-năng-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [API Overview](#-api-overview)
- [Phân quyền người dùng](#-phân-quyền-người-dùng)
- [Thanh toán VNPay](#-thanh-toán-vnpay)
- [Scripts hữu ích](#-scripts-hữu-ích)

---

## 🏗 Tổng quan kiến trúc

```
lvtn/
├── marketplace-backend/    # Laravel 12 — REST API
└── marketplace-frontend/   # React 19 + Vite — SPA
```

| Thành phần | Công nghệ | Cổng mặc định |
|---|---|---|
| Backend API | Laravel 12 + Sanctum | `http://127.0.0.1:8000` |
| Frontend | React 19 + Vite | `http://localhost:5173` |
| Database | MySQL (XAMPP) | `127.0.0.1:3307` |

---

## ⚙️ Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |
| MySQL | 5.7+ / 8.0+ |
| XAMPP | Bất kỳ (dùng MySQL) |

---

## 🚀 Cài đặt & Khởi chạy

### 1. Backend (Laravel)

```bash
# Di chuyển vào thư mục backend
cd marketplace-backend

# Cài đặt dependencies PHP
composer install

# Sao chép file cấu hình
copy .env.example .env

# Tạo Application Key
php artisan key:generate

# Chạy migration tạo bảng database
php artisan migrate

# (Tuỳ chọn) Seeder dữ liệu mẫu
php artisan db:seed

# Tạo storage link (ảnh sản phẩm)
php artisan storage:link

# Khởi động server
php artisan serve
```

> ✅ Backend sẽ chạy tại: `http://127.0.0.1:8000`

---

### 2. Frontend (React)

```bash
# Di chuyển vào thư mục frontend
cd marketplace-frontend

# Cài đặt dependencies
npm install

# Khởi động dev server
npm run dev
```

> ✅ Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔧 Cấu hình môi trường

### Backend — `marketplace-backend/.env`

```env
# Thông tin ứng dụng
APP_NAME=Laravel
APP_ENV=local
APP_KEY=         # Tự động tạo sau khi chạy: php artisan key:generate
APP_URL=http://127.0.0.1:8000

# Database (MySQL qua XAMPP)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307      # Cổng MySQL của XAMPP (mặc định 3307 hoặc 3306)
DB_DATABASE=lvtn  # Tên database (tạo thủ công trên phpMyAdmin)
DB_USERNAME=root
DB_PASSWORD=      # Để trống nếu XAMPP không đặt mật khẩu

# Email (Gmail SMTP — cần tạo App Password)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=your_email@gmail.com
MAIL_FROM_NAME="NamBo Specialties"

# VNPay Sandbox
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_TMN_CODE=YOUR_TMN_CODE
VNP_HASH_SECRET=YOUR_HASH_SECRET
VNP_RETURN_URL=https://your-ngrok-url.ngrok-free.app/vnpay-return
VNP_IPN_URL=https://your-ngrok-url.ngrok-free.app/api/vnpay/ipn
VNP_FRONTEND_RETURN_URL=http://localhost:5173/thanh-toan-thanh-cong

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Frontend — `marketplace-frontend/.env`

```env
# URL Backend Laravel (KHÔNG có dấu / ở cuối)
VITE_BACKEND_URL=http://127.0.0.1:8000

# URL API (dùng bởi axiosClient)
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## ✨ Tính năng chính

### 👤 Người mua (NguoiMua)
- Đăng ký / Đăng nhập bằng email + OTP hoặc **Google OAuth2**
- Duyệt & tìm kiếm sản phẩm đặc sản
- Xem **bản đồ đặc sản** theo vùng miền Nam Bộ
- Thêm vào giỏ hàng, đặt hàng
- Thanh toán qua **VNPay** hoặc **ví điện tử**
- Theo dõi đơn hàng, xác nhận nhận hàng
- Đánh giá sản phẩm và shop
- Chat trực tiếp với shop

### 🏪 Người bán (NguoiBan)
- Đăng ký shop (chờ Admin duyệt)
- Quản lý sản phẩm (thêm, sửa, xoá, upload ảnh)
- Xem và xử lý đơn hàng theo trạng thái
- Dashboard thống kê doanh thu theo thời gian
- Quản lý ví & rút tiền
- Phản hồi đánh giá của khách
- Nhận thông báo realtime qua Pusher

### 🔑 Admin
- Dashboard tổng quan toàn hệ thống
- Duyệt / từ chối đăng ký shop
- Quản lý & kiểm duyệt sản phẩm (ẩn, khôi phục, duyệt)
- Quản lý đơn hàng toàn hệ thống
- Quản lý người dùng (khoá / mở tài khoản)
- Quản lý bài viết câu chuyện sản vật
- Quản lý dữ liệu bản đồ đặc sản
- Thống kê doanh thu toàn hệ thống
- Xử lý yêu cầu rút tiền của shop

---

## 📁 Cấu trúc thư mục

### Backend

```
marketplace-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                   # Đăng ký, đăng nhập, OTP, Google OAuth
│   │   │   ├── ProductController.php   # CRUD sản phẩm
│   │   │   ├── ShopController.php      # Quản lý shop
│   │   │   ├── DonHangController.php   # Đơn hàng người mua
│   │   │   ├── VNPayController.php     # Thanh toán VNPay
│   │   │   ├── WalletController.php    # Ví điện tử
│   │   │   ├── ChatController.php      # Chat realtime
│   │   │   ├── DanhGiaController.php   # Đánh giá sản phẩm
│   │   │   ├── AdminProductController  # Admin quản lý SP
│   │   │   ├── AdminDonHangController  # Admin quản lý ĐH
│   │   │   ├── AdminWalletController   # Admin quản lý ví
│   │   │   ├── ThongKeController.php   # Thống kê doanh thu
│   │   │   ├── DashboardController.php # Dashboard các role
│   │   │   └── NguoiDungController.php # Quản lý người dùng
│   │   └── Middleware/                 # Auth, Role check, Status check
│   ├── Models/                         # Eloquent Models
│   └── Events/                         # Pusher Events (realtime)
├── database/
│   └── migrations/                     # Lịch sử tạo bảng
├── routes/
│   └── api.php                         # Toàn bộ API routes
└── .env                                # Cấu hình môi trường
```

### Frontend

```
marketplace-frontend/
├── src/
│   ├── api/                   # Axios API calls
│   ├── components/            # UI Components tái sử dụng
│   ├── context/               # React Context (Auth, Cart...)
│   ├── pages/
│   │   ├── Home.jsx           # Trang chủ
│   │   ├── Login.jsx          # Đăng nhập
│   │   ├── Register.jsx       # Đăng ký
│   │   ├── BanDoDacSan.jsx    # Bản đồ đặc sản (MapLibre GL)
│   │   ├── products/          # Danh sách & chi tiết sản phẩm
│   │   ├── cart/              # Giỏ hàng
│   │   ├── checkout/          # Thanh toán
│   │   ├── orders/            # Đơn hàng
│   │   ├── seller/            # Trang người bán
│   │   ├── shops/             # Trang shop
│   │   ├── wallet/            # Ví điện tử
│   │   ├── account/           # Tài khoản cá nhân
│   │   └── Admin/             # Trang Admin
│   ├── App.jsx                # Router chính
│   └── main.jsx               # Entry point
├── .env                       # Biến môi trường frontend
└── vite.config.js
```

---

## 🔌 API Overview

**Base URL:** `http://127.0.0.1:8000/api`  
**Authentication:** Bearer Token (Laravel Sanctum)

### Public — Không cần đăng nhập

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/google` | Đăng nhập bằng Google |
| POST | `/auth/verify-otp` | Xác thực OTP email |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/products` | Danh sách sản phẩm |
| GET | `/products/{id}` | Chi tiết sản phẩm |
| GET | `/shops/{id}` | Thông tin shop |
| GET | `/phan-loai` | Danh mục phân loại |
| GET | `/bando` | Dữ liệu bản đồ đặc sản |
| GET | `/tintuc` | Tin tức / bài viết |

### Protected — Cần Bearer Token

| Method | Endpoint | Role | Mô tả |
|---|---|---|---|
| GET | `/me` | Tất cả | Thông tin tài khoản |
| POST | `/auth/logout` | Tất cả | Đăng xuất |
| POST | `/don-hang` | NguoiMua | Đặt hàng |
| GET | `/don-hang` | Tất cả | Danh sách đơn hàng |
| PUT | `/orders/{id}/cancel` | NguoiMua | Huỷ đơn hàng |
| POST | `/reviews` | NguoiMua | Gửi đánh giá |
| POST | `/vnpay/create-payment` | Tất cả | Tạo link thanh toán VNPay |
| GET | `/wallet` | Tất cả | Thông tin ví |
| POST | `/withdrawals` | NguoiBan | Yêu cầu rút tiền |
| GET | `/seller/dashboard` | NguoiBan | Dashboard người bán |
| GET | `/seller/orders` | NguoiBan | Đơn hàng của shop |
| GET | `/admin/dashboard` | Admin | Dashboard tổng quan |
| GET | `/admin/shops` | Admin | Quản lý shop |
| GET | `/admin/Nguoidung` | Admin | Quản lý người dùng |

---

## 👥 Phân quyền người dùng

| Role | ID | Mô tả | Quyền hạn |
|---|---|---|---|
| **Admin** | 1 | Quản trị viên | Toàn bộ hệ thống |
| **NguoiMua** | 2 | Người mua hàng | Đặt hàng, đánh giá, ví |
| **NguoiBan** | 3 | Người bán / Shop | Quản lý sản phẩm, đơn hàng, thống kê |

> **Lưu ý:** Người đăng ký mặc định là **NguoiMua**. Muốn trở thành **NguoiBan**, cần đăng ký shop và chờ Admin duyệt.

---

## 💳 Thanh toán VNPay

Dự án sử dụng **VNPay Sandbox** để thử nghiệm thanh toán online.

### ⚠️ Bắt buộc dùng ngrok để test VNPay

VNPay cần gọi callback về server thật (không dùng được `localhost`). Cần expose port 8000 ra internet:

```bash
# Cài ngrok tại: https://ngrok.com/download
ngrok http 8000
```

Sau đó cập nhật file `.env` backend với URL ngrok mới:

```env
VNP_RETURN_URL=https://your-ngrok-url.ngrok-free.app/vnpay-return
VNP_IPN_URL=https://your-ngrok-url.ngrok-free.app/api/vnpay/ipn
```

### Thẻ test VNPay Sandbox (NCB)

| Thông tin | Giá trị |
|---|---|
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | `NGUYEN VAN A` |
| Ngày phát hành | `07/15` |
| OTP xác nhận | `123456` |

---

## 🛠 Scripts hữu ích

### Backend

```bash
# Chạy tất cả trong một (server + queue + logs + vite)
composer run dev

# Chỉ chạy server API
php artisan serve

# Migrate database
php artisan migrate

# Rollback migration gần nhất
php artisan migrate:rollback

# Xoá tất cả cache
php artisan cache:clear && php artisan config:clear && php artisan route:clear

# Xem danh sách route
php artisan route:list

# Chạy queue worker
php artisan queue:listen
```

### Frontend

```bash
# Dev server (hot reload)
npm run dev

# Build production
npm run build

# Preview bản build
npm run preview

# Kiểm tra lỗi code
npm run lint
```

---

## 🔄 Luồng hoạt động điển hình

**Người mua:**
```
Đăng ký → Xác thực OTP qua Email → Đăng nhập → Duyệt sản phẩm
→ Thêm giỏ hàng → Đặt hàng → Thanh toán VNPay/Ví
→ Theo dõi đơn → Xác nhận nhận hàng → Đánh giá
```

**Người bán:**
```
Đăng ký tài khoản → Đăng ký shop → Admin duyệt shop
→ Thêm sản phẩm → Nhận đơn hàng → Xử lý & giao hàng
→ Tiền vào ví → Rút tiền
```

---

> Dự án **Luận văn tốt nghiệp** — Được xây dựng với ❤️ bằng Laravel 12 + React 19
