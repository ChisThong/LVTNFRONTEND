import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { getSellerProducts, deleteProduct, updateProduct } from '../../api/productApi';
import { Plus, Edit2, AlertCircle, Trash2, Search, RotateCcw, Eye, EyeOff, Bell, Home } from 'lucide-react';
import '../../styles/seller.css';
import '../../styles/seller-products.css';

const BASE_URL = 'http://127.0.0.1:8000/storage/';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function SellerProducts() {
  const navigate = useNavigate();
  const { shop, shopLoading, shopError } = useOutletContext();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState('');

  // Lọc và Tìm kiếm
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [viewProduct, setViewProduct] = useState(null);

  /* ── 2. Load products ── */
  const fetchProducts = useCallback(() => {
    if (!shop) return;
    setProdLoading(true);
    setProdError('');
    getSellerProducts(shop.ID_Shop)
      .then((res) => {
        if (res.data?.success) {
          const raw = res.data.data;
          const list = raw?.data ?? raw ?? [];
          setProducts(Array.isArray(list) ? list : []);
        } else {
          setProdError(res.data?.message || 'Lấy sản phẩm thất bại.');
        }
      })
      .catch((err) => setProdError(err?.response?.data?.message || 'Lỗi kết nối.'))
      .finally(() => setProdLoading(false));
  }, [shop]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── 3. Xử lý ngừng bán / Bán lại ── */
  const handleDelete = async (product) => {
    setDeletingId(product.ID_SanPham);
    try {
      await deleteProduct(product.ID_SanPham);
      setSuccessMsg(`Đã ngừng bán sản phẩm "${product.TenSanPham}".`);
      setDeleteConfirm(null);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setProdError(err?.response?.data?.message || 'Ngừng bán thất bại.');
    } finally {
      setDeletingId(null);
    }
  };

  const [restoreConfirm, setRestoreConfirm] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const handleRestore = async (product) => {
    setRestoringId(product.ID_SanPham);
    try {
      const formData = new FormData();
      formData.append('TrangThai', 1);
      await updateProduct(product.ID_SanPham, formData);
      setSuccessMsg(`Đã bán lại sản phẩm "${product.TenSanPham}".`);
      setRestoreConfirm(null);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setProdError(err?.response?.data?.message || 'Khôi phục bán thất bại.');
    } finally {
      setRestoringId(null);
    }
  };

  /* ── Logic Lọc & Phân trang ── */
  const categories = [...new Set(products.map(p => p.phan_loai?.TenLoai).filter(Boolean))];

  const filtered = products.filter((p) => {
    const matchSearch = p.TenSanPham?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? p.phan_loai?.TenLoai === categoryFilter : true;
    const matchStatus = statusFilter !== '' ? parseInt(p.TrangThai) === parseInt(statusFilter) : true;
    const matchApproval = approvalFilter !== '' ? p.TrangThaiDuyet === approvalFilter : true;
    return matchSearch && matchCat && matchStatus && matchApproval;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  // Reset về trang 1 nếu list nhỏ hơn current page
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filtered.length, currentPage, totalPages]);

  const paginatedList = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Helper cho Avatar chữ
  const avatarText = shop?.TenShop ? shop.TenShop.substring(0, 2).toUpperCase() : 'BT';
  const displayName = shop?.TenShop || 'Cô Ba Bến Tre';

  /* ── Guard: loading shop ── */
  if (shopLoading) {
    return (
      <div className="sp-page-new">
        <div className="sp-skeleton-wrap" style={{ padding: '2rem' }}>
          <div className="seller-skeleton" style={{ height: 60, marginBottom: '1rem' }} />
          <div className="seller-skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  /* ── Guard: chưa có shop ── */
  if (shopError) {
    return (
      <div className="sp-page-new">
        <div className="sp-empty-state" style={{ margin: '2rem' }}>
          <div className="sp-empty-icon">🏪</div>
          <h2>{shopError}</h2>
          <p>Bạn cần có gian hàng để quản lý sản phẩm.</p>
          <Link to="/seller/register" className="seller-btn seller-btn-primary">
            Đăng ký gian hàng ngay
          </Link>
        </div>
      </div>
    );
  }

  /* ── Guard: shop chưa duyệt ── */
  if (shop && shop.TrangThaiDuyet !== 'da_duyet') {
    const isPending = shop.TrangThaiDuyet === 'cho_duyet';
    return (
      <div className="sp-page-new">
        <div className={`sp-status-block ${shop.TrangThaiDuyet}`} style={{ margin: '2rem' }}>
          <div className="sp-status-icon">{isPending ? '⏳' : '❌'}</div>
          <div>
            <h2>{isPending ? 'Gian hàng đang chờ duyệt' : 'Gian hàng bị từ chối'}</h2>
            <p>
              {isPending
                ? 'Gian hàng của bạn chưa được duyệt, chưa thể đăng sản phẩm. Thường mất 1–3 ngày làm việc.'
                : `Gian hàng bị từ chối. Lý do: ${shop.LyDoTuChoi || 'không có'}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-page-new">
      {/* ── TOPBAR ── */}
      <header className="sp-topbar-new">
        <div className="sp-search-pill">
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm theo tên, SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sp-topbar-actions-new">
          <Link to="/" className="sp-pill-btn">
            <Home size={18} /> Về trang chủ
          </Link>
          <button className="sp-circle-btn">
            <Bell size={18} />
            <span className="sp-noti-dot"></span>
          </button>
          <div className="sp-profile-pill">
            <div className="sp-avatar-circle">{avatarText}</div>
            <span className="sp-profile-name">{displayName}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="sp-content-new">
        
        {successMsg && <div className="seller-alert seller-alert-success" style={{ marginBottom: '1rem' }}>✅ {successMsg}</div>}
        {prodError && <div className="seller-alert seller-alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={16} /> {prodError}</div>}

        <div className="sp-title-row">
          <h1 className="sp-title-text">Danh sách sản phẩm</h1>
          {shop?.TrangThai !== 0 && (
            <Link to="/seller/products/create" className="sp-add-btn-dark">
              <Plus size={18} /> Thêm sản phẩm
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="sp-filters-row">
          <div className="sp-select-pill">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="sp-select-pill">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả bán hàng</option>
              <option value="1">Đang bán</option>
              <option value="0">Ngừng bán</option>
            </select>
          </div>

          <div className="sp-select-pill">
            <select value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)}>
              <option value="">Tất cả kiểm duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="tu_choi">Từ chối</option>
            </select>
          </div>

          <button className="sp-btn-refresh-new" onClick={fetchProducts} disabled={prodLoading} title="Làm mới">
            <RotateCcw size={16} className={prodLoading ? 'sp-spin' : ''} />
          </button>
        </div>

        {/* Table Card */}
        {prodLoading ? (
          <div className="sp-skeleton-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="seller-skeleton" style={{ height: 60, marginBottom: '0.5rem', borderRadius: 8 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sp-table-card">
            <div className="sp-empty-state" style={{ border: 'none', background: 'transparent' }}>
              <div className="sp-empty-icon">📦</div>
              <h2>Không tìm thấy sản phẩm nào</h2>
            </div>
          </div>
        ) : (
          <>
            <div className="sp-table-card">
              <table className="sp-new-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '2rem' }}>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Kho</th>
                    <th>Trạng thái</th>
                    <th align="right" style={{ paddingRight: '2rem' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((product) => {
                    const firstImg = product.hinh_anh?.[0]?.HinhAnh;
                    const imgUrl = firstImg ? BASE_URL + firstImg : null;
                    const isActive = parseInt(product.TrangThai) === 1;

                    return (
                      <tr key={product.ID_SanPham} className={!isActive ? 'row-disabled' : ''}>
                        <td style={{ paddingLeft: '2rem' }}>
                          <div className="sp-cell-product-new">
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.TenSanPham} className="sp-img-new" />
                            ) : (
                              <div className="sp-img-placeholder-new">🌾</div>
                            )}
                            <div className="sp-info-new">
                              <span className="sp-name-new">{product.TenSanPham}</span>
                              <span className="sp-origin-new">{product.NguonGoc || '—'}</span>
                              {product.TrangThaiHienThi === 'an' && (
                                <div style={{marginTop: '4px', fontSize: '0.8rem', color: '#856404', background: '#FFF3CD', padding: '4px 8px', borderRadius: '4px', display: 'inline-block'}}>
                                  <strong>Sản phẩm đang bị Admin ẩn. Lý do:</strong> {product.LyDoAdminAn || 'Không có lý do'}
                                </div>
                              )}
                              {product.TrangThaiDuyet === 'tu_choi' && (
                                <div style={{marginTop: '4px', fontSize: '0.8rem', color: '#DC2626', background: '#FEE2E2', padding: '4px 8px', borderRadius: '4px', display: 'inline-block'}}>
                                  <strong>Sản phẩm bị từ chối. Lý do:</strong> {product.LyDoTuChoi || 'Không có lý do'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-muted">{product.phan_loai?.TenLoai || '—'}</td>
                        <td className="sp-price-new">{formatPrice(product.Gia)}</td>
                        <td>
                          <span className={`sp-stock-new ${product.SoLuongTon === 0 ? 'out' : 'in'}`}>
                            {product.SoLuongTon} {product.Donvi || ''}
                          </span>
                        </td>
                        <td>
                          {product.TrangThaiHienThi === 'an' && (
                            <div style={{marginBottom: '4px'}}>
                              <span className="sp-badge-new inactive" style={{background: '#FFF3CD', color: '#856404'}}>
                                Bị Admin ẩn
                              </span>
                            </div>
                          )}
                          {product.TrangThaiDuyet === 'da_duyet' && product.TrangThaiHienThi !== 'an' && (
                            <div style={{marginBottom: '4px'}}>
                              <span className={`sp-badge-new ${isActive ? 'active' : 'inactive'}`}>
                                {isActive ? 'Đang bán' : 'Ngừng bán'}
                              </span>
                            </div>
                          )}

                          {product.TrangThaiDuyet === 'cho_duyet' && (
                            <span className="sp-badge-new" style={{background: '#FEF08A', color: '#854D0E'}}>🟡 Tạm ẩn - Chờ duyệt</span>
                          )}
                          {product.TrangThaiDuyet === 'da_duyet' && (
                            <span className="sp-badge-new" style={{background: '#BBF7D0', color: '#166534'}}>🟢 Đã duyệt</span>
                          )}
                          {product.TrangThaiDuyet === 'tu_choi' && (
                            <span className="sp-badge-new" style={{background: '#FECACA', color: '#991B1B'}}>🔴 Bị từ chối</span>
                          )}
                        </td>
                        <td style={{ paddingRight: '2rem' }}>
                          <div className="sp-actions-new">
                            <button className="btn-icon view" title="Xem" onClick={() => setViewProduct(product)}><Eye size={16} /></button>
                            {shop?.TrangThai !== 0 && (
                              <>
                                <Link to={`/seller/products/edit/${product.ID_SanPham}`} className="btn-icon edit" title="Sửa"><Edit2 size={16} /></Link>
                                {product.TrangThaiDuyet === 'da_duyet' && product.TrangThaiHienThi !== 'an' && (
                                  isActive ? (
                                    <button className="btn-icon delete" title="Ngừng bán" onClick={() => setDeleteConfirm(product)}><Trash2 size={16} /></button>
                                  ) : (
                                    <button className="btn-icon" style={{color: '#166534'}} title="Bán lại" onClick={() => setRestoreConfirm(product)}><RotateCcw size={16} /></button>
                                  )
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="sp-pagination-row">
              <div className="sp-page-text">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} trong số {filtered.length} sản phẩm
              </div>
              <div className="sp-page-controls">
                <button 
                  className="sp-page-btn-text" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Trang trước
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    className={`sp-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  className="sp-page-btn-text" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Trang sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {deleteConfirm && (
        <div className="sp-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-icon">⚠️</div>
            <h3 className="sp-modal-title">Ngừng bán sản phẩm?</h3>
            <p className="sp-modal-body">
              Sản phẩm <strong>"{deleteConfirm.TenSanPham}"</strong> sẽ được ẩn khỏi danh sách.
            </p>
            <div className="sp-modal-actions">
              <button className="seller-btn seller-btn-outline" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button className="sp-btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={deletingId === deleteConfirm.ID_SanPham}>
                {deletingId === deleteConfirm.ID_SanPham ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Confirm Modal ── */}
      {restoreConfirm && (
        <div className="sp-modal-backdrop" onClick={() => setRestoreConfirm(null)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-icon" style={{color: '#166534', background: '#BBF7D0'}}>♻️</div>
            <h3 className="sp-modal-title">Bán lại sản phẩm?</h3>
            <p className="sp-modal-body">
              Sản phẩm <strong>"{restoreConfirm.TenSanPham}"</strong> sẽ được mở bán lại trên gian hàng.
            </p>
            <div className="sp-modal-actions">
              <button className="seller-btn seller-btn-outline" onClick={() => setRestoreConfirm(null)}>Hủy</button>
              <button className="seller-btn seller-btn-primary" style={{background: '#166534'}} onClick={() => handleRestore(restoreConfirm)} disabled={restoringId === restoreConfirm.ID_SanPham}>
                {restoringId === restoreConfirm.ID_SanPham ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewProduct && (
        <div className="sp-modal-backdrop" onClick={() => setViewProduct(null)}>
          <div className="sp-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="sp-modal-close" onClick={() => setViewProduct(null)}>×</button>
            <h3 className="sp-modal-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Chi tiết sản phẩm</h3>
            <div className="sp-view-content">
              <div className="sp-view-images">
                {viewProduct.hinh_anh?.length > 0 ? (
                  viewProduct.hinh_anh.map((img, idx) => (
                    <img key={idx} src={BASE_URL + img.HinhAnh} alt="Product" />
                  ))
                ) : (
                  <div className="sp-thumb-placeholder" style={{ width: '100px', height: '100px' }}>🌾</div>
                )}
              </div>
              
              <div className="sp-view-details">
                <p><strong>Tên sản phẩm:</strong> {viewProduct.TenSanPham}</p>
                <p><strong>Tiêu đề ngắn:</strong> {viewProduct.Tittle || '—'}</p>
                <p><strong>Giá:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{formatPrice(viewProduct.Gia)}</span></p>
                <p><strong>Tồn kho:</strong> {viewProduct.SoLuongTon} {viewProduct.Donvi || ''}</p>
                <p><strong>Phân loại:</strong> {viewProduct.phan_loai?.TenLoai || '—'}</p>
                <p><strong>Tỉnh thành:</strong> {viewProduct.tinh_thanh?.TenTinhThanh || '—'}</p>
                <p><strong>Nguồn gốc:</strong> {viewProduct.NguonGoc || '—'}</p>
                <p><strong>Trạng thái duyệt:</strong> {viewProduct.TrangThaiDuyet === 'cho_duyet' ? 'Chờ duyệt' : (viewProduct.TrangThaiDuyet === 'da_duyet' ? 'Đã duyệt' : 'Từ chối')}</p>
                <p><strong>Trạng thái hiển thị:</strong> {viewProduct.TrangThaiHienThi === 'an' ? 'Bị Admin ẩn' : 'Đang hiển thị'}</p>
                <p><strong>Trạng thái bán:</strong> {parseInt(viewProduct.TrangThai) === 1 ? 'Đang bán' : 'Ngừng bán'}</p>
                
                {viewProduct.TrangThaiDuyet === 'tu_choi' && (
                  <div style={{ marginTop: '0.8rem', background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '0.8rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#DC2626' }}>🔴 Sản phẩm bị từ chối</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#991B1B', fontSize: '0.9rem' }}>Lý do: {viewProduct.LyDoTuChoi || 'Không có lý do'}</p>
                  </div>
                )}

                {viewProduct.TrangThaiHienThi === 'an' && (
                  <div style={{ marginTop: '0.8rem', background: '#FFF3CD', border: '1px solid #FFEEBA', padding: '0.8rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#856404' }}>🔴 Sản phẩm đang bị Admin ẩn</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#856404', fontSize: '0.9rem' }}>Lý do: {viewProduct.LyDoAdminAn || 'Không có lý do'}</p>
                  </div>
                )}
                <div style={{ marginTop: '0.8rem', borderTop: '1px solid #eee', paddingTop: '0.8rem' }}>
                  <strong>Mô tả chi tiết:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6', fontSize: '0.9rem' }}>{viewProduct.MoTa || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
