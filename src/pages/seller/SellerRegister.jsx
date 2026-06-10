import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { registerShop } from '../../api/shopApi';
import '../../styles/seller.css';

/* ── Icons ── */
const IconShop    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconId      = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2M16 14h2M6 10h6M6 14h4"/></svg>;
const IconMap     = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconBank    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0110 0v3"/></svg>;
const IconCard    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconText    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const IconInfo    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const IconAlert   = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheck   = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

/* ── Image preview helper ── */
function useImagePreview() {
  const [preview, setPreview] = useState(null);
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };
  return [preview, handleChange];
}

export default function SellerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    TenShop: '',
    SCCD: '',
    DiaChi: '',
    TenNganHang: '',
    SoTaiKhoang: '',
    Tittle: '',
    GioiThieu: '',
  });

  const [logoFile, setLogoFile]     = useState(null);
  const [banerFile, setBanerFile]   = useState(null);
  const [logoPreview, setLogoPreview]   = useState(null);
  const [banerPreview, setBanerPreview] = useState(null);

  const [errors,  setErrors]  = useState({});
  const [apiErr,  setApiErr]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleBanerChange = (e) => {
    const file = e.target.files[0];
    if (file) { setBanerFile(file); setBanerPreview(URL.createObjectURL(file)); }
  };

  const validate = () => {
    const errs = {};
    if (!form.TenShop.trim())     errs.TenShop     = 'Vui lòng nhập tên gian hàng';
    if (!form.SCCD.trim())        errs.SCCD        = 'Vui lòng nhập CCCD/SCCD';
    if (!form.DiaChi.trim())      errs.DiaChi      = 'Vui lòng nhập địa chỉ';
    if (!form.TenNganHang.trim()) errs.TenNganHang = 'Vui lòng nhập tên ngân hàng';
    if (!form.SoTaiKhoang.trim()) errs.SoTaiKhoang = 'Vui lòng nhập số tài khoản';
    if (!form.Tittle.trim())      errs.Tittle      = 'Vui lòng nhập tiêu đề gian hàng';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile)  fd.append('logo',  logoFile);
    if (banerFile) fd.append('baner', banerFile);

    setLoading(true);
    try {
      await registerShop(fd);
      navigate('/seller/dashboard');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        // Laravel validation errors
        const mapped = {};
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      } else {
        setApiErr(data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-page">
      <Navbar />
      <div className="seller-register-layout">

        {/* ── Cột trái decorative ── */}
        <aside className="seller-register-panel">
          <div className="seller-panel-badge">
            🌴 NamBộ Specialties
          </div>
          <h1 className="seller-panel-title">
            Mở <span>gian hàng</span><br />của bạn hôm nay
          </h1>
          <p className="seller-panel-desc">
            Kết nối với hàng nghìn khách hàng yêu đặc sản Miền Nam.
            Đăng ký nhanh, bán hàng ngay sau khi được duyệt.
          </p>
          <div className="seller-panel-steps">
            {[
              'Điền thông tin gian hàng',
              'Chờ Admin xét duyệt',
              'Bắt đầu đăng sản phẩm',
            ].map((step, i) => (
              <div key={i} className="seller-panel-step">
                <span className="seller-step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Cột phải – form ── */}
        <main className="seller-register-form-col">
          <div className="seller-form-header">
            <h2 className="seller-form-title">Đăng ký Gian hàng</h2>
            <p className="seller-form-subtitle">
              Điền đầy đủ thông tin bên dưới để hoàn tất đăng ký.
            </p>
          </div>

          {apiErr && (
            <div className="seller-alert seller-alert-error">
              <IconAlert /> {apiErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Thông tin cơ bản ── */}
            <div className="seller-form-section">
              <div className="seller-section-title">🏪 Thông tin gian hàng</div>
              <div className="seller-form-grid">

                <div className="seller-field span-2">
                  <label>Tên gian hàng <span className="req">*</span></label>
                  <div className={`seller-input-wrap ${errors.TenShop ? 'is-invalid' : ''}`}>
                    <span className="seller-input-icon"><IconShop /></span>
                    <input
                      id="reg-TenShop"
                      name="TenShop"
                      value={form.TenShop}
                      onChange={handleChange}
                      placeholder="Ví dụ: Đặc sản Tiền Giang – Bà Tư"
                    />
                  </div>
                  {errors.TenShop && <span className="seller-field-error">{errors.TenShop}</span>}
                </div>

                <div className="seller-field">
                  <label>CCCD / Căn cước <span className="req">*</span></label>
                  <div className={`seller-input-wrap ${errors.SCCD ? 'is-invalid' : ''}`}>
                    <span className="seller-input-icon"><IconId /></span>
                    <input
                      id="reg-SCCD"
                      name="SCCD"
                      value={form.SCCD}
                      onChange={handleChange}
                      placeholder="012345678901"
                    />
                  </div>
                  {errors.SCCD && <span className="seller-field-error">{errors.SCCD}</span>}
                </div>

                <div className="seller-field">
                  <label>Địa chỉ <span className="req">*</span></label>
                  <div className={`seller-input-wrap ${errors.DiaChi ? 'is-invalid' : ''}`}>
                    <span className="seller-input-icon"><IconMap /></span>
                    <input
                      id="reg-DiaChi"
                      name="DiaChi"
                      value={form.DiaChi}
                      onChange={handleChange}
                      placeholder="Số nhà, đường, xã/phường, tỉnh/TP"
                    />
                  </div>
                  {errors.DiaChi && <span className="seller-field-error">{errors.DiaChi}</span>}
                </div>

                <div className="seller-field span-2">
                  <label>Tiêu đề gian hàng <span className="req">*</span></label>
                  <div className={`seller-input-wrap ${errors.Tittle ? 'is-invalid' : ''}`}>
                    <span className="seller-input-icon"><IconText /></span>
                    <input
                      id="reg-Tittle"
                      name="Tittle"
                      value={form.Tittle}
                      onChange={handleChange}
                      placeholder="Slogan hoặc tiêu đề ngắn gọn"
                    />
                  </div>
                  {errors.Tittle && <span className="seller-field-error">{errors.Tittle}</span>}
                </div>

                <div className="seller-field span-2">
                  <label>Giới thiệu gian hàng</label>
                  <div className="seller-input-wrap">
                    <span className="seller-input-icon" style={{ top: '1rem', transform: 'none' }}><IconInfo /></span>
                    <textarea
                      id="reg-GioiThieu"
                      name="GioiThieu"
                      value={form.GioiThieu}
                      onChange={handleChange}
                      placeholder="Mô tả về gian hàng, sản phẩm bạn cung cấp, xuất xứ..."
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* ── Thông tin ngân hàng ── */}
            <div className="seller-form-section">
              <div className="seller-section-title">🏦 Tài khoản ngân hàng</div>
              <div className="seller-form-grid">

                <div className="seller-field">
                  <label>Tên ngân hàng <span className="req">*</span></label>
                  <div className={`seller-input-wrap ${errors.TenNganHang ? 'is-invalid' : ''}`}>
                    <span className="seller-input-icon"><IconBank /></span>
                    <input
                      id="reg-TenNganHang"
                      name="TenNganHang"
                      value={form.TenNganHang}
                      onChange={handleChange}
                      placeholder="Vietcombank, MB Bank, Techcombank..."
                    />
                  </div>
                  {errors.TenNganHang && <span className="seller-field-error">{errors.TenNganHang}</span>}
                </div>

                <div className="seller-field">
                  <label>Số tài khoản <span className="req">*</span></label>
                  <div className={`seller-input-wrap ${errors.SoTaiKhoang ? 'is-invalid' : ''}`}>
                    <span className="seller-input-icon"><IconCard /></span>
                    <input
                      id="reg-SoTaiKhoang"
                      name="SoTaiKhoang"
                      value={form.SoTaiKhoang}
                      onChange={handleChange}
                      placeholder="Số tài khoản thụ hưởng"
                    />
                  </div>
                  {errors.SoTaiKhoang && <span className="seller-field-error">{errors.SoTaiKhoang}</span>}
                </div>

              </div>
            </div>

            {/* ── Hình ảnh ── */}
            <div className="seller-form-section">
              <div className="seller-section-title">🖼️ Hình ảnh gian hàng</div>
              <div className="seller-form-grid">

                <div className="seller-field">
                  <label>Logo gian hàng</label>
                  <div className="seller-upload-area">
                    <input
                      id="reg-logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    {logoPreview ? (
                      <div className="seller-upload-preview">
                        <img src={logoPreview} alt="Logo preview" />
                      </div>
                    ) : (
                      <>
                        <span className="seller-upload-icon">🏪</span>
                        <div className="seller-upload-label">
                          <strong>Chọn ảnh</strong> hoặc kéo thả
                        </div>
                        <div className="seller-upload-hint">PNG, JPG tối đa 2MB</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="seller-field">
                  <label>Banner gian hàng</label>
                  <div className="seller-upload-area">
                    <input
                      id="reg-baner"
                      type="file"
                      accept="image/*"
                      onChange={handleBanerChange}
                    />
                    {banerPreview ? (
                      <div className="seller-upload-preview">
                        <img src={banerPreview} alt="Banner preview" />
                      </div>
                    ) : (
                      <>
                        <span className="seller-upload-icon">🎨</span>
                        <div className="seller-upload-label">
                          <strong>Chọn ảnh</strong> hoặc kéo thả
                        </div>
                        <div className="seller-upload-hint">PNG, JPG tối đa 5MB</div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ── Submit ── */}
            <button
              id="reg-submit"
              type="submit"
              className="seller-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Đang đăng ký...
                </>
              ) : (
                <><IconCheck /> Đăng ký gian hàng</>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--seller-muted)', marginTop: '0.75rem' }}>
              Đã có gian hàng?{' '}
              <Link to="/seller/dashboard" style={{ color: 'var(--seller-gold-bright)', fontWeight: 700 }}>
                Xem dashboard
              </Link>
            </p>
          </form>
        </main>

      </div>
    </div>
  );
}
