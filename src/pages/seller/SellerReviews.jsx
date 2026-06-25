import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Home, Bell, Star, MessageSquare, Check, X, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSellerReviews, useReplyReview } from '../../api/reviewApi';
import { getMyShop } from '../../api/shopApi';
import '../../styles/seller-products.css';

const BACKEND_URL = "http://127.0.0.1:8000/storage/";

const getReviewImage = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
};

export default function SellerReviews() {
  const [replyInputs, setReplyInputs] = useState({}); 
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Filters
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all', 5, 4, 3, 2, 1
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'replied', 'unreplied'
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xem ảnh lớn
  const [selectedImage, setSelectedImage] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Lấy thông tin shop sử dụng useQuery
  const { data: shop } = useQuery({
    queryKey: ['myShop'],
    queryFn: async () => {
      try {
        const res = await getMyShop();
        if (res.data?.success) {
          return res.data.data;
        }
      } catch (err) {
        toast.error('Lỗi khi tải thông tin cửa hàng.');
      }
      return null;
    }
  });

  const avatarText = shop?.TenShop ? shop.TenShop.substring(0, 2).toUpperCase() : 'SH';
  const displayName = shop?.TenShop || 'Gian hàng';

  // Lấy danh sách đánh giá sử dụng useQuery
  const { data: reviewsResponse, isLoading: loading } = useSellerReviews(shop?.ID_Shop, currentPage);

  const reviews = reviewsResponse?.data?.data || [];
  const lastPage = reviewsResponse?.data?.last_page || 1;
  const totalReviews = reviewsResponse?.data?.total || 0;

  // Sử dụng useMutation phản hồi đánh giá
  const replyMutation = useReplyReview();
  const submittingReply = replyMutation.isPending;

  const handleReplySubmit = async (reviewId) => {
    const content = replyInputs[reviewId]?.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    replyMutation.mutate(
      { idDanhGia: reviewId, noiDungPhanHoi: content },
      {
        onSuccess: (res) => {
          if (res.data?.success) {
            toast.success('Gửi phản hồi thành công!');
            setActiveReplyId(null);
            handleInputChange(reviewId, '');
          } else {
            toast.error(res.data?.message || 'Gửi phản hồi thất bại');
          }
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || 'Gửi phản hồi thất bại');
        }
      }
    );
  };

  const handleInputChange = (reviewId, val) => {
    setReplyInputs(prev => ({
      ...prev,
      [reviewId]: val
    }));
  };

  // Tính toán KPI nội bộ (dựa trên toàn bộ reviews của trang hiện tại/hoặc tổng số)
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.XepLoai), 0) / reviews.length).toFixed(1)
    : '5.0';

  const replyRate = reviews.length > 0
    ? Math.round((reviews.filter(r => r.phan_hoi).length / reviews.length) * 100)
    : 100;


  // Lọc cục bộ các bài đánh giá nhận được để hiển thị
  const filteredReviews = reviews.filter(r => {
    const matchRating = ratingFilter === 'all' || Number(r.XepLoai) === Number(ratingFilter);
    const matchStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'replied' 
        ? r.phan_hoi !== null 
        : r.phan_hoi === null;
    
    const searchLower = searchTerm.toLowerCase();
    const productName = r.san_pham?.TenSanPham || '';
    const userName = r.user?.HoTen || '';
    const matchSearch = productName.toLowerCase().includes(searchLower) || userName.toLowerCase().includes(searchLower);

    return matchRating && matchStatus && matchSearch;
  });

  const getStarRatingText = (stars) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < stars ? "#EAB308" : "none"} 
        stroke={i < stars ? "#EAB308" : "#D1D5DB"} 
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="sp-page-new">
      {/* ── TOPBAR ── */}
      <header className="sp-topbar-new">
        <div className="sp-search-pill">
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm, người dùng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="sp-title-row" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div>
            <h1 className="sp-title-text" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>
              Quản lý đánh giá khách hàng
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
              Xem các ý kiến phản hồi từ khách hàng mua sản phẩm và gửi câu trả lời từ gian hàng.
            </p>
          </div>
        </div>

        {/* ── KPI STATS CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Card 1 */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ background: '#FFFDF5', border: '1px solid #FDE047', padding: '12px', borderRadius: '10px', color: '#EAB308' }}>
              <Star size={24} fill="#EAB308" />
            </div>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 600 }}>SAO TRUNG BÌNH</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                {averageRating} <span style={{ fontSize: '1rem', color: '#6B7280', fontWeight: 'normal' }}>/ 5</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '12px', borderRadius: '10px', color: '#4F46E5' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 600 }}>TỔNG ĐÁNH GIÁ</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>
                {totalReviews}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '10px', color: '#059669' }}>
              <Check size={24} />
            </div>
            <div>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 600 }}>TỶ LỆ PHẢN HỒI</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
                {replyRate}%
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          {/* Lọc theo Sao */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Số sao:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatingFilter(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: ratingFilter === s ? '#2C3A29' : '#fff',
                    color: ratingFilter === s ? '#fff' : '#4B5563',
                    borderColor: ratingFilter === s ? '#2C3A29' : '#D1D5DB',
                  }}
                >
                  {s === 'all' ? 'Tất cả' : `${s} ★`}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc theo Trạng thái Phản hồi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Trạng thái:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { val: 'all', label: 'Tất cả' },
                { val: 'unreplied', label: 'Chưa phản hồi' },
                { val: 'replied', label: 'Đã phản hồi' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setStatusFilter(opt.val)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: statusFilter === opt.val ? '#2C3A29' : '#fff',
                    color: statusFilter === opt.val ? '#fff' : '#4B5563',
                    borderColor: statusFilter === opt.val ? '#2C3A29' : '#D1D5DB',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LIST REVIEWS ── */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(44,58,41,0.1)', borderTopColor: '#2C3A29', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
            <p>Đang tải danh sách đánh giá từ máy chủ...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#6B7280', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Không tìm thấy đánh giá nào</p>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', margin: '4px 0 0 0' }}>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReviews.map((review) => (
              <div 
                key={review.ID_DanhGia} 
                style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB', 
                  padding: '1.5rem', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s',
                }}
              >
                {/* Header đánh giá */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${review.user?.HoTen || 'Customer'}&background=EAE3DA&color=4A5B45`} 
                      alt="User Avatar" 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>
                        {review.user?.HoTen || 'Khách hàng ẩn danh'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {getStarRatingText(review.XepLoai)}
                        </div>
                        <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>•</span>
                        <span style={{ color: '#6B7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nhãn sản phẩm */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block' }}>Sản phẩm:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2C3A29' }}>
                      {review.san_pham?.TenSanPham || 'Đang cập nhật'}
                    </span>
                  </div>
                </div>

                {/* Nội dung đánh giá */}
                <div style={{ margin: '0.5rem 0 1rem 0' }}>
                  <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {review.BinhLuan || <em style={{ color: '#9CA3AF' }}>Khách hàng chỉ xếp hạng và không để lại bình luận.</em>}
                  </p>
                </div>

                {/* Hình ảnh đánh giá (nếu có) */}
                {review.HinhAnh && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <img 
                      src={getReviewImage(review.HinhAnh)} 
                      alt="Review attachment" 
                      onClick={() => setSelectedImage(getReviewImage(review.HinhAnh))}
                      style={{ 
                        maxWidth: '120px', 
                        maxHeight: '120px', 
                        borderRadius: '8px', 
                        objectFit: 'cover', 
                        cursor: 'pointer',
                        border: '1px solid #E5E7EB',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = 0.85}
                      onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                    />
                  </div>
                )}

                {/* Phản hồi từ Shop */}
                {review.phan_hoi ? (
                  <div style={{ background: '#F9FAFB', borderLeft: '3px solid #2C3A29', borderRadius: '0 8px 8px 0', padding: '1rem 1.25rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: '#2C3A29', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={14} /> Gian hàng đã phản hồi
                      </span>
                      <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                        {formatDate(review.phan_hoi.NgayPhanHoi || review.phan_hoi.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {review.phan_hoi.NoiDungPhanHoi}
                    </p>
                  </div>
                ) : (
                  <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '1rem', marginTop: '1rem' }}>
                    {activeReplyId === review.ID_DanhGia ? (
                      <div>
                        <textarea
                          placeholder="Viết phản hồi chu đáo của bạn gửi tới khách hàng..."
                          value={replyInputs[review.ID_DanhGia] || ''}
                          onChange={(e) => handleInputChange(review.ID_DanhGia, e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            marginBottom: '8px',
                            outline: 'none',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setActiveReplyId(null);
                              handleInputChange(review.ID_DanhGia, '');
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '6px',
                              border: '1px solid #D1D5DB',
                              background: '#fff',
                              color: '#4B5563',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <X size={14} /> Hủy
                          </button>
                          <button
                            onClick={() => handleReplySubmit(review.ID_DanhGia)}
                            disabled={submittingReply}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#2C3A29',
                              color: '#fff',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: submittingReply ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              opacity: submittingReply ? 0.7 : 1
                            }}
                          >
                            {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyId(review.ID_DanhGia)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1.5px solid #2C3A29',
                          background: 'transparent',
                          color: '#2C3A29',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#2C3A29';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#2C3A29';
                        }}
                      >
                        <MessageSquare size={14} /> Phản hồi khách hàng
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#9CA3AF' : '#374151',
                fontWeight: 600
              }}
            >
              Trước
            </button>

            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: currentPage === p ? '1px solid #2C3A29' : '1.5px solid transparent',
                  background: currentPage === p ? '#2C3A29' : '#fff',
                  color: currentPage === p ? '#fff' : '#374151',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
              disabled={currentPage === lastPage}
              style={{
                padding: '8px 16px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: currentPage === lastPage ? 'not-allowed' : 'pointer',
                color: currentPage === lastPage ? '#9CA3AF' : '#374151',
                fontWeight: 600
              }}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* ── IMAGE LIGHTBOX MODAL ── */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '1rem',
              }}
            >
              <X size={20} /> Đóng
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged review" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            />
          </div>
        </div>
      )}

      {/* CSS Spin Animation in JS block for absolute safety (or standard class) */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
