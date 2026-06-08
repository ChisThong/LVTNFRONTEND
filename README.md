Frontend (ReactJS)

Di chuyển vào thư mục frontend:

cd marketplace-frontend

Cài đặt thư viện:

npm install

Khởi động ứng dụng:

npm run dev

Frontend sẽ chạy tại:

http://localhost:5173
3. Đăng ký tài khoản
Bước 1

Truy cập:

http://localhost:5173/register

Điền đầy đủ thông tin:

Họ tên
Email
Mật khẩu
Địa chỉ
Số điện thoại
Vai trò (Người mua hoặc Người bán)
Bước 2

Nhấn nút Đăng ký.

Hệ thống sẽ:

Tạo tài khoản mới
Sinh mã OTP
Gửi OTP đến email đã đăng ký
Bước 3

Nhập mã OTP nhận được từ email để xác thực tài khoản.

Bước 4

Sau khi xác thực thành công, tài khoản sẽ được kích hoạt.

4. Đăng nhập

Truy cập:

http://localhost:5173/login

Nhập:

Email
Mật khẩu

Nhấn Đăng nhập.

Hệ thống sẽ cấp Access Token và chuyển người dùng đến giao diện phù hợp với vai trò.

5. Chức năng Người mua

Người mua có thể:

Xem danh sách đặc sản
Tìm kiếm sản phẩm
Xem chi tiết sản phẩm
Thêm sản phẩm vào giỏ hàng
Đặt hàng
Theo dõi đơn hàng
Xem nguồn gốc đặc sản trên bản đồ
6. Chức năng Người bán

Người bán có thể:

Quản lý gian hàng
Đăng sản phẩm mới
Cập nhật thông tin sản phẩm
Quản lý tồn kho
Xem danh sách đơn hàng
Theo dõi doanh thu
7. Chức năng Quản trị viên

Quản trị viên có thể:

Quản lý người dùng
Quản lý danh mục
Duyệt sản phẩm
Duyệt gian hàng
Quản lý nội dung bản đồ
Theo dõi báo cáo thống kê
8. Khắc phục lỗi thường gặp
Lỗi không kết nối được API

Thông báo:

ERR_CONNECTION_REFUSED

Nguyên nhân:

Backend Laravel chưa chạy.

Khắc phục:

php artisan serve
Lỗi không gửi được OTP

Kiểm tra cấu hình SMTP trong file .env:

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=ssl

Sau đó chạy:

php artisan optimize:clear