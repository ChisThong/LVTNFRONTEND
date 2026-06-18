import { useState, useEffect } from 'react';
import { Package, Search, Eye, EyeOff, Store, Check, X, Trash2, RefreshCcw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../../styles/admin-product.css';

export default function AdminProductControl() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, cho_duyet, da_duyet, tu_choi, hidden
  const [search, setSearch] = useState('');
  
  // Filter by Shop
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  
  // States cho Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Thống kê
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    hidden: 0,
    outOfStock: 0
  });

  // Modal chi tiết
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal từ chối duyệt
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [productToReject, setProductToReject] = useState(null);

  // Helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        per_page: 15,
        search: search
      };

      if (activeTab === 'hidden') params.trang_thai = 0;
      if (activeTab === 'cho_duyet') params.trang_thai_duyet = 'cho_duyet';
      if (activeTab === 'da_duyet') params.trang_thai_duyet = 'da_duyet';
      if (activeTab === 'tu_choi') params.trang_thai_duyet = 'tu_choi';
      if (activeTab === 'dang_hien') params.trang_thai_hien_thi = 'hien';
      if (activeTab === 'dang_an')   params.trang_thai_hien_thi = 'an';
      
      if (selectedShopId) params.id_shop = selectedShopId;
      
      const response = await axiosClient.get('/admin/products', { params });
      
      // Xử lý Out of stock nội bộ ở client hoặc xử lý trên server đều được. 
      // Tạm thời hiển thị danh sách từ server
      let fetchedProducts = response.data.data.data;

      setProducts(fetchedProducts);
      setCurrentPage(response.data.data.current_page);
      setTotalPages(response.data.data.last_page);
      setTotalProducts(response.data.data.total);

      // Cập nhật stats nếu ở tab Tất cả
      if (activeTab === 'all' && search === '') {
        // Fetch full để đếm hoặc sử dụng API chuyên dụng (trong bài toán này mô phỏng đếm từ trang hiện tại + metadata nếu có)
        // Đây là mock đếm cơ bản dựa trên response, trong thực tế nên có 1 API đếm riêng
      }
    } catch (error) {
      console.error('Lỗi fetch sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính lại stats mỗi khi products thay đổi nếu ở chế độ xem tất cả
  useEffect(() => {
    if (activeTab === 'all' && search === '') {
      // Chỉ mang tính chất tương đối trên trang hiện tại nếu backend chưa support count
      // Bạn có thể phát triển thêm API count sau.
      setStats({
         total: totalProducts,
         active: '...',
         hidden: '...',
         outOfStock: '...'
      });
    }
  }, [totalProducts, activeTab, search]);

  useEffect(() => {
    fetchProducts(1);
  }, [activeTab, selectedShopId]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axiosClient.get('/admin/shops?per_page=100');
        if (res.data?.data?.data) {
          setShops(res.data.data.data);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách shop:', err);
      }
    };
    fetchShops();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
    }
  };



  const handleApprove = async (product) => {
    if (!window.confirm(`Bạn có chắc muốn duyệt sản phẩm "${product.TenSanPham}"?`)) return;
    try {
      await axiosClient.put(`/admin/products/${product.ID_SanPham}/approve`);
      alert('Đã duyệt sản phẩm thành công!');
      fetchProducts(currentPage);
      if (isModalOpen && selectedProduct?.ID_SanPham === product.ID_SanPham) {
         setSelectedProduct({...selectedProduct, TrangThaiDuyet: 'da_duyet', LyDoTuChoi: null});
      }
    } catch (error) {
      console.error('Lỗi duyệt sản phẩm:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const openRejectModal = (product) => {
    setProductToReject(product);
    setRejectReason('');
    setRejectReasonModalOpen(true);
  };

  const submitRejectProduct = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await axiosClient.put(`/admin/products/${productToReject.ID_SanPham}/reject`, { LyDoTuChoi: rejectReason });
      alert('Đã từ chối sản phẩm thành công!');
      setRejectReasonModalOpen(false);
      setProductToReject(null);
      fetchProducts(currentPage);
      if (isModalOpen && selectedProduct?.ID_SanPham === productToReject.ID_SanPham) {
         setSelectedProduct({...selectedProduct, TrangThaiDuyet: 'tu_choi', LyDoTuChoi: rejectReason});
      }
    } catch (error) {
      console.error('Lỗi từ chối sản phẩm:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const openDetailModal = async (product) => {
    try {
      // Fetch chi tiết đầy đủ để đảm bảo dữ liệu mới nhất
      const res = await axiosClient.get(`/admin/products/${product.ID_SanPham}`);
      setSelectedProduct(res.data.data);
      setIsModalOpen(true);
    } catch (err) {
      alert("Không thể tải chi tiết sản phẩm");
    }
  };

  const openShop = (shopId) => {
    window.open(`/shops/${shopId}`, '_blank');
  };

  // Toggle hiển thị Admin (hien <-> an)
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  const [visibilityReason, setVisibilityReason] = useState('');
  const [productToToggle, setProductToToggle] = useState(null);

  const openVisibilityModal = (product) => {
    // Chỉ cần lý do khi Ẩn (hien -> an)
    if (product.TrangThaiHienThi === 'hien') {
      setProductToToggle(product);
      setVisibilityReason('');
      setVisibilityModalOpen(true);
    } else {
      // Hiện lại ngay, không cần lý do
      handleToggleVisibility(product, '');
    }
  };

  const handleToggleVisibility = async (product, reason) => {
    try {
      const payload = product.TrangThaiHienThi === 'hien'
        ? { LyDoAdminAn: reason }
        : {};
      const res = await axiosClient.patch(`/admin/products/${product.ID_SanPham}/toggle-visibility`, payload);
      const newVisibility = res.data.visibility;
      alert(newVisibility === 'an' ? 'Admin đã ẩn sản phẩm khỏi website.' : 'Admin đã hiện lại sản phẩm.');
      setVisibilityModalOpen(false);
      setProductToToggle(null);
      fetchProducts(currentPage);
      if (isModalOpen && selectedProduct?.ID_SanPham === product.ID_SanPham) {
        setSelectedProduct(prev => ({ ...prev, TrangThaiHienThi: newVisibility, LyDoAdminAn: newVisibility === 'an' ? reason : null }));
      }
    } catch (error) {
      console.error('Lỗi toggle visibility:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const submitToggleVisibility = () => {
    if (!visibilityReason.trim()) {
      alert('Vui lòng nhập lý do ẩn sản phẩm!');
      return;
    }
    handleToggleVisibility(productToToggle, visibilityReason);
  };

  return (
    <div className="admin-product-page">
      <div className="page-header">
        <div className="header-content">
          <h1><Package size={28} style={{marginRight: '12px'}}/> Quản lý sản phẩm</h1>
          <p>Kiểm soát toàn bộ sản phẩm của gian hàng trên hệ thống NamBộ CENTRAL</p>
        </div>
      </div>

      <div className="filter-section">
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <form className="search-bar" onSubmit={handleSearch} style={{ flex: 1, margin: 0, minWidth: '300px' }}>
            <Search size={20} color="#7A6652" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên sản phẩm..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <select 
            className="admin-form-control" 
            value={selectedShopId} 
            onChange={(e) => setSelectedShopId(e.target.value)}
            style={{ 
              padding: '0 1rem', 
              borderRadius: '8px', 
              border: '1px solid transparent', 
              minWidth: '220px', 
              background: '#F8F5F1', 
              color: '#4A3B32', 
              fontWeight: 600, 
              outline: 'none',
              height: '46px'
            }}
          >
            <option value="">-- Tất cả gian hàng --</option>
            {shops.map(shop => (
              <option key={shop.ID_Shop} value={shop.ID_Shop}>{shop.TenShop}</option>
            ))}
          </select>
        </div>

        <div className="status-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            Tất cả
          </button>
          <button className={`tab-btn ${activeTab === 'cho_duyet' ? 'active' : ''}`} onClick={() => setActiveTab('cho_duyet')}>
            Chờ duyệt
          </button>
          <button className={`tab-btn ${activeTab === 'da_duyet' ? 'active' : ''}`} onClick={() => setActiveTab('da_duyet')}>
            Đã duyệt
          </button>
          <button className={`tab-btn ${activeTab === 'tu_choi' ? 'active' : ''}`} onClick={() => setActiveTab('tu_choi')}>
            Từ chối
          </button>
          <button className={`tab-btn ${activeTab === 'hidden' ? 'active' : ''}`} onClick={() => setActiveTab('hidden')}>
            Seller Ẩn
          </button>
          <button className={`tab-btn ${activeTab === 'dang_hien' ? 'active' : ''}`} onClick={() => setActiveTab('dang_hien')}>
            Đang hiển
          </button>
          <button className={`tab-btn ${activeTab === 'dang_an' ? 'active' : ''}`} onClick={() => setActiveTab('dang_an')}>
            Admin Ẩn
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7A6652' }}>Đang tải dữ liệu...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#7A6652' }}>
            {activeTab === 'out_of_stock' ? 'Không có sản phẩm nào hết hàng.' : 'Chưa có sản phẩm nào trong hệ thống.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>SẢN PHẨM</th>
                <th>GIAN HÀNG</th>
                <th>DANH MỤC</th>
                <th>GIÁ</th>
                <th>TỒN KHO</th>
                <th>DUYỆT</th>
                <th>SELLER</th>
                <th>ADMIN HIỂN</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isOutOfStock = product.SoLuongTon === 0;
                const isHidden = product.TrangThai === 0;
                
                let displayBadge = <span className="status-badge badge-approved">ĐANG BÁN</span>;
                if (isHidden) {
                  displayBadge = <span className="status-badge badge-hidden">ĐÃ ẨN</span>;
                } else if (isOutOfStock) {
                  displayBadge = <span className="status-badge badge-rejected">HẾT HÀNG</span>;
                }

                let approvalBadge;
                if (product.TrangThaiDuyet === 'cho_duyet') approvalBadge = <span className="status-badge badge-pending">Chờ duyệt</span>;
                else if (product.TrangThaiDuyet === 'da_duyet') approvalBadge = <span className="status-badge badge-approved">Đã duyệt</span>;
                else if (product.TrangThaiDuyet === 'tu_choi') approvalBadge = <span className="status-badge badge-rejected">Từ chối</span>;
                else approvalBadge = <span className="status-badge badge-hidden">Không rõ</span>;

                // Badge hiển thị Admin
                const visibilityBadge = product.TrangThaiHienThi === 'hien'
                  ? <span className="status-badge badge-selling">○ Hiện</span>
                  : <span className="status-badge badge-hidden">✕ Admin Ẩn</span>;

                return (
                  <tr key={product.ID_SanPham}>
                    <td>
                      <div className="shop-info-cell">
                        <img 
                          src={product.hinh_anh && product.hinh_anh.length > 0 && product.hinh_anh[0].HinhAnh 
                            ? (product.hinh_anh[0].HinhAnh.startsWith('http') ? product.hinh_anh[0].HinhAnh : `http://127.0.0.1:8000/storage/${product.hinh_anh[0].HinhAnh}`) 
                            : 'https://via.placeholder.com/50'} 
                          alt="product"
                          style={{borderRadius: '8px'}}
                        />
                        <span className="product-name-col" style={{ fontWeight: 600, color: '#1A2616' }}>{product.TenSanPham}</span>
                      </div>
                    </td>
                    <td>
                      {product.shop ? (
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span className="shop-name-col" style={{fontWeight: 'bold', color: '#D4A373'}}>{product.shop.TenShop}</span>
                          <span style={{fontSize: '0.85rem', color: '#666'}}>Chủ: {product.shop.user?.HoTen || 'N/A'}</span>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td style={{fontWeight: 500}}>{product.phan_loai?.TenLoai || 'N/A'}</td>
                    <td style={{fontWeight: 'bold', color: '#D4A373'}}>{formatPrice(product.Gia)}</td>
                    <td style={{textAlign: 'center', fontWeight: 'bold'}}>{product.SoLuongTon}</td>
                    <td>{approvalBadge}</td>
                    <td>{displayBadge}</td>
                    <td>{visibilityBadge}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="Xem chi tiết" onClick={() => openDetailModal(product)}>
                          <Eye size={18} />
                        </button>
                        <button className="action-btn shop" title="Đến trang Shop" onClick={() => openShop(product.ID_Shop)}>
                          <Store size={18} />
                        </button>
                        
                        {product.TrangThaiDuyet === 'cho_duyet' && (
                          <>
                            <button className="action-btn approve" title="Duyệt" onClick={() => handleApprove(product)}>
                              <Check size={18} />
                            </button>
                            <button className="action-btn reject" title="Từ chối" onClick={() => openRejectModal(product)}>
                              <X size={18} />
                            </button>
                          </>
                        )}

                        {/* Toggle Admin visibility */}
                        {product.TrangThaiHienThi === 'hien' ? (
                          <button className="action-btn reject" title="Admin ẩn khỏi website" onClick={() => openVisibilityModal(product)}>
                            <EyeOff size={18} />
                          </button>
                        ) : (
                          <button className="action-btn approve" title="Admin hiện lại" onClick={() => openVisibilityModal(product)}>
                            <Eye size={18} />
                          </button>
                        )}


                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: currentPage === page ? '#A3432D' : '#fff',
                    color: currentPage === page ? '#fff' : '#333',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
             ))}
          </div>
        )}
      </div>

      {/* Modal Chi tiết sản phẩm */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="pdetail-modal" onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="pdetail-header">
              <h2 className="pdetail-title">Chi tiết sản phẩm</h2>
              <button className="pdetail-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="pdetail-body">

              {/* Cột trái: ảnh */}
              <div className="pdetail-gallery">
                <img
                  className="pdetail-main-img"
                  src={
                    selectedProduct.hinh_anh && selectedProduct.hinh_anh.length > 0
                      ? (selectedProduct.hinh_anh[0].HinhAnh.startsWith('http')
                          ? selectedProduct.hinh_anh[0].HinhAnh
                          : `http://127.0.0.1:8000/storage/${selectedProduct.hinh_anh[0].HinhAnh}`)
                      : 'https://via.placeholder.com/300'
                  }
                  alt={selectedProduct.TenSanPham}
                />
                {selectedProduct.hinh_anh && selectedProduct.hinh_anh.length > 1 && (
                  <div className="pdetail-thumbs">
                    {selectedProduct.hinh_anh.slice(1).map((ha, idx) => (
                      <img
                        key={idx}
                        className="pdetail-thumb"
                        src={ha.HinhAnh.startsWith('http') ? ha.HinhAnh : `http://127.0.0.1:8000/storage/${ha.HinhAnh}`}
                        alt={`thumb-${idx}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Cột phải: thông tin */}
              <div className="pdetail-info">
                <h3 className="pdetail-product-name">{selectedProduct.TenSanPham}</h3>
                <p className="pdetail-price">{formatPrice(selectedProduct.Gia)}</p>

                {/* Grid thông tin cơ bản */}
                <div className="pdetail-meta-grid">
                  <div className="pdetail-meta-item">
                    <span className="pdetail-meta-label">Danh mục</span>
                    <strong>{selectedProduct.phan_loai?.TenLoai || 'N/A'}</strong>
                  </div>
                  <div className="pdetail-meta-item">
                    <span className="pdetail-meta-label">Khu vực</span>
                    <strong>{selectedProduct.tinh_thanh?.TenTinhThanh || 'N/A'}</strong>
                  </div>
                  <div className="pdetail-meta-item">
                    <span className="pdetail-meta-label">Đơn vị tính</span>
                    <strong>{selectedProduct.DonViTinh || selectedProduct.Donvi || 'Sản phẩm'}</strong>
                  </div>
                  <div className="pdetail-meta-item">
                    <span className="pdetail-meta-label">Tồn kho</span>
                    <strong>{selectedProduct.SoLuongTon}</strong>
                  </div>
                  <div className="pdetail-meta-item">
                    <span className="pdetail-meta-label">Trạng thái duyệt</span>
                    <span className={`pdetail-badge ${
                      selectedProduct.TrangThaiDuyet === 'cho_duyet' ? 'pdetail-badge-pending'  :
                      selectedProduct.TrangThaiDuyet === 'da_duyet'  ? 'pdetail-badge-approved' :
                      selectedProduct.TrangThaiDuyet === 'tu_choi'   ? 'pdetail-badge-rejected' : 'pdetail-badge-hidden'
                    }`}>
                      {selectedProduct.TrangThaiDuyet === 'cho_duyet' ? 'Chờ duyệt'  :
                       selectedProduct.TrangThaiDuyet === 'da_duyet'  ? 'Đã duyệt' :
                       selectedProduct.TrangThaiDuyet === 'tu_choi'   ? 'Từ chối'   : 'N/A'}
                    </span>
                  </div>
                  <div className="pdetail-meta-item">
                    <span className="pdetail-meta-label">Hiển thị</span>
                    <span className={`pdetail-badge ${selectedProduct.TrangThai === 1 ? 'pdetail-badge-selling' : 'pdetail-badge-hidden'}`}>
                      {selectedProduct.TrangThai === 1 ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </div>
                </div>

                {/* Thông tin shop */}
                <div className="pdetail-shop-card">
                  <div className="pdetail-shop-icon">
                    <Store size={20} />
                  </div>
                  <div>
                    <div className="pdetail-shop-name">{selectedProduct.shop?.TenShop || 'N/A'}</div>
                    <div className="pdetail-shop-sub">SĐT: {selectedProduct.shop?.SoDienThoai || 'N/A'}</div>
                    <div className="pdetail-shop-sub">Chủ: {selectedProduct.shop?.user?.HoTen || 'N/A'}</div>
                  </div>
                </div>

                {/* Mô tả */}
                <div className="pdetail-desc-section">
                  <h4 className="pdetail-section-title">Mô tả sản phẩm</h4>
                  <p className="pdetail-desc-text">
                    {selectedProduct.MoTa || selectedProduct.MoTaSanPham || 'Chưa có mô tả.'}
                  </p>
                </div>

                {/* Lý do từ chối */}
                {selectedProduct.TrangThaiDuyet === 'tu_choi' && selectedProduct.LyDoTuChoi && (
                  <div className="pdetail-alert pdetail-alert-red">
                    <h4>Lý do từ chối duyệt</h4>
                    <p>{selectedProduct.LyDoTuChoi}</p>
                  </div>
                )}

                {/* Lý do ẩn */}
                {selectedProduct.TrangThai === 0 && selectedProduct.LyDoAn && (
                  <div className="pdetail-alert pdetail-alert-yellow">
                    <h4>Lý do bị ẩn</h4>
                    <p>{selectedProduct.LyDoAn}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="pdetail-footer">
              <button className="pdetail-btn pdetail-btn-close" onClick={() => setIsModalOpen(false)}>
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}



      {/* Modal nhập lý do từ chối sản phẩm */}
      {rejectReasonModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectReasonModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <h3 style={{marginTop: 0, color: '#1C1917', fontSize: '1.25rem'}}>Lý do từ chối sản phẩm</h3>
            <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '12px'}}>
              Vui lòng nhập lý do từ chối <strong>{productToReject?.TenSanPham}</strong> để người bán biết và khắc phục.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do (ví dụ: Sai danh mục, thông tin sai lệch...)"
              rows={4}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
                fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical'
              }}
              autoFocus
            />
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px'}}>
              <button 
                onClick={() => setRejectReasonModalOpen(false)}
                style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600}}
              >
                Hủy
              </button>
              <button 
                onClick={submitRejectProduct}
                style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#991B1B', color: '#fff', cursor: 'pointer', fontWeight: 600}}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal lý do Admin ẩn sản phẩm */}
      {visibilityModalOpen && productToToggle && (
        <div className="modal-overlay" onClick={() => setVisibilityModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <h3 style={{marginTop: 0, color: '#1C1917', fontSize: '1.25rem'}}>Admin ẩn sản phẩm</h3>
            <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '12px'}}>
              Nhập lý do ẩn sản phẩm <strong>{productToToggle?.TenSanPham}</strong> khỏi website.
              <br/><em style={{color:'#888'}}>Seller sẽ thấy thông báo "Sản phẩm đang bị Admin ẩn".</em>
            </p>
            <textarea
              value={visibilityReason}
              onChange={(e) => setVisibilityReason(e.target.value)}
              placeholder="Nhập lý do (ví dụ: Sản phẩm vi phạm chính sách, hình ảnh không phù hợp...)"
              rows={4}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
                fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px'}}>
              <button
                onClick={() => setVisibilityModalOpen(false)}
                style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#eee', cursor: 'pointer', fontWeight: 600}}
              >
                Hủy
              </button>
              <button
                onClick={submitToggleVisibility}
                style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#1D4ED8', color: '#fff', cursor: 'pointer', fontWeight: 600}}
              >
                Xác nhận ẩn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
