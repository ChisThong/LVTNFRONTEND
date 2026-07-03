import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import '../styles/about.css';
import langNgheImg from '../assets/lang-nghe-banh-trang-trang-bang-net-dep-truyen-thong-cua-nguoi-dan-nam-bo-01-1661881528.webp';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="fade-in">Kết Nối Tinh Hoa Phương Nam</h1>
          <p className="fade-in-delay">
            Hành trình gìn giữ bản sắc văn hóa và thúc đẩy kinh tế địa phương thông qua công nghệ số.
          </p>
        </div>
      </section>

      {/* Sứ mệnh & Mục tiêu */}
      <section id="mission" className="about-detail-section">
        <div className="about-container">
          <div className="about-text">
            <span className="badge-small">Sứ mệnh & Mục tiêu</span>
            <h2>Thúc đẩy kinh tế địa phương qua chuyển đổi số</h2>
            <p>
              NamBộ Specialties ra đời với mục tiêu cốt lõi là hỗ trợ các hộ kinh doanh nhỏ lẻ và làng nghề
              truyền thống tại Miền Nam tiếp cận với nền tảng thương mại điện tử hiện đại.
            </p>
            <p>
              Chúng tôi không chỉ bán sản phẩm, mà còn cung cấp giải pháp số hóa toàn diện: từ quản lý gian
              hàng, tối ưu hóa vận chuyển đến quảng bá thương hiệu. Qua đó, góp phần thúc đẩy kinh tế vùng và
              tạo ra sinh kế bền vững cho người dân địa phương.
            </p>
          </div>
          <div className="about-image">
            <img src={langNgheImg} alt="Phát triển địa phương" />
          </div>
        </div>
      </section>

      {/* Câu chuyện văn hóa */}
      <section id="culture-story" className="about-detail-section bg-warm">
        <div className="about-container reverse">
          <div className="about-text">
            <span className="badge-small">Câu chuyện văn hóa</span>
            <h2>Bản sắc Việt trong từng hương vị đặc sản</h2>
            <p>
              Miền Nam Việt Nam là một vùng đất kỳ diệu với sự phong phú về sản vật và chiều sâu văn hóa ẩm
              thực. Từ vị ngọt thanh của kẹo dừa Bến Tre đến hương thơm nồng nàn của mắm Châu Đốc, mỗi đặc sản
              đều là một "đại sứ văn hóa" của vùng đất chín rồng.
            </p>
            <p>
              Thông qua nền tảng này, chúng tôi mong muốn bảo tồn và lan tỏa những giá trị truyền thống ấy, để
              bản sắc Việt Nam luôn sống động và phát triển mạnh mẽ trong kỷ nguyên số.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://product.hstatic.net/200000507787/product/thiet_ke_chua_co_ten__23__e2812cf16efe44469080a79e2a959f5b_master.png"
              alt="Văn hóa Miền Nam"
            />
          </div>
        </div>
      </section>

      {/* Giới thiệu nguồn gốc */}
      <section id="moderation" className="about-detail-section">
        <div className="about-container">
          <div className="about-text">
            <span className="badge-small">Giới thiệu nguồn gốc</span>
            <h2>Cam kết chính gốc - Quy trình kiểm duyệt nghiêm ngặt</h2>
            <p>
              Để đảm bảo mỗi sản phẩm đến tay khách hàng đều là đặc sản chính gốc với xuất xứ rõ ràng, NamBộ
              Specialties áp dụng quy trình kiểm duyệt gian hàng đa tầng:
            </p>
            <ul className="check-list">
              <li>
                <ShieldCheck size={20} className="check-icon" />
                <div>
                  <strong>Xác minh thực tế:</strong> Đội ngũ chúng tôi trực tiếp khảo sát cơ sở sản xuất và vùng nguyên liệu.
                </div>
              </li>
              <li>
                <ShieldCheck size={20} className="check-icon" />
                <div>
                  <strong>Kiểm định chất lượng:</strong> Sản phẩm phải đạt tiêu chuẩn ATTP và có giấy phép lưu hành hợp lệ.
                </div>
              </li>
              <li>
                <ShieldCheck size={20} className="check-icon" />
                <div>
                  <strong>Minh bạch thông tin:</strong> Mỗi sản phẩm đều đính kèm câu chuyện về nghệ nhân và nguồn gốc địa lý rõ ràng.
                </div>
              </li>
            </ul>
          </div>
          <div className="about-image">
            <img
              src="https://vinacontrolce.vn/wp-content/uploads/2023/07/chat-luong-san-pham-la-gi-1-768x438.jpg"
              alt="Kiểm duyệt chất lượng"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
