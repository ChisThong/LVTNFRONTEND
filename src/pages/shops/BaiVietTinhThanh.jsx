import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, User, X, ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../../styles/baiviet.css';

export default function BaiVietTinhThanh() {
    const { id } = useParams();
    const [selectedBlog, setSelectedBlog] = useState(null);
    const navigate = useNavigate();

    // Fetch all blogs of this province
    const { data: blogs = [], isLoading: blogsLoading } = useQuery({
        queryKey: ['provinceBlogs', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/Cauchuyensanvat/${id}`);
            return response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

    // Fetch province info
    const { data: TinhThanh = [] } = useQuery({
        queryKey: ['tinhthanh'],
        queryFn: async () => {
            const response = await axiosClient.get('/tinh-thanh');
            return response.data?.data?.data || response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

    const provinceInfo = TinhThanh.find(t => Number(t.ID_TinhThanh) === Number(id));
    const provinceName = provinceInfo ? provinceInfo.TenTinhThanh : 'Tỉnh Thành';

    if (blogsLoading) {
        return (
            <div className="baiviet-loading">
                <p>Đang tải danh sách bài viết...</p>
            </div>
        );
    }

    return (
        <div className="baiviet-page">
            <div className="baiviet-container">
                {/* Back button */}
                <div className="baiviet-back-wrapper">
                    <button onClick={() => navigate(-1)} className="baiviet-back-btn">
                        <ArrowLeft size={18} /> Quay lại
                    </button>
                </div>
 
                {/* Header Section */}
                <div className="baiviet-header-card">
                    <span className="baiviet-header-subtitle">Danh mục bài viết</span>
                    <h1 className="baiviet-header-title">Sản Vật & Văn Hóa {provinceName}</h1>
                    <p className="baiviet-header-desc">
                        Tìm hiểu văn hóa, ẩm thực và các câu chuyện sản vật độc đáo được lưu truyền của người dân vùng đất {provinceName}.
                    </p>
                </div>
 
                {/* Blogs Grid */}
                <h3 className="blogs-title">Câu chuyện sản vật của tỉnh {provinceName}</h3>
                
                {blogs.length === 0 ? (
                    <div className="baiviet-empty-state">
                        <p>Chưa có bài viết nào về tỉnh thành này.</p>
                        <p>Chúng tôi sẽ cập nhật các bài viết sớm nhất!</p>
                    </div>
                ) : (
                    <div className="baiviet-grid">
                        {blogs.map((blog) => (
                            <div 
                                key={blog.ID_Blog || blog.id} 
                                className="blog-featured-card"
                                onClick={() => setSelectedBlog(blog)}
                            >
                                <div className="blog-feat-img-wrapper">
                                    <img 
                                        className="blog-feat-img" 
                                        src={blog.hinhanh ? `http://127.0.0.1:8000/storage/${blog.hinhanh}` : 'https://via.placeholder.com/400x250?text=San+Vat'} 
                                        alt={blog.tittel} 
                                    />
                                </div>
                                <div className="blog-feat-content">
                                    <div>
                                        <div className="blog-meta">
                                            <span className="blog-meta-item">
                                                <User size={14} /> {blog.user?.HoTen || 'Ban quản trị'}
                                            </span>
                                            <span className="blog-meta-item">
                                                <Calendar size={14} /> {blog.ngaydang || 'Gần đây'}
                                            </span>
                                        </div>
                                        <h4 className="blog-title-text">{blog.tittel}</h4>
                                    </div>
                                    <p className="blog-desc-text">{blog.tomtat || blog.noidung}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
 
            {/* Modal read blog details */}
            {selectedBlog && (
                <div className="blog-modal-overlay" onClick={() => setSelectedBlog(null)}>
                    <div className="blog-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="blog-modal-header">
                            <img 
                                className="blog-modal-banner" 
                                src={selectedBlog.hinhanh ? `http://127.0.0.1:8000/storage/${selectedBlog.hinhanh}` : 'https://via.placeholder.com/800x450?text=San+Vat'} 
                                alt={selectedBlog.tittel} 
                            />
                            <button className="blog-modal-close" onClick={() => setSelectedBlog(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="blog-modal-body">
                            <div className="blog-modal-meta">
                                <span className="blog-meta-item">
                                    <User size={16} /> Tác giả: {selectedBlog.user?.HoTen || 'Ban quản trị'}
                                </span>
                                <span className="blog-meta-item">
                                    <Calendar size={16} /> Đăng ngày: {selectedBlog.ngaydang || 'Gần đây'}
                                </span>
                            </div>
                            <h3 className="blog-modal-title">{selectedBlog.tittel}</h3>
                            {selectedBlog.tomtat && (
                                <p className="blog-modal-summary">{selectedBlog.tomtat}</p>
                            )}
                            <div className="blog-modal-content">
                                {selectedBlog.noidung}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
