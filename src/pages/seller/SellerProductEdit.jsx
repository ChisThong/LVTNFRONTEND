import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { getProductDetail, updateProduct } from '../../api/productApi';
import axiosClient from '../../api/axiosClient';
import {
  Package, Type, FileText, MapPin, DollarSign, Hash,
  Tag, Image, ArrowLeft, CheckCircle, AlertCircle, Layers, Trash2, RefreshCw
} from 'lucide-react';
import '../../styles/seller.css';
import '../../styles/seller-products.css';

const BASE_URL = 'http://127.0.0.1:8000/storage/';
const DONVI_OPTIONS = ['kg', 'hộp', 'chai', 'gói', 'túi', 'lọ', 'cái', 'bịch', 'lon', 'cặp'];

export default function SellerProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shop, categories, provinces } = useOutletContext();

  const [loading, setLoading] = useState(true);

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

  // Ảnh hiện có từ DB
  const [existingImages, setExistingImages] = useState([]); // [{ID_HinhAnh, HinhAnh}]
  const [imagesToDelete, setImagesToDelete] = useState([]); // [ID_HinhAnh]

  // Ảnh mới thêm
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [hiddenReason, setHiddenReason] = useState(null);
  const [rejectReason, setRejectReason] = useState(null);
  const [originalTrangThai, setOriginalTrangThai] = useState(1);
  const [originalTrangThaiDuyet, setOriginalTrangThaiDuyet] = useState('cho_duyet');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  /* ── Load data ── */
  useEffect(() => {
    getProductDetail(id)
      .then((prodRes) => {
        const p = prodRes.data?.data;
        if (p) {
          setForm({
            TenSanPham: p.TenSanPham ?? '',
            Tittle: p.Tittle ?? '',
            MoTa: p.MoTa ?? '',
            NguonGoc: p.NguonGoc ?? '',
            Gia: p.Gia ?? '',
            SoLuongTon: p.SoLuongTon ?? '',
            Donvi: p.Donvi ?? '',
            ID_PhanLoai: p.ID_PhanLoai ?? '',
            ID_TinhThanh: p.ID_TinhThanh ?? '',
            TrangThai: String(p.TrangThai ?? 1),
          });
          setExistingImages(p.hinh_anh ?? []);
          setHiddenReason(p.LyDoAn ?? null);
          setRejectReason(p.LyDoTuChoi ?? null);
          setOriginalTrangThai(parseInt(p.TrangThai ?? 1));
          setOriginalTrangThaiDuyet(p.TrangThaiDuyet ?? 'cho_duyet');
        }
      })
      .catch((err) => {
        setApiError(err?.response?.data?.message || 'Không tải được dữ liệu sản phẩm.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Toggle xóa ảnh cũ ── */
  const toggleDeleteImage = (imgId) => {
    setImagesToDelete((prev) =>
      prev.includes(imgId) ? prev.filter((x) => x !== imgId) : [...prev, imgId]
    );
  };

  /* ── Handle ảnh mới ── */
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => {
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
    if (!form.ID_PhanLoai) e.ID_PhanLoai = 'Vui lòng chọn phân loại.';
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
      // Ảnh mới
      newImageFiles.forEach((f) => fd.append('hinh_anh[]', f));
      // Ảnh cần xóa
      imagesToDelete.forEach((imgId) => fd.append('xoa_hinh_anh[]', imgId));

      await updateProduct(id, fd);
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
      setApiError(msg || 'Cập nhật sản phẩm thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  /* ── Guards ── */
  if (loading) {
    return (
      <div className="sp-page">
        <div className="sp-skeleton-wrap">
          <div className="seller-skeleton" style={{ height: 40, width: '40%', marginBottom: '1rem' }} />
          <div className="seller-skeleton" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="sp-page">
        <div className="sp-success-state">
          <CheckCircle size={60} color="#4A6741" />
          <h2>Cập nhật sản phẩm thành công!</h2>
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
          <Package size={22} style={{ color: '#D4A373' }} /> Chỉnh sửa sản phẩm
        </h1>
      </div>

      {apiError && (
        <div className="seller-alert seller-alert-error">
          <AlertCircle size={16} /> {apiError}
        </div>
      )}

      {originalTrangThaiDuyet === 'tu_choi' && rejectReason && (
        <div className="seller-alert seller-alert-error" style={{ marginBottom: '1.5rem', background: '#FEF2F2', borderColor: '#FCA5A5', color: '#991B1B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
             <AlertCircle size={18} /> <strong>Sản phẩm này đã bị từ chối duyệt</strong>
          </div>
          <p style={{ margin: 0, paddingLeft: '26px' }}>Lý do: {rejectReason}</p>
          <p style={{ margin: '8px 0 0 26px', fontSize: '0.9rem', color: '#B91C1C' }}>Vui lòng chỉnh sửa lại thông tin và lưu lại để gửi duyệt lần nữa.</p>
        </div>
      )}

      {originalTrangThai === 0 && hiddenReason && (
        <div className="seller-alert seller-alert-error" style={{ marginBottom: '1.5rem', background: '#FFF3CD', borderColor: '#FFEEBA', color: '#856404' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
             <AlertCircle size={18} /> <strong>Sản phẩm này đã bị ẩn bởi Admin</strong>
          </div>
          <p style={{ margin: 0, paddingLeft: '26px' }}>Lý do: {hiddenReason}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="sp-form-layout" encType="multipart/form-data">
        {/* ── Left: Main Info ── */}
        <div className="sp-form-main">

          {/* Thông tin cơ bản */}
          <div className="seller-form-section">
            <div className="seller-section-title"><Package size={15} /> Thông tin sản phẩm</div>
            <div className="seller-form-grid">

              <div className="seller-field span-2">
                <label>Tên sản phẩm <span className="req">*</span></label>
                <div className={`seller-input-wrap ${errors.TenSanPham ? 'is-invalid' : ''}`}>
                  <span className="seller-input-icon"><Package size={16} /></span>
                  <input
                    type="text"
                    placeholder="Tên sản phẩm..."
                    value={form.TenSanPham}
                    onChange={(e) => setField('TenSanPham', e.target.value)}
                    maxLength={200}
                  />
                </div>
                {errors.TenSanPham && <span className="seller-field-error">{errors.TenSanPham}</span>}
              </div>

              <div className="seller-field span-2">
                <label>Tiêu đề ngắn (Tittle)</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon"><Type size={16} /></span>
                  <input
                    type="text"
                    placeholder="Tiêu đề ngắn gọn..."
                    value={form.Tittle}
                    onChange={(e) => setField('Tittle', e.target.value)}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="seller-field span-2">
                <label>Mô tả chi tiết</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon" style={{ top: '0.9rem', alignSelf: 'flex-start' }}><FileText size={16} /></span>
                  <textarea
                    placeholder="Mô tả sản phẩm..."
                    value={form.MoTa}
                    onChange={(e) => setField('MoTa', e.target.value)}
                    rows={5}
                    maxLength={5000}
                  />
                </div>
              </div>

              <div className="seller-field span-2">
                <label>Nguồn gốc / Xuất xứ</label>
                <div className="seller-input-wrap">
                  <span className="seller-input-icon"><MapPin size={16} /></span>
                  <input
                    type="text"
                    placeholder="VD: Cà Mau, Bến Tre..."
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
                <select value={form.ID_PhanLoai} onChange={(e) => setField('ID_PhanLoai', e.target.value)}>
                  <option value="">-- Chọn phân loại --</option>
                  {categories.map((c) => (
                    <option key={c.ID_PhanLoai} value={c.ID_PhanLoai}>{c.TenLoai}</option>
                  ))}
                </select>
              </div>
              {errors.ID_PhanLoai && <span className="seller-field-error">{errors.ID_PhanLoai}</span>}
            </div>

            <div className="seller-field">
              <label>Tỉnh / Thành phố</label>
              <div className="seller-input-wrap">
                <span className="seller-input-icon"><MapPin size={16} /></span>
                <select value={form.ID_TinhThanh} onChange={(e) => setField('ID_TinhThanh', e.target.value)}>
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => (
                    <option key={p.ID_TinhThanh} value={p.ID_TinhThanh}>{p.TenTinhThanh}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ảnh hiện có */}
          {existingImages.length > 0 && (
            <div className="seller-form-section">
              <div className="seller-section-title"><Image size={15} /> Ảnh hiện tại</div>
              <p className="sp-img-hint">Bấm vào ảnh để đánh dấu xóa (màu đỏ = sẽ bị xóa)</p>
              <div className="current-images">
                {existingImages.map((img) => {
                  const marked = imagesToDelete.includes(img.ID_HinhAnh);
                  return (
                    <div
                      key={img.ID_HinhAnh}
                      className={`current-image-item ${marked ? 'selected' : ''}`}
                      onClick={() => toggleDeleteImage(img.ID_HinhAnh)}
                      title={marked ? 'Bấm để giữ lại ảnh này' : 'Bấm để xóa ảnh này'}
                    >
                      <img src={BASE_URL + img.HinhAnh} alt="Ảnh sản phẩm" />
                      {marked && <button className="remove-icon"><Trash2 size={14}/></button>}
                    </div>
                  );
                })}
              </div>
              {imagesToDelete.length > 0 && (
                <p className="sp-img-delete-note">
                  ⚠️ {imagesToDelete.length} ảnh sẽ bị xóa khi lưu.
                </p>
              )}
            </div>
          )}

          {/* Thêm ảnh mới */}
          <div className="seller-form-section">
            <div className="seller-section-title"><Image size={15} /> Thêm ảnh mới</div>
            <label className="seller-upload-area">
              <input type="file" accept="image/*" multiple onChange={handleNewImages} />
              <span className="seller-upload-icon">📸</span>
              <span className="seller-upload-label">
                <strong>Chọn ảnh</strong> hoặc kéo thả
              </span>
              <span className="seller-upload-hint">JPG, PNG, WEBP · Tối đa 5MB/ảnh</span>
            </label>

            {newImagePreviews.length > 0 && (
              <div className="current-images">
                {newImagePreviews.map((url, idx) => (
                  <div key={idx} className="current-image-item">
                    <img src={url} alt={`New ${idx + 1}`} />
                    <button type="button" className="remove-icon" onClick={() => removeNewImage(idx)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="seller-submit-btn" disabled={submitting || shop?.TrangThai === 0}>
            {submitting ? (
              <><RefreshCw size={17} className="sp-spin" /> Đang cập nhật...</>
            ) : shop?.TrangThai === 0 ? (
              <><AlertCircle size={17} /> Gian hàng đang bị khóa</>
            ) : (
              <><CheckCircle size={17} /> Lưu thay đổi</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
