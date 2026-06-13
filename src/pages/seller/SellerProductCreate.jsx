import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyShop } from '../../api/shopApi';
import { createProduct } from '../../api/productApi';
import axiosClient from '../../api/axiosClient';
import {
  Package, Type, FileText, MapPin, DollarSign, Hash,
  Tag, Image, ArrowLeft, CheckCircle, AlertCircle, Layers
} from 'lucide-react';
import '../../styles/seller.css';
import '../../styles/seller-products.css';

const DONVI_OPTIONS = ['kg', 'hộp', 'chai', 'gói', 'túi', 'lọ', 'cái', 'bịch', 'lon', 'cặp'];

export default function SellerProductCreate() {
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [form, setForm] = useState({
    TenSanPham: '',
    Tittle: '',
    MoTa: '',
    NguonGoc: '',
    Gia: '',
    SoLuongTon: '',
    Donvi: '',
    ID_PhanLoai: '',
    ID_TinhThanh: '',
    TrangThai: '1',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  /* ── Load shop + categories + provinces ── */
  useEffect(() => {
    getMyShop()
      .then((res) => {
        if (res.data?.success) setShop(res.data.data);
      })
      .catch(() => {})
      .finally(() => setShopLoading(false));

    axiosClient.get('/phan-loai').then((res) => {
      const list = res.data?.data ?? [];
      setCategories(Array.isArray(list) ? list : []);
    }).catch(() => {});

    axiosClient.get('/tinh-thanh').then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setProvinces(Array.isArray(list) ? list : []);
    }).catch(() => {});
  }, []);

  /* ── Handle image select ── */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (!form.TenSanPham.trim()) e.TenSanPham = 'Vui lòng nhập tên sản phẩm.';
    else if (form.TenSanPham.length < 3) e.TenSanPham = 'Tên sản phẩm phải có ít nhất 3 ký tự.';
    if (!form.Gia || Number(form.Gia) <= 0) e.Gia = 'Vui lòng nhập giá hợp lệ (> 0).';
    if (form.SoLuongTon === '' || Number(form.SoLuongTon) < 0) e.SoLuongTon = 'Số lượng tồn kho không được âm.';
    if (!form.ID_PhanLoai) e.ID_PhanLoai = 'Vui lòng chọn phân loại sản phẩm.';
    return e;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      fd.append('ID_Shop', shop.ID_Shop);
      imageFiles.forEach((f) => fd.append('hinh_anh[]', f));

      await createProduct(fd);
      setSuccess(true);
      setTimeout(() => navigate('/seller/products'), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        const mapped = {};
        Object.entries(validationErrors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setErrors(mapped);
      }
      setApiError(msg || 'Tạo sản phẩm thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  /* ── Guard loading ── */
  if (shopLoading) {
    return (
      <div className="sp-page">
        <div className="sp-skeleton-wrap">
          <div className="seller-skeleton" style={{ height: 40, width: '40%', marginBottom: '1rem' }} />
          <div className="seller-skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  /* ── Guard chưa duyệt ── */
  if (!shop || shop.TrangThaiDuyet !== 'da_duyet') {
    return (
      <div className="sp-page">
        <div className="sp-status-block cho_duyet">
          <div className="sp-status-icon">⏳</div>
          <div>
            <h2>Gian hàng chưa được duyệt</h2>
            <p>Bạn chưa thể tạo sản phẩm khi gian hàng chưa được phê duyệt.</p>
          </div>
          <Link to="/seller/products" className="seller-btn seller-btn-outline" style={{ marginLeft: 'auto' }}>
            ← Quay lại
          </Link>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (success) {
    return (
      <div className="sp-page">
        <div className="sp-success-state">
          <CheckCircle size={60} color="#4A6741" />
          <h2>Tạo sản phẩm thành công!</h2>
          <p>Đang chuyển về danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* ── Header ── */}
      <div className="sp-form-header">
        <Link to="/seller/products" className="seller-back-btn">
          <ArrowLeft size={15} /> Quản lý sản phẩm
        </Link>
        <h1 className="sp-form-title">
          <Plus2Icon /> Thêm sản phẩm mới
        </h1>
      </div>

      {apiError && (
        <div className="seller-alert seller-alert-error">
          <AlertCircle size={16} /> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="sp-form-layout" encType="multipart/form-data">
        {/* ── Left: Main Info ── */}
        <div className="sp-form-main">

          {/* Thông tin cơ bản */}
          <div className="seller-form-section">
            <div className="seller-section-title"><Package size={15} /> Thông tin sản phẩm</div>
            <div className="seller-form-grid">

              {/* Tên sản phẩm */}
              <div className="seller-field span-2">
                <label>Tên sản phẩm <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.TenSanPham ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><Package size={16} /></span>
                  <input
                    type="text"
                    placeholder="VD: Mật Ong Rừng U Minh Nguyên Chất"
                    value={form.TenSanPham}
                    onChange={(e) => setField('TenSanPham', e.target.value)}
                    maxLength={200}
                  />
                </div>
                {errors.TenSanPham && <span className="seller-field-error">{errors.TenSanPham}</span>}
              </div>

              {/* Tiêu đề ngắn */}
              <div className="seller-field span-2">
                <label>Tiêu đề ngắn (Tittle)</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon"><Type size={16} /></span>
                  <input
                    type="text"
                    placeholder="VD: Mật ong rừng 100% tự nhiên - 500ml"
                    value={form.Tittle}
                    onChange={(e) => setField('Tittle', e.target.value)}
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div className="seller-field span-2">
                <label>Mô tả chi tiết</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon" style={{ top: '0.9rem', alignSelf: 'flex-start' }}><FileText size={16} /></span>
                  <textarea
                    placeholder="Mô tả về nguồn gốc, đặc điểm, cách sử dụng sản phẩm..."
                    value={form.MoTa}
                    onChange={(e) => setField('MoTa', e.target.value)}
                    rows={5}
                    maxLength={5000}
                  />
                </div>
              </div>

              {/* Nguồn gốc */}
              <div className="seller-field span-2">
                <label>Nguồn gốc / Xuất xứ</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon"><MapPin size={16} /></span>
                  <input
                    type="text"
                    placeholder="VD: Rừng tràm U Minh, Cà Mau"
                    value={form.NguonGoc}
                    onChange={(e) => setField('NguonGoc', e.target.value)}
                    maxLength={255}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Giá & Kho */}
          <div className="seller-form-section">
            <div className="seller-section-title"><DollarSign size={15} /> Giá & Kho hàng</div>
            <div className="seller-form-grid">

              <div className="seller-field">
                <label>Giá bán (VNĐ) <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.Gia ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><DollarSign size={16} /></span>
                  <input
                    type="number"
                    placeholder="VD: 150000"
                    value={form.Gia}
                    onChange={(e) => setField('Gia', e.target.value)}
                    min="1"
                    step="1"
                  />
                </div>
                {errors.Gia && <span className="seller-field-error">{errors.Gia}</span>}
              </div>

              <div className="seller-field">
                <label>Số lượng tồn kho <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.SoLuongTon ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><Hash size={16} /></span>
                  <input
                    type="number"
                    placeholder="VD: 100"
                    value={form.SoLuongTon}
                    onChange={(e) => setField('SoLuongTon', e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
                {errors.SoLuongTon && <span className="seller-field-error">{errors.SoLuongTon}</span>}
              </div>

              <div className="seller-field">
                <label>Đơn vị tính</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon"><Tag size={16} /></span>
                  <select value={form.Donvi} onChange={(e) => setField('Donvi', e.target.value)}>
                    <option value="">-- Chọn đơn vị --</option>
                    {DONVI_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="seller-field">
                <label>Trạng thái</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon"><CheckCircle size={16} /></span>
                  <select value={form.TrangThai} onChange={(e) => setField('TrangThai', e.target.value)}>
                    <option value="1">Đang bán</option>
                    <option value="0">Ẩn (ngừng bán)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right: Category + Province + Images ── */}
        <div className="sp-form-side">

          {/* Phân loại & Địa lý */}
          <div className="seller-form-section">
            <div className="seller-section-title"><Layers size={15} /> Phân loại & Địa lý</div>

            <div className="seller-field" style={{ marginBottom: '1rem' }}>
              <label>Phân loại sản phẩm <span className="req">*</span></label>
              <div className={`seller-input-wrap ${errors.ID_PhanLoai ? 'is-invalid' : ''}`}>
                <span className="seller-input-icon"><Tag size={16} /></span>
                <select
                  value={form.ID_PhanLoai}
                  onChange={(e) => setField('ID_PhanLoai', e.target.value)}
                >
                  <option value="">-- Chọn phân loại --</option>
                  {categories.map((c) => (
                    <option key={c.ID_PhanLoai} value={c.ID_PhanLoai}>{c.TenLoai}</option>
                  ))}
                </select>
              </div>
              {errors.ID_PhanLoai && <span className="seller-field-error">{errors.ID_PhanLoai}</span>}
            </div>

            <div className="seller-field">
              <label>Tỉnh / Thành phố xuất xứ</label>
              <div className="seller-input-wrap">
                <span className="seller-input-icon"><MapPin size={16} /></span>
                <select
                  value={form.ID_TinhThanh}
                  onChange={(e) => setField('ID_TinhThanh', e.target.value)}
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => (
                    <option key={p.ID_TinhThanh} value={p.ID_TinhThanh}>{p.TenTinhThanh}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Upload ảnh */}
          <div className="seller-form-section">
            <div className="seller-section-title"><Image size={15} /> Hình ảnh sản phẩm</div>

            <label className="seller-upload-area">
              <input type="file" accept="image/*" multiple onChange={handleImages} />
              <span className="seller-upload-icon">📸</span>
              <span className="seller-upload-label">
                <strong>Chọn ảnh</strong> hoặc kéo thả vào đây
              </span>
              <span className="seller-upload-hint">JPG, PNG, WEBP · Tối đa 5MB/ảnh</span>
            </label>

            {imagePreviews.length > 0 && (
              <div className="sp-image-grid">
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="sp-image-item">
                    <img src={url} alt={`Preview ${idx + 1}`} />
                    <button type="button" className="sp-image-remove" onClick={() => removeImage(idx)}>×</button>
                    {idx === 0 && <span className="sp-image-main-badge">Ảnh chính</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="seller-submit-btn" disabled={submitting}>
            {submitting ? (
              <><span className="sp-spin-dot" /> Đang tạo sản phẩm...</>
            ) : (
              <><Package size={17} /> Tạo sản phẩm</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Nhỏ icon helper */
function Plus2Icon() {
  return <Package size={22} style={{ color: '#D4A373' }} />;
}
