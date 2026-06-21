import { Link, useNavigate } from 'react-router-dom';
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
const IconUsers = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconShieldCheck = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconShoppingBag = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconCreditCard = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconRotateCcw = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.8"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconBan = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconFileText = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconRefreshCw = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════ */
export default function TermsPage() {
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
          <h1>ĐIỀU KHOẢN DỊCH VỤ</h1>
          <p>Áp dụng từ ngày 01/05/2026 | NamBộ Specialties</p>
        </div>

        {/* 1. Giới thiệu */}
        <div className="terms-section">
          <h3><IconInfo /> 1. GIỚI THIỆU</h3>
          <p>
            Chào mừng bạn đến với NamBộ Specialties - nền tảng thương mại điện tử kết hợp bản đồ số nhằm giới thiệu,
            quảng bá và hỗ trợ mua bán các đặc sản đặc trưng của khu vực miền Nam Việt Nam.
          </p>
          <p>
            Khi truy cập, đăng ký tài khoản, mua hàng, đăng bán sản phẩm hoặc sử dụng bất kỳ chức năng nào trên hệ thống,
            bạn đồng ý tuân thủ các điều khoản dịch vụ được quy định trong văn bản này.
          </p>
          <p>
            NamBộ Specialties đóng vai trò là cầu nối giữa người mua, người bán và các hộ kinh doanh địa phương.
            Hệ thống không trực tiếp sản xuất sản phẩm mà hỗ trợ hiển thị thông tin sản phẩm, địa điểm, bản đồ,
            đơn hàng và các nội dung liên quan đến đặc sản vùng miền.
          </p>
        </div>

        {/* 2. Tài khoản và bảo mật */}
        <div className="terms-section">
          <h3><IconUsers /> 2. TÀI KHOẢN VÀ BẢO MẬT</h3>
          <p>
            Người dùng có thể đăng ký tài khoản để sử dụng các chức năng như mua hàng, quản lý giỏ hàng,
            theo dõi đơn hàng, lưu thông tin giao hàng hoặc đăng ký trở thành người bán.
          </p>
          <ul>
            <li>Người dùng phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản.</li>
            <li>Người dùng có trách nhiệm bảo mật tên đăng nhập, email, số điện thoại và mật khẩu của mình.</li>
            <li>Không được sử dụng tài khoản của người khác hoặc cho người khác sử dụng tài khoản của mình để gian lận.</li>
            <li>Nếu phát hiện tài khoản bị truy cập trái phép, người dùng cần thông báo cho quản trị viên để được hỗ trợ.</li>
          </ul>
        </div>

        {/* 3. Phân quyền */}
        <div className="terms-section">
          <h3><IconShieldCheck /> 3. PHÂN QUYỀN TRÊN HỆ THỐNG</h3>
          <p>Hệ thống NamBộ Specialties phân chia quyền sử dụng theo từng nhóm người dùng:</p>
          <ul>
            <li>
              <strong>Người mua:</strong> Có quyền xem sản phẩm, tìm kiếm đặc sản, xem bản đồ đặc sản,
              thêm sản phẩm vào giỏ hàng, đặt hàng và thanh toán.
            </li>
            <li>
              <strong>Người bán:</strong> Có quyền đăng ký gian hàng, quản lý sản phẩm, cập nhật thông tin đặc sản,
              ghim vị trí cửa hàng trên bản đồ và xử lý đơn hàng.
            </li>
            <li>
              <strong>Quản trị viên:</strong> Có quyền quản lý tài khoản, sản phẩm, danh mục, đơn hàng,
              bản đồ đặc sản, phê duyệt gian hàng và xử lý các vi phạm trên hệ thống.
            </li>
          </ul>
        </div>

        {/* 4. Người mua */}
        <div className="terms-section">
          <h3><IconShoppingBag /> 4. QUY ĐỊNH ĐỐI VỚI NGƯỜI MUA</h3>
          <ul>
            <li>Người mua cần kiểm tra kỹ thông tin sản phẩm, giá bán, mô tả, hình ảnh và nguồn gốc trước khi đặt hàng.</li>
            <li>Người mua phải cung cấp đúng họ tên, số điện thoại, địa chỉ nhận hàng và thông tin thanh toán.</li>
            <li>Không được đặt hàng ảo, hủy đơn liên tục hoặc thực hiện hành vi gây ảnh hưởng đến người bán.</li>
            <li>Người mua có quyền gửi khiếu nại nếu sản phẩm nhận được bị lỗi, sai mô tả hoặc không đúng đơn hàng.</li>
          </ul>
        </div>

        {/* 5. Người bán */}
        <div className="terms-section">
          <h3><IconStore /> 5. QUY ĐỊNH ĐỐI VỚI NGƯỜI BÁN</h3>
          <ul>
            <li>Người bán phải đăng sản phẩm đúng nguồn gốc, đúng mô tả và đúng hình ảnh thực tế.</li>
            <li>Không được đăng bán hàng giả, hàng nhái, hàng kém chất lượng hoặc sản phẩm vi phạm pháp luật.</li>
            <li>Người bán chịu trách nhiệm về chất lượng, giá bán, thông tin sản phẩm và quá trình xử lý đơn hàng.</li>
            <li>Người bán cần cập nhật chính xác vị trí cửa hàng hoặc nơi sản xuất để hỗ trợ hiển thị trên bản đồ đặc sản.</li>
            <li>Người bán phải phối hợp với hệ thống khi có yêu cầu kiểm duyệt, xác minh nguồn gốc hoặc xử lý khiếu nại.</li>
          </ul>
        </div>

        {/* 6. Bản đồ */}
        <div className="terms-section">
          <h3><IconMapPin /> 6. BẢN ĐỒ ĐẶC SẢN VÀ THÔNG TIN VỊ TRÍ</h3>
          <p>
            Bản đồ đặc sản là chức năng hỗ trợ người dùng khám phá các sản phẩm đặc trưng theo từng tỉnh thành,
            khu vực, địa điểm sản xuất hoặc cửa hàng kinh doanh.
          </p>
          <div className="terms-accent-box">
            <p>
              <strong>Dữ liệu mặc định:</strong> Hệ thống có thể hiển thị sẵn một số ghim đặc sản tiêu biểu
              nhằm giới thiệu văn hóa, sản vật và địa danh nổi bật của miền Nam.
            </p>
            <p>
              <strong>Dữ liệu từ người bán:</strong> Khi người bán đăng ký gian hàng, vị trí cửa hàng có thể được gửi lên hệ thống
              và chờ quản trị viên kiểm duyệt trước khi hiển thị công khai.
            </p>
            <p>
              <strong>Kiểm duyệt:</strong> Quản trị viên có quyền chấp nhận, từ chối hoặc chỉnh sửa thông tin vị trí
              nếu dữ liệu không chính xác, sai nguồn gốc hoặc gây hiểu nhầm cho người dùng.
            </p>
          </div>
        </div>

        {/* 7. Thông tin sản phẩm */}
        <div className="terms-section">
          <h3><IconPackage /> 7. THÔNG TIN SẢN PHẨM</h3>
          <p>
            Các thông tin về sản phẩm bao gồm tên đặc sản, hình ảnh, mô tả, giá bán, tỉnh thành, nguồn gốc,
            địa điểm ghim và thông tin người bán được cung cấp nhằm hỗ trợ người dùng tham khảo và mua sắm.
          </p>
          <p>
            NamBộ Specialties khuyến khích người bán cung cấp thông tin trung thực, rõ ràng và minh bạch.
            Trường hợp phát hiện thông tin sai lệch, hệ thống có quyền chỉnh sửa, ẩn hoặc xóa sản phẩm.
          </p>
        </div>

        {/* 8. Đặt hàng và thanh toán */}
        <div className="terms-section">
          <h3><IconCreditCard /> 8. ĐẶT HÀNG VÀ THANH TOÁN</h3>
          <p>
            Khi người mua đặt hàng thành công, hệ thống sẽ ghi nhận thông tin đơn hàng và chuyển đến người bán để xử lý.
            Người mua có thể thanh toán bằng các phương thức được hệ thống hỗ trợ.
          </p>
          <ul>
            <li>Thanh toán khi nhận hàng.</li>
            <li>Thanh toán chuyển khoản ngân hàng.</li>
            <li>Thanh toán trực tuyến qua cổng thanh toán nếu hệ thống có hỗ trợ.</li>
          </ul>
          <p>
            Người mua cần kiểm tra kỹ thông tin thanh toán trước khi xác nhận đơn hàng.
            Hệ thống không chịu trách nhiệm đối với các giao dịch thực hiện ngoài nền tảng.
          </p>
        </div>

        {/* 9. Vận chuyển */}
        <div className="terms-section">
          <h3><IconTruck /> 9. VẬN CHUYỂN VÀ GIAO HÀNG</h3>
          <p>
            Người bán có trách nhiệm chuẩn bị hàng hóa, đóng gói sản phẩm và phối hợp với đơn vị vận chuyển
            để giao hàng cho người mua.
          </p>
          <ul>
            <li>Thời gian giao hàng có thể thay đổi tùy theo khu vực, loại sản phẩm và điều kiện vận chuyển.</li>
            <li>Người bán cần đảm bảo sản phẩm được đóng gói phù hợp, đặc biệt với thực phẩm, hàng dễ vỡ hoặc hàng cần bảo quản.</li>
            <li>Người mua cần kiểm tra hàng khi nhận và phản hồi kịp thời nếu có vấn đề phát sinh.</li>
          </ul>
        </div>

        {/* 10. Hủy đơn */}
        <div className="terms-section">
          <h3><IconRotateCcw /> 10. HỦY ĐƠN, ĐỔI TRẢ VÀ HOÀN TIỀN</h3>
          <p>
            Người mua có thể gửi yêu cầu hủy đơn, đổi trả hoặc hoàn tiền trong các trường hợp hợp lý.
            Hệ thống sẽ hỗ trợ ghi nhận và chuyển yêu cầu đến người bán để xử lý.
          </p>
          <ul>
            <li>Sản phẩm bị lỗi, hư hỏng trong quá trình vận chuyển.</li>
            <li>Sản phẩm không đúng mô tả, sai số lượng hoặc sai đơn hàng.</li>
            <li>Sản phẩm có dấu hiệu kém chất lượng hoặc không đảm bảo như cam kết.</li>
            <li>Đơn hàng chưa được xử lý hoặc chưa bàn giao cho đơn vị vận chuyển.</li>
          </ul>
        </div>

        {/* 11. Bảo mật */}
        <div className="terms-section">
          <h3><IconLock /> 11. BẢO MẬT THÔNG TIN</h3>
          <p>
            NamBộ Specialties cam kết bảo vệ thông tin cá nhân của người dùng.
            Các thông tin như họ tên, số điện thoại, email, địa chỉ giao hàng, lịch sử đơn hàng
            và thông tin tài khoản chỉ được sử dụng cho mục đích vận hành hệ thống.
          </p>
          <ul>
            <li>Xử lý đơn hàng và giao hàng.</li>
            <li>Hỗ trợ chăm sóc khách hàng.</li>
            <li>Quản lý tài khoản và xác minh người dùng.</li>
            <li>Cải thiện chất lượng dịch vụ và trải nghiệm sử dụng.</li>
          </ul>
        </div>

        {/* 12. Hành vi bị cấm */}
        <div className="terms-section">
          <h3><IconBan /> 12. HÀNH VI BỊ CẤM</h3>
          <ul>
            <li>Đăng tải nội dung sai sự thật, xúc phạm, phản cảm hoặc gây hiểu nhầm.</li>
            <li>Đăng bán sản phẩm vi phạm pháp luật, hàng giả, hàng nhái hoặc hàng không rõ nguồn gốc.</li>
            <li>Gian lận đơn hàng, gian lận thanh toán hoặc lợi dụng khuyến mãi.</li>
            <li>Can thiệp, phá hoại, tấn công hoặc làm gián đoạn hoạt động của hệ thống.</li>
            <li>Sử dụng hình ảnh, thương hiệu, nội dung của người khác khi chưa được phép.</li>
            <li>Cố tình ghim sai vị trí bản đồ nhằm đánh lừa người mua hoặc quảng bá sai nguồn gốc sản phẩm.</li>
          </ul>
        </div>

        {/* 13. Xử lý vi phạm */}
        <div className="terms-section">
          <h3><IconAlertTriangle /> 13. XỬ LÝ VI PHẠM</h3>
          <p>
            Khi phát hiện người dùng vi phạm điều khoản dịch vụ, NamBộ Specialties có quyền áp dụng một hoặc nhiều biện pháp xử lý.
          </p>
          <ul>
            <li>Ẩn hoặc xóa sản phẩm vi phạm.</li>
            <li>Tạm khóa hoặc khóa vĩnh viễn tài khoản.</li>
            <li>Từ chối phê duyệt gian hàng hoặc vị trí bản đồ.</li>
            <li>Hủy đơn hàng có dấu hiệu gian lận.</li>
            <li>Chuyển thông tin cho cơ quan có thẩm quyền nếu hành vi có dấu hiệu vi phạm pháp luật.</li>
          </ul>
        </div>

        {/* 14. Quyền sở hữu nội dung */}
        <div className="terms-section">
          <h3><IconFileText /> 14. QUYỀN SỞ HỮU NỘI DUNG</h3>
          <p>
            Nội dung, giao diện, hình ảnh, biểu tượng, dữ liệu bản đồ, mô tả sản phẩm và các tài nguyên hiển thị trên hệ thống
            thuộc quyền quản lý của NamBộ Specialties hoặc người dùng đã cung cấp nội dung đó.
          </p>
          <p>
            Người dùng không được sao chép, sử dụng lại, chỉnh sửa hoặc phân phối nội dung trên hệ thống
            cho mục đích thương mại khi chưa có sự đồng ý của bên sở hữu.
          </p>
        </div>

        {/* 15. Thay đổi điều khoản */}
        <div className="terms-section">
          <h3><IconRefreshCw /> 15. THAY ĐỔI ĐIỀU KHOẢN</h3>
          <p>
            NamBộ Specialties có quyền cập nhật, chỉnh sửa hoặc bổ sung điều khoản dịch vụ để phù hợp với hoạt động thực tế
            của hệ thống và quy định pháp luật hiện hành.
          </p>
          <p>
            Người dùng nên thường xuyên theo dõi trang điều khoản để cập nhật các thay đổi mới nhất.
            Việc tiếp tục sử dụng hệ thống sau khi điều khoản được cập nhật được hiểu là người dùng đã đồng ý với nội dung thay đổi.
          </p>
        </div>

      </div>
    </main>
  );
}
