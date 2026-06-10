import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMyShop, updateShop } from '../../api/shopApi';
import '../../styles/seller.css';

const BASE_URL = 'http://127.0.0.1:8000/storage/';

const IconShop  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconMap   = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconBank  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0110 0v3"/></svg>;
const IconCard  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconText  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;
const IconInfo  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const IconBack  = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const IconSave  = () => <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconAlert = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPhone = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>;

export default function SellerShopEdit() {
  const navigate = useNavigate();

  const [shop,    setShop]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiErr,  setApiErr]  = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    TenShop: '',
    SoDienThoai: '',
    DiaChi: '',
    TenNganHang: '',
    SoTaiKhoang: '',
    Tittle: '',
    GioiThieu: '',
  });

  const [logoFile,      setLogoFile]      = useState(null);
  const [banerFile,     setBanerFile]     = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [banerPreview,  setBanerPreview]  = useState(null);

  /* ── Load shop info ── */
  useEffect(() => {
    getMyShop()
      .then(res => {
        if (res.data?.success) {
          const s = res.data.data;
          setShop(s);
          setForm({
            TenShop:     s.TenShop     || '',
            SoDienThoai: s.SoDienThoai || '',
            DiaChi:      s.DiaChi      || '',
            TenNganHang: s.TenNganHang || '',
            SoTaiKhoang: s.SoTaiKhoang || '',
            Tittle:      s.Tittle      || '',
            GioiThieu:   s.GioiThieu   || '',
          });
          if (s.logo)  setLogoPreview(`${BASE_URL}${s.logo}`);
          if (s.baner) setBanerPreview(`${BASE_URL}${s.baner}`);
        }
      })
      .catch(() => {
        setApiErr('Không tải được thông tin gian hàng.');
      })
      .finally(() => setLoading(false));
  }, []);

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
    if (!form.SoDienThoai.trim()) errs.SoDienThoai = 'Vui lòng nhập số điện thoại';
    if (!form.DiaChi.trim())      errs.DiaChi      = 'Vui lòng nhập địa chỉ';
    if (!form.TenNganHang.trim()) errs.TenNganHang = 'Vui lòng nhập tên ngân hàng';
    if (!form.SoTaiKhoang.trim()) errs.SoTaiKhoang = 'Vui lòng nhập số tài khoản';
    if (!form.Tittle.trim())      errs.Tittle      = 'Vui lòng nhập tiêu đề gian hàng';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErr(''); setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logoFile)  fd.append('logo',  logoFile);
    if (banerFile) fd.append('baner', banerFile);

    setSaving(true);
    try {
      const res = await updateShop(fd);
      setShop(res.data.data);
      setSuccess('Cập nhật gian hàng thành công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      } else {
        setApiErr(data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="seller-page">
        <Navbar />
        <div className="seller-edit-layout">
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--seller-muted)' }}>
            <div style={{
              width: 44, height: 44,
              border: '4px solid #e8dfd0',
              borderTopColor: 'var(--seller-gold)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }} />
            Đang tải thông tin...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-page">
      <Navbar />
      <div className="seller-edit-layout">

        {/* ── Header ── */}
        <div className="seller-edit-header">
          <Link to="/seller/dashboard" className="seller-back-btn">
            <IconBack /> Quay lại Dashboard
          </Link>
          <div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--seller-brown)', marginBottom: '0.1rem' }}>
              Chỉnh sửa Gian hàng
            </h1>
            {shop?.TenShop && (
              <p style={{ fontSize: '0.85rem', color: 'var(--seller-muted)' }}>
                {shop.TenShop}
              </p>
            )}
          </div>
        </div>

        {/* ── Alerts ── */}
        {apiErr && (
          <div className="seller-alert seller-alert-error">
            <IconAlert /> {apiErr}
          </div>
        )}
        {success && (
          <div className="seller-alert seller-alert-success">
            <IconCheck /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Thông tin gian hàng ── */}
          <div className="seller-form-section">
            <div className="seller-section-title">🏪 Thông tin gian hàng</div>
            <div className="seller-form-grid">

              <div className="seller-field span-2">
                <label>Tên gian hàng <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.TenShop ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><IconShop /></span>
                  <input
                    id="edit-TenShop"
                    name="TenShop"
                    value={form.TenShop}
                    onChange={handleChange}
                    placeholder="Tên gian hàng của bạn"
                  />
                </div>
                {errors.TenShop && <span className="seller-field-error">{errors.TenShop}</span>}
              </div>

              <div className="seller-field span-2">
                <label>Số điện thoại <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.SoDienThoai ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><IconPhone /></span>
                  <input
                    id="edit-SoDienThoai"
                    name="SoDienThoai"
                    value={form.SoDienThoai}
                    onChange={handleChange}
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                {errors.SoDienThoai && <span className="seller-field-error">{errors.SoDienThoai}</span>}
              </div>

              <div className="seller-field span-2">
                <label>Địa chỉ <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.DiaChi ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><IconMap /></span>
                  <input
                    id="edit-DiaChi"
                    name="DiaChi"
                    value={form.DiaChi}
                    onChange={handleChange}
                    placeholder="Địa chỉ kinh doanh"
                  />
                </div>
                {errors.DiaChi && <span className="seller-field-error">{errors.DiaChi}</span>}
              </div>

              <div className="seller-field span-2">
                <label>Tiêu đề gian hàng <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.Tittle ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><IconText /></span>
                  <input
                    id="edit-Tittle"
                    name="Tittle"
                    value={form.Tittle}
                    onChange={handleChange}
                    placeholder="Slogan hoặc tiêu đề ngắn gọn"
                  />
                </div>
                {errors.Tittle && <span className="seller-field-error">{errors.Tittle}</span>}
              </div>

              <div className="seller-field span-2">
                <label>Giới thiệu</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon" style={{ top: '1rem', transform: 'none' }}><IconInfo /></span>
                  <textarea
                    id="edit-GioiThieu"
                    name="GioiThieu"
                    value={form.GioiThieu}
                    onChange={handleChange}
                    placeholder="Mô tả về gian hàng, sản phẩm bạn cung cấp..."
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ── Tài khoản ngân hàng ── */}
          <div className="seller-form-section">
            <div className="seller-section-title">🏦 Tài khoản ngân hàng</div>
            <div className="seller-form-grid">

              <div className="seller-field">
                <label>Tên ngân hàng <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.TenNganHang ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><IconBank /></span>
                  <input
                    id="edit-TenNganHang"
                    name="TenNganHang"
                    value={form.TenNganHang}
                    onChange={handleChange}
                    placeholder="Vietcombank, Techcombank..."
                  />
                </div>
                {errors.TenNganHang && <span className="seller-field-error">{errors.TenNganHang}</span>}
              </div>

              <div className="seller-field">
                <label>Số tài khoản <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.SoTaiKhoang ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><IconCard /></span>
                  <input
                    id="edit-SoTaiKhoang"
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
                    id="edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {logoPreview ? (
                    <div className="seller-upload-preview">
                      <img src={logoPreview} alt="Logo" />
                    </div>
                  ) : (
                    <>
                      <span className="seller-upload-icon">🏪</span>
                      <div className="seller-upload-label">
                        <strong>Chọn ảnh mới</strong> hoặc kéo thả
                      </div>
                      <div className="seller-upload-hint">Giữ nguyên nếu không muốn thay đổi</div>
                    </>
                  )}
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                    style={{ fontSize: '0.75rem', color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0', marginTop: '0.25rem' }}
                  >
                    ✕ Xóa ảnh
                  </button>
                )}
              </div>

              <div className="seller-field">
                <label>Banner gian hàng</label>
                <div className="seller-upload-area">
                  <input
                    id="edit-baner"
                    type="file"
                    accept="image/*"
                    onChange={handleBanerChange}
                  />
                  {banerPreview ? (
                    <div className="seller-upload-preview">
                      <img src={banerPreview} alt="Banner" />
                    </div>
                  ) : (
                    <>
                      <span className="seller-upload-icon">🎨</span>
                      <div className="seller-upload-label">
                        <strong>Chọn ảnh mới</strong> hoặc kéo thả
                      </div>
                      <div className="seller-upload-hint">Giữ nguyên nếu không muốn thay đổi</div>
                    </>
                  )}
                </div>
                {banerPreview && (
                  <button
                    type="button"
                    onClick={() => { setBanerFile(null); setBanerPreview(null); }}
                    style={{ fontSize: '0.75rem', color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0', marginTop: '0.25rem' }}
                  >
                    ✕ Xóa ảnh
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <button
              id="edit-submit"
              type="submit"
              className="seller-submit-btn"
              disabled={saving}
              style={{ flex: 1 }}
            >
              {saving ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block'
                  }} />
                  Đang lưu...
                </>
              ) : (
                <><IconSave /> Lưu thay đổi</>
              )}
            </button>
            <Link to="/seller/dashboard" className="seller-btn seller-btn-outline" style={{ padding: '0.9rem 1.5rem' }}>
              Hủy
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
