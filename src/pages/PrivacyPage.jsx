import { useNavigate } from 'react-router-dom';
import '../styles/terms.css';

/* ── SVG Icons (inline, không cần Lucide) ── */
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IconDatabase = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l-1.41 1.41M19.07 19.07l-1.41-1.41M4.93 4.93l1.41 1.41M22 12h-2M4 12H2M12 22v-2M12 4V2"/>
  </svg>
);
const IconCookie = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
  </svg>
);
const IconShare2 = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconUserCheck = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
  </svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBaby = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M12 2a4 4 0 0 1 4 4v4H8V6a4 4 0 0 1 4-4z"/><path d="M8 10v2a4 4 0 0 0 8 0v-2"/><path d="M3 21c0-4.4 3.6-8 9-8s9 3.6 9 8"/>
  </svg>
);
const IconExternalLink = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IconRefreshCw = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════ */
export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <main style={{ backgroundColor: '#f7fafc', paddingTop: '20px', minHeight: '80vh' }}>
      <div className="terms-container">

        {/* Nút quay lại */}
        <button onClick={() => navigate(-1)} className="back-to-home" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <IconArrowLeft /> Quay lại trang trước
        </button>

        {/* Header */}
        <div className="terms-header">
          <h1>CHÍNH SÁCH BẢO MẬT</h1>
          <p>Áp dụng từ ngày 01/05/2026 | NamBộ Specialties</p>
        </div>

        {/* 1. Giới thiệu */}
        <div className="terms-section">
          <h3><IconInfo /> 1. GIỚI THIỆU</h3>
          <p>
            NamBộ Specialties tôn trọng quyền riêng tư và cam kết bảo vệ thông tin cá nhân
            của người dùng khi sử dụng website thương mại điện tử kết hợp bản đồ số đặc sản miền Nam.
          </p>
          <p>
            Chính sách bảo mật này giải thích cách hệ thống thu thập, sử dụng, lưu trữ và bảo vệ
            thông tin của người mua, người bán và các tài khoản liên quan.
          </p>
          <p>
            Khi truy cập, đăng ký tài khoản, đặt hàng, đăng bán sản phẩm hoặc sử dụng các chức năng
            trên website, bạn đồng ý với nội dung được quy định trong chính sách này.
          </p>
        </div>

        {/* 2. Thông tin thu thập */}
        <div className="terms-section">
          <h3><IconDatabase /> 2. THÔNG TIN HỆ THỐNG THU THẬP</h3>
          <p>NamBộ Specialties có thể thu thập các nhóm thông tin sau:</p>
          <ul>
            <li>Họ và tên người dùng.</li>
            <li>Email, số điện thoại, tên đăng nhập và mật khẩu đã mã hóa.</li>
            <li>Địa chỉ giao hàng, địa chỉ cửa hàng hoặc địa chỉ cơ sở sản xuất.</li>
            <li>Thông tin đơn hàng, sản phẩm đã mua, sản phẩm đã đăng bán.</li>
            <li>Thông tin thanh toán như phương thức thanh toán, trạng thái thanh toán.</li>
            <li>Thông tin vị trí bản đồ do người bán cung cấp như tọa độ, tỉnh thành, khu vực kinh doanh.</li>
            <li>Dữ liệu truy cập như trình duyệt, thiết bị, thời gian truy cập và hành vi sử dụng website.</li>
          </ul>
        </div>

        {/* 3. Khi nào thu thập */}
        <div className="terms-section">
          <h3><IconUserPlus /> 3. KHI NÀO CHÚNG TÔI THU THẬP THÔNG TIN</h3>
          <p>Thông tin cá nhân có thể được thu thập trong các trường hợp sau:</p>
          <ul>
            <li>Khi người dùng đăng ký hoặc đăng nhập tài khoản.</li>
            <li>Khi người mua đặt hàng, thanh toán hoặc gửi yêu cầu hỗ trợ.</li>
            <li>Khi người bán đăng ký gian hàng, đăng sản phẩm hoặc ghim vị trí trên bản đồ.</li>
            <li>Khi người dùng cập nhật hồ sơ cá nhân, địa chỉ giao hàng hoặc thông tin cửa hàng.</li>
            <li>Khi người dùng gửi đánh giá, phản hồi, khiếu nại hoặc liên hệ với quản trị viên.</li>
            <li>Khi người dùng truy cập website và hệ thống ghi nhận dữ liệu kỹ thuật để cải thiện trải nghiệm.</li>
          </ul>
        </div>

        {/* 4. Thông tin vị trí */}
        <div className="terms-section">
          <h3><IconMapPin /> 4. THÔNG TIN VỊ TRÍ VÀ BẢN ĐỒ</h3>
          <p>
            Do NamBộ Specialties có chức năng bản đồ số đặc sản, hệ thống có thể thu thập và xử lý
            thông tin vị trí do người bán cung cấp nhằm hiển thị cửa hàng, vùng đặc sản hoặc địa điểm sản xuất.
          </p>
          <div className="terms-accent-box">
            <p>
              <strong>Đối với người bán:</strong> vị trí cửa hàng hoặc cơ sở kinh doanh có thể được hiển thị công khai
              sau khi được quản trị viên kiểm duyệt.
            </p>
            <p>
              <strong>Đối với người mua:</strong> hệ thống không tự ý công khai địa chỉ cá nhân của người mua.
              Địa chỉ giao hàng chỉ được sử dụng để xử lý đơn hàng.
            </p>
            <p>
              <strong>Dữ liệu bản đồ:</strong> được dùng để hỗ trợ tìm kiếm đặc sản, định vị shop và quảng bá sản phẩm địa phương.
            </p>
          </div>
        </div>

        {/* 5. Mục đích sử dụng */}
        <div className="terms-section">
          <h3><IconSettings /> 5. MỤC ĐÍCH SỬ DỤNG THÔNG TIN</h3>
          <p>Thông tin người dùng được sử dụng cho các mục đích sau:</p>
          <ul>
            <li>Tạo và quản lý tài khoản người dùng.</li>
            <li>Xử lý đơn hàng, giao hàng, thanh toán và hoàn tiền.</li>
            <li>Hỗ trợ người bán quản lý gian hàng, sản phẩm và vị trí bản đồ.</li>
            <li>Hỗ trợ người mua tìm kiếm, mua sắm và theo dõi đơn hàng.</li>
            <li>Liên hệ chăm sóc khách hàng, xử lý khiếu nại và phản hồi.</li>
            <li>Kiểm duyệt sản phẩm, gian hàng và thông tin nguồn gốc đặc sản.</li>
            <li>Phát hiện, ngăn chặn hành vi gian lận, giả mạo hoặc phá hoại hệ thống.</li>
            <li>Cải thiện giao diện, chức năng và chất lượng dịch vụ của website.</li>
          </ul>
        </div>

        {/* 6. Cookie */}
        <div className="terms-section">
          <h3><IconCookie /> 6. COOKIE VÀ DỮ LIỆU TRUY CẬP</h3>
          <p>
            Website có thể sử dụng cookie hoặc công nghệ tương tự để ghi nhớ phiên đăng nhập,
            lưu trạng thái giỏ hàng, cải thiện tốc độ tải trang và cá nhân hóa trải nghiệm sử dụng.
          </p>
          <p>
            Người dùng có thể tắt cookie trong trình duyệt. Tuy nhiên, một số chức năng như đăng nhập,
            giỏ hàng hoặc lưu tùy chọn có thể hoạt động không đầy đủ nếu cookie bị vô hiệu hóa.
          </p>
        </div>

        {/* 7. Chia sẻ */}
        <div className="terms-section">
          <h3><IconShare2 /> 7. CHIA SẺ THÔNG TIN VỚI BÊN THỨ BA</h3>
          <p>
            NamBộ Specialties không bán thông tin cá nhân của người dùng cho bên thứ ba.
            Tuy nhiên, một số thông tin cần thiết có thể được chia sẻ trong phạm vi phục vụ giao dịch.
          </p>
          <ul>
            <li>Chia sẻ địa chỉ giao hàng cho người bán hoặc đơn vị vận chuyển để xử lý đơn hàng.</li>
            <li>Chia sẻ thông tin thanh toán cần thiết cho cổng thanh toán nếu hệ thống có tích hợp.</li>
            <li>Chia sẻ thông tin khi có yêu cầu hợp pháp từ cơ quan có thẩm quyền.</li>
            <li>Chia sẻ dữ liệu kỹ thuật ẩn danh để phân tích, thống kê và cải thiện hệ thống.</li>
          </ul>
        </div>

        {/* 8. Bảo vệ và lưu trữ */}
        <div className="terms-section">
          <h3><IconLock /> 8. BẢO VỆ VÀ LƯU TRỮ THÔNG TIN</h3>
          <p>
            Hệ thống áp dụng các biện pháp bảo mật phù hợp để hạn chế truy cập trái phép,
            mất mát, rò rỉ hoặc thay đổi dữ liệu người dùng.
          </p>
          <ul>
            <li>Mật khẩu người dùng được lưu dưới dạng mã hóa hoặc băm.</li>
            <li>Thông tin nhạy cảm chỉ được truy cập bởi tài khoản có phân quyền phù hợp.</li>
            <li>Dữ liệu đơn hàng và tài khoản được lưu trữ nhằm phục vụ quản lý hệ thống.</li>
            <li>Hệ thống có thể ghi nhận nhật ký hoạt động để kiểm tra và xử lý sự cố.</li>
          </ul>
          <p>
            Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ dữ liệu nào an toàn tuyệt đối.
            Người dùng cần tự bảo vệ tài khoản và không chia sẻ mật khẩu cho người khác.
          </p>
        </div>

        {/* 9. Quyền của người dùng */}
        <div className="terms-section">
          <h3><IconUserCheck /> 9. QUYỀN CỦA NGƯỜI DÙNG</h3>
          <p>Người dùng có các quyền sau đối với thông tin cá nhân của mình:</p>
          <ul>
            <li>Yêu cầu xem lại thông tin cá nhân đã cung cấp.</li>
            <li>Yêu cầu chỉnh sửa thông tin sai hoặc chưa đầy đủ.</li>
            <li>Yêu cầu xóa tài khoản nếu không còn nhu cầu sử dụng.</li>
            <li>Yêu cầu hạn chế một số hình thức xử lý dữ liệu trong phạm vi hệ thống cho phép.</li>
            <li>Gửi khiếu nại nếu phát hiện thông tin cá nhân bị sử dụng sai mục đích.</li>
          </ul>
        </div>

        {/* 10. Trách nhiệm người bán */}
        <div className="terms-section">
          <h3><IconStore /> 10. TRÁCH NHIỆM CỦA NGƯỜI BÁN</h3>
          <p>
            Người bán có thể tiếp cận một số thông tin cần thiết của người mua để xử lý đơn hàng.
            Người bán có trách nhiệm bảo mật các thông tin này và chỉ sử dụng cho mục đích giao dịch.
          </p>
          <ul>
            <li>Không được sử dụng thông tin người mua để quảng cáo ngoài hệ thống khi chưa được đồng ý.</li>
            <li>Không được tiết lộ số điện thoại, địa chỉ hoặc thông tin đơn hàng cho bên không liên quan.</li>
            <li>Không được lưu trữ, mua bán hoặc khai thác dữ liệu người mua trái phép.</li>
            <li>Phải thông báo cho quản trị viên nếu phát hiện rò rỉ hoặc mất dữ liệu.</li>
          </ul>
        </div>

        {/* 11. Thông tin trẻ em */}
        <div className="terms-section">
          <h3><IconBaby /> 11. THÔNG TIN TRẺ EM</h3>
          <p>
            Website không hướng đến việc thu thập dữ liệu cá nhân của trẻ em dưới 13 tuổi.
            Trường hợp người dùng chưa đủ tuổi sử dụng dịch vụ, cần có sự đồng ý hoặc giám sát
            của cha mẹ hoặc người giám hộ hợp pháp.
          </p>
        </div>

        {/* 12. Liên kết bên thứ ba */}
        <div className="terms-section">
          <h3><IconExternalLink /> 12. LIÊN KẾT BÊN THỨ BA</h3>
          <p>
            Website có thể chứa liên kết đến các trang, bản đồ, cổng thanh toán hoặc dịch vụ bên thứ ba.
            NamBộ Specialties không chịu trách nhiệm về chính sách bảo mật, nội dung hoặc cách xử lý dữ liệu
            của các website bên ngoài.
          </p>
          <p>
            Người dùng nên đọc kỹ chính sách của bên thứ ba trước khi cung cấp thông tin cá nhân.
          </p>
        </div>

        {/* 13. Thay đổi chính sách */}
        <div className="terms-section">
          <h3><IconRefreshCw /> 13. THAY ĐỔI CHÍNH SÁCH</h3>
          <p>
            NamBộ Specialties có quyền cập nhật, chỉnh sửa hoặc bổ sung chính sách bảo mật
            để phù hợp với hoạt động của hệ thống và quy định pháp luật hiện hành.
          </p>
          <p>
            Khi chính sách được thay đổi, nội dung mới sẽ được cập nhật trên website.
            Việc tiếp tục sử dụng hệ thống sau khi chính sách thay đổi được hiểu là người dùng đã đồng ý
            với nội dung cập nhật.
          </p>
        </div>

        {/* 14. Liên hệ */}
        <div className="terms-section">
          <h3><IconMail /> 14. LIÊN HỆ</h3>
          <p>
            Nếu có thắc mắc, yêu cầu chỉnh sửa dữ liệu hoặc khiếu nại liên quan đến chính sách bảo mật,
            người dùng có thể liên hệ với ban quản trị NamBộ Specialties.
          </p>
          <ul>
            <li>Email hỗ trợ: support@nambospecialties.vn</li>
            <li>Website: NamBộ Specialties</li>
            <li>Thời gian phản hồi: Trong giờ hành chính hoặc theo lịch xử lý của hệ thống.</li>
          </ul>
        </div>

      </div>
    </main>
  );
}
