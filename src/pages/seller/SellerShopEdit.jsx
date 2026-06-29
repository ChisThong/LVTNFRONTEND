import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { updateShop } from '../../api/shopApi';
import '../../styles/seller.css';

const BASE_URL = 'https://lvtnbackend.onrender.com/storage/';

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
  const { shop, setShop, shopLoading: loading } = useOutletContext();

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
    LoaiHinhKinhDoanh: 'ho_kinh_doanh',
  });

  const [logoFile,      setLogoFile]      = useState(null);
  const [banerFile,     setBanerFile]     = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [banerPreview,  setBanerPreview]  = useState(null);

  /* ── Sync shop info to local form state ── */
  useEffect(() => {
    if (shop) {
      setForm({
        TenShop:     shop.TenShop     || '',
        SoDienThoai: shop.SoDienThoai || '',
        DiaChi:      shop.DiaChi      || '',
        TenNganHang: shop.TenNganHang || '',
        SoTaiKhoang: shop.SoTaiKhoang || '',
        Tittle:      shop.Tittle      || '',
        GioiThieu:   shop.GioiThieu   || '',
        LoaiHinhKinhDoanh: shop.LoaiHinhKinhDoanh || 'ho_kinh_doanh',
      });
      if (shop.logo)  setLogoPreview(`${BASE_URL}${shop.logo}`);
      if (shop.baner) setBanerPreview(`${BASE_URL}${shop.baner}`);
    }
  }, [shop]);

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

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#8C7B6D' }}>
        <div style={{
          width: 44, height: 44,
          border: '4px solid #e8dfd0',
          borderTopColor: '#2C3A29',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#2C3A29', margin: 0 }}>
            Thông tin cửa hàng
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#8C7B6D', margin: '0.2rem 0 0 0' }}>
            Quản lý thông tin hồ sơ để bảo vệ tài khoản của bạn
          </p>
        </div>
        <Link to="/seller/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '6px', color: '#4A5B45', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
        }}>
          <IconBack /> Quay lại
        </Link>
      </div>

      {/* ── Shop Info Card (Top) ── */}
      <div style={{
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '2rem', border: '1px solid #EAE3DA'
      }}>
        {/* Banner */}
        <div style={{
          height: '160px', width: '100%',
          background: banerPreview ? `url(${banerPreview}) center/cover no-repeat` : '#EAE3DA',
          position: 'relative'
        }}>
          {!banerPreview && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#8C7B6D' }}>Chưa có ảnh bìa</div>}
        </div>
        
        {/* Logo & Info */}
        <div style={{ padding: '0 2rem 1.5rem 2rem', display: 'flex', alignItems: 'flex-end', marginTop: '-40px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', background: '#fff',
            padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 2
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: logoPreview ? `url(${logoPreview}) center/cover no-repeat` : '#F4EFEA',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C7B6D', fontSize: '2rem'
            }}>
              {!logoPreview && '🏪'}
            </div>
          </div>
          
          <div style={{ marginLeft: '1.5rem', paddingBottom: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#2D241E', fontWeight: 800 }}>{shop?.TenShop || 'Tên cửa hàng'}</h2>
            <div style={{ color: '#8C7B6D', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {shop?.Tittle || 'Chưa có tiêu đề'}
            </div>
          </div>
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

          <div style={{
            background: '#fff', borderRadius: '12px', padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #EAE3DA', marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#2C3A29', borderBottom: '2px solid #F4EFEA', paddingBottom: '0.75rem' }}>
              Thông tin cơ bản
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              
              {/* Cột 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="seller-field">
                  <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Tên cửa hàng <span style={{color:'#DC2626'}}>*</span></label>
                  <div className={`seller-input-wrap ${errors.TenShop ? 'is-invalid' : ''}`} style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                    <span className="seller-input-icon"><IconShop /></span>
                    <input id="edit-TenShop" name="TenShop" value={form.TenShop} onChange={handleChange} placeholder="Tên cửa hàng của bạn" style={{ background: 'transparent' }} />
                  </div>
                  {errors.TenShop && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.TenShop}</span>}
                </div>

                <div className="seller-field">
                  <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Tiêu đề gian hàng <span style={{color:'#DC2626'}}>*</span></label>
                  <div className={`seller-input-wrap ${errors.Tittle ? 'is-invalid' : ''}`} style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                    <span className="seller-input-icon"><IconText /></span>
                    <input id="edit-Tittle" name="Tittle" value={form.Tittle} onChange={handleChange} placeholder="Slogan hoặc tiêu đề ngắn gọn" style={{ background: 'transparent' }} />
                  </div>
                  {errors.Tittle && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.Tittle}</span>}
                </div>

                <div className="seller-field">
                  <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Loại hình kinh doanh <span style={{color:'#DC2626'}}>*</span></label>
                  <div className="seller-input-wrap" style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                    <span className="seller-input-icon"><IconInfo /></span>
                    <select id="edit-LoaiHinhKinhDoanh" name="LoaiHinhKinhDoanh" value={form.LoaiHinhKinhDoanh} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', border: 'none', background: 'transparent', outline: 'none', color: '#4A3B32' }}>
                      <option value="ho_kinh_doanh">Hộ kinh doanh cá thể</option>
                      <option value="doanh_nghiep">Doanh nghiệp</option>
                    </select>
                  </div>
                </div>

                <div className="seller-field">
                  <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Số điện thoại <span style={{color:'#DC2626'}}>*</span></label>
                  <div className={`seller-input-wrap ${errors.SoDienThoai ? 'is-invalid' : ''}`} style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                    <span className="seller-input-icon"><IconPhone /></span>
                    <input id="edit-SoDienThoai" name="SoDienThoai" value={form.SoDienThoai} onChange={handleChange} placeholder="Số điện thoại liên hệ" style={{ background: 'transparent' }} />
                  </div>
                  {errors.SoDienThoai && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.SoDienThoai}</span>}
                </div>
              </div>

              {/* Cột 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="seller-field">
                  <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Địa chỉ <span style={{color:'#DC2626'}}>*</span></label>
                  <div className={`seller-input-wrap ${errors.DiaChi ? 'is-invalid' : ''}`} style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                    <span className="seller-input-icon"><IconMap /></span>
                    <input id="edit-DiaChi" name="DiaChi" value={form.DiaChi} onChange={handleChange} placeholder="Địa chỉ kinh doanh" style={{ background: 'transparent' }} />
                  </div>
                  {errors.DiaChi && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.DiaChi}</span>}
                </div>

                <div className="seller-field" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Giới thiệu</label>
                  <div className="seller-input-wrap" style={{ background: '#F8F5F1', borderRadius: '8px', flex: 1 }}>
                    <span className="seller-input-icon" style={{ top: '1rem', transform: 'none' }}><IconInfo /></span>
                    <textarea id="edit-GioiThieu" name="GioiThieu" value={form.GioiThieu} onChange={handleChange} placeholder="Mô tả về gian hàng, sản phẩm bạn cung cấp..." style={{ background: 'transparent', height: '100%', minHeight: '100px' }} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Tài khoản ngân hàng ── */}
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #EAE3DA', marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#2C3A29', borderBottom: '2px solid #F4EFEA', paddingBottom: '0.75rem' }}>
              Tài khoản ngân hàng
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

              <div className="seller-field">
                <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Tên ngân hàng <span style={{color:'#DC2626'}}>*</span></label>
                <div className={`seller-input-wrap ${errors.TenNganHang ? 'is-invalid' : ''}`} style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                  <span className="seller-input-icon"><IconBank /></span>
                  <input id="edit-TenNganHang" name="TenNganHang" value={form.TenNganHang} onChange={handleChange} placeholder="Vietcombank, Techcombank..." style={{ background: 'transparent' }} />
                </div>
                {errors.TenNganHang && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.TenNganHang}</span>}
              </div>

              <div className="seller-field">
                <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Số tài khoản <span style={{color:'#DC2626'}}>*</span></label>
                <div className={`seller-input-wrap ${errors.SoTaiKhoang ? 'is-invalid' : ''}`} style={{ background: '#F8F5F1', borderRadius: '8px' }}>
                  <span className="seller-input-icon"><IconCard /></span>
                  <input id="edit-SoTaiKhoang" name="SoTaiKhoang" value={form.SoTaiKhoang} onChange={handleChange} placeholder="Số tài khoản thụ hưởng" style={{ background: 'transparent' }} />
                </div>
                {errors.SoTaiKhoang && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.SoTaiKhoang}</span>}
              </div>

            </div>
          </div>

          {/* ── Hình ảnh ── */}
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #EAE3DA', marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: '#2C3A29', borderBottom: '2px solid #F4EFEA', paddingBottom: '0.75rem' }}>
              Tải lên hình ảnh
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>

              <div className="seller-field">
                <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Logo gian hàng</label>
                <div className="seller-upload-area" style={{ background: '#F8F5F1', borderRadius: '8px', border: '2px dashed #D2B48C', padding: '1.5rem' }}>
                  <input id="edit-logo" type="file" accept="image/*" onChange={handleLogoChange} />
                  {logoPreview ? (
                    <div className="seller-upload-preview" style={{ height: '120px' }}>
                      <img src={logoPreview} alt="Logo" style={{ height: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <>
                      <span className="seller-upload-icon" style={{ fontSize: '2rem', color: '#D2B48C' }}>🏪</span>
                      <div className="seller-upload-label" style={{ color: '#4A3B32' }}><strong>Chọn ảnh mới</strong></div>
                      <div className="seller-upload-hint">Tỉ lệ 1:1, tối đa 2MB</div>
                    </>
                  )}
                </div>
                {logoPreview && (
                  <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} style={{ fontSize: '0.85rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}>✕ Xóa ảnh chọn</button>
                )}
              </div>

              <div className="seller-field">
                <label style={{ color: '#4A3B32', fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Ảnh bìa (Banner)</label>
                <div className="seller-upload-area" style={{ background: '#F8F5F1', borderRadius: '8px', border: '2px dashed #D2B48C', padding: '1.5rem' }}>
                  <input id="edit-baner" type="file" accept="image/*" onChange={handleBanerChange} />
                  {banerPreview ? (
                    <div className="seller-upload-preview" style={{ height: '120px' }}>
                      <img src={banerPreview} alt="Banner" style={{ height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <>
                      <span className="seller-upload-icon" style={{ fontSize: '2rem', color: '#D2B48C' }}>🖼️</span>
                      <div className="seller-upload-label" style={{ color: '#4A3B32' }}><strong>Chọn ảnh mới</strong></div>
                      <div className="seller-upload-hint">Tỉ lệ 16:9, tối đa 5MB</div>
                    </>
                  )}
                </div>
                {banerPreview && (
                  <button type="button" onClick={() => { setBanerFile(null); setBanerPreview(null); }} style={{ fontSize: '0.85rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0' }}>✕ Xóa ảnh chọn</button>
                )}
              </div>

            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/seller/dashboard" style={{
              padding: '0.85rem 2rem', background: '#F4EFEA', color: '#4A3B32', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem'
            }}>
              Hủy
            </Link>
            <button
              id="edit-submit"
              type="submit"
              disabled={saving}
              style={{
                padding: '0.85rem 2.5rem', background: '#2C3A29', color: '#fff', borderRadius: '8px',
                border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.8 : 1
              }}
            >
              {saving ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block'
                  }} />
                  Đang lưu...
                </>
              ) : (
                <><IconSave /> Lưu Thông Tin</>
              )}
            </button>
          </div>

        </form>
      </div>
  );
}
