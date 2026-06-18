import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard';
import {
  getPublicProducts,
  getPhanLoai,
  getTinhThanh,
} from '../../api/productPublicApi';
import './ProductList.css';

/* ── Icon SVG ── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconChevronDown = ({ rotated }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ transition: 'transform 0.3s ease', transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="pl-skeleton-card">
      <div className="pl-skeleton-img" />
      <div className="pl-skeleton-line" style={{ width: '80%', marginTop: '0.85rem' }} />
      <div className="pl-skeleton-line" style={{ width: '55%' }} />
      <div className="pl-skeleton-line" style={{ width: '65%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div className="pl-skeleton-line" style={{ width: '40%', margin: 0 }} />
        <div className="pl-skeleton-circle" />
      </div>
    </div>
  );
}

/* ── Filter Group với Accordion ── */
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`pl-filter-group ${open ? '' : 'collapsed'}`}>
      <h3 className="pl-filter-toggle" onClick={() => setOpen(o => !o)}>
        {title}
        <IconChevronDown rotated={!open} />
      </h3>
      <div className="pl-filter-content">
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENT CHÍNH
   ════════════════════════════════════════════════════════════ */
export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──────────────────────────────────────────────────
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [provinces, setProvinces]     = useState([]);
  const [pagination, setPagination]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [priceMax, setPriceMax]       = useState(1000000);

  // Đọc filter từ URL
  const activeCategory = searchParams.get('ID_PhanLoai') || '';
  const activeTinh     = searchParams.get('tinh') || '';
  const currentPage    = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery    = searchParams.get('search') || '';
  const urlPriceMax    = parseInt(searchParams.get('gia_max') || '1000000', 10);

  // Sync priceMax slider từ URL
  useEffect(() => { setPriceMax(urlPriceMax); }, [urlPriceMax]);

  // ── Fetch categories & provinces ──────────────────────────
  useEffect(() => {
    getPhanLoai()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    getTinhThanh()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setProvinces(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  // ── Fetch products ──────────────────────────────────────────
  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { per_page: 12, page: currentPage };
    if (searchQuery)    params.search      = searchQuery;
    if (activeCategory) params.ID_PhanLoai = activeCategory;
    if (urlPriceMax < 1000000) params.gia_max = urlPriceMax;

    getPublicProducts(params)
      .then(res => {
        const payload = res.data?.data || {};
        setProducts(payload.data || []);
        setPagination({
          currentPage: payload.current_page,
          lastPage:    payload.last_page,
          total:       payload.total,
          from:        payload.from,
          to:          payload.to,
        });
      })
      .catch(() => setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [currentPage, searchQuery, activeCategory, urlPriceMax]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Handlers ────────────────────────────────────────────────
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleCategoryClick = (catId) => updateParam('ID_PhanLoai', catId);
  const handleTinhChange    = (e)      => updateParam('tinh', e.target.value);

  const handlePriceCommit = () => {
    const next = new URLSearchParams(searchParams);
    if (priceMax < 1000000) next.set('gia_max', priceMax);
    else next.delete('gia_max');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    setSearchInput('');
    setPriceMax(1000000);
    setSearchParams({});
  };

  // ── Cart helper ─────────────────────────────────────────────
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.ID_SanPham);
    
    if (existing) {
      existing.qty += 1;
    } else {
      const hinhAnhUrl = product.hinh_anh && product.hinh_anh.length > 0 ? product.hinh_anh[0].HinhAnh : null;
      cart.push({ 
        id: product.ID_SanPham, 
        name: product.TenSanPham, 
        qty: 1, 
        price: product.Gia,
        HinhAnh: hinhAnhUrl,
        ID_Shop: product.shop?.ID_Shop || product.ID_Shop || 'shop_0',
        TenShop: product.shop?.TenShop || 'Gian hàng đặc sản'
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-change'));
    showToast(`Đã thêm "${product.TenSanPham}" vào giỏ hàng!`);
  };

  const showToast = (msg) => {
    const el = document.createElement('div');
    el.className = 'pl-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('pl-toast--show'));
    setTimeout(() => {
      el.classList.remove('pl-toast--show');
      setTimeout(() => el.remove(), 400);
    }, 2500);
  };

  // ── Format giá slider ───────────────────────────────────────
  const formatSliderPrice = (val) =>
    val >= 1000000 ? '1.000.000đ+' : val.toLocaleString('vi-VN') + 'đ';

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <>

      {/* ══ Page Header — theo demo CSS: height 450px, blur bg, wave bottom ══ */}
      <section className="pl-page-header">
        <div className="pl-header-content">
          <h1>Danh Mục Đặc Sản</h1>
          <p>Khám phá tinh hoa ẩm thực từ khắp các tỉnh thành Miền Nam</p>
        </div>
      </section>

      {/* ══ Products Explorer ══ */}
      <section className="pl-products-explorer">
        <div className="pl-explorer-container">

          {/* ── Filter Sidebar ── */}
          <aside className="pl-filter-sidebar">

            {/* Danh mục */}
            <FilterGroup title="Danh mục">
              <ul className="pl-category-list">
                <li
                  className={activeCategory === '' ? 'active' : ''}
                  onClick={() => handleCategoryClick('')}
                >
                  Tất cả
                </li>
                {categories.map(cat => (
                  <li
                    key={cat.ID_PhanLoai}
                    className={activeCategory === String(cat.ID_PhanLoai) ? 'active' : ''}
                    onClick={() => handleCategoryClick(String(cat.ID_PhanLoai))}
                  >
                    {cat.TenLoai}
                  </li>
                ))}
              </ul>
            </FilterGroup>

            {/* Vùng miền */}
            <FilterGroup title="Vùng miền">
              <select
                id="region-filter"
                className="pl-region-select"
                value={activeTinh}
                onChange={handleTinhChange}
              >
                <option value="">Toàn miền Nam</option>
                {provinces.map(t => (
                  <option key={t.ID_TinhThanh || t.TenTinhThanh} value={t.TenTinhThanh}>{t.TenTinhThanh}</option>
                ))}
              </select>
            </FilterGroup>

            {/* Giá cả */}
            <FilterGroup title="Giá cả">
              <div className="pl-price-range">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="50000"
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  onMouseUp={handlePriceCommit}
                  onTouchEnd={handlePriceCommit}
                  className="pl-price-slider"
                />
                <div className="pl-price-labels">
                  <span>0đ</span>
                  <span id="priceValue">{formatSliderPrice(priceMax)}</span>
                </div>
              </div>
            </FilterGroup>

            {/* Clear filters */}
            {(activeCategory || activeTinh || searchQuery || urlPriceMax < 1000000) && (
              <button className="pl-clear-filter-btn" onClick={handleClearAll}>
                ✕ Xóa bộ lọc
              </button>
            )}
          </aside>

          {/* ── Products Grid Container ── */}
          <div className="pl-products-grid-container">

            {/* Search bar — icon bên trái theo demo */}
            <form className="pl-search-bar-inline" onSubmit={handleSearchSubmit}>
              <span className="pl-search-icon"><IconSearch /></span>
              <input
                id="productSearch"
                type="text"
                placeholder="Tìm kiếm đặc sản..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </form>

            {/* Result info */}
            {!loading && pagination && (
              <p className="pl-result-info">
                {searchQuery && <span>Kết quả cho "<strong>{searchQuery}</strong>": </span>}
                {pagination.total > 0
                  ? `Hiển thị ${pagination.from}–${pagination.to} / ${pagination.total} sản phẩm`
                  : 'Không tìm thấy sản phẩm nào'}
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="pl-error">
                <span>⚠️</span>
                <p>{error}</p>
                <button onClick={fetchProducts}>Thử lại</button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="pl-products-grid">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="pl-empty">
                <span className="pl-empty-icon">🍃</span>
                <h3>Không tìm thấy sản phẩm nào</h3>
                <p>Hãy thử từ khóa khác hoặc bỏ bộ lọc.</p>
                <button className="pl-clear-btn" onClick={handleClearAll}>Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="pl-products-grid">
                {products.map((product, idx) => (
                  <ProductCard
                    key={product.ID_SanPham}
                    product={product}
                    index={idx}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination && pagination.lastPage > 1 && (
              <nav className="pl-pagination" aria-label="Phân trang">
                <button
                  className="pl-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >‹</button>

                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === pagination.lastPage)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="pl-page-dots">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`pl-page-btn ${p === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >{p}</button>
                    )
                  )}

                <button
                  className="pl-page-btn"
                  disabled={currentPage >= pagination.lastPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >›</button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
