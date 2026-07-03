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

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
            return url;
        }
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            videoId = match[2];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return null;
    };

    if (blogsLoading) {
        return (
            <div className="baiviet-loading">
                <p>Đang tải danh sách bài viết...</p>
            </div>
        );
    }

    const cauChuyenList = blogs.filter(blog => Number(blog.LoaiTin) === 0 || blog.LoaiTin === undefined);
    const tinTucList = blogs.filter(blog => Number(blog.LoaiTin) === 1);

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
 
                {/* 1. Câu chuyện sản vật */}
                <h3 className="blogs-title">Câu chuyện sản vật của tỉnh {provinceName}</h3>
                {cauChuyenList.length === 0 ? (
                    <div className="baiviet-empty-state" style={{ marginBottom: '3rem' }}>
                        <p>Chưa có câu chuyện sản vật nào về tỉnh thành này.</p>
                    </div>
                ) : (
                    <div className="baiviet-grid" style={{ marginBottom: '3rem' }}>
                        {cauChuyenList.map((blog) => (
                            <div 
                                key={blog.ID_Blog || blog.id} 
                                className="baiviet-featured-card"
                                onClick={() => setSelectedBlog(blog)}
                            >
                                <div className="blog-feat-img-wrapper">
                                    <img 
                                        className="blog-feat-img" 
                                        src={blog.hinhanh ? `https://lvtnbackend.onrender.com/storage/${blog.hinhanh}` : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'60\' viewBox=\'0 0 80 60\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23f3f4f6\'/><text x=\'50%25\' y=\'50%25\' fill=\'%239ca3af\' font-size=\'10\' font-family=\'sans-serif\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>'} 
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
                                    <p className="blog-desc-text" dangerouslySetInnerHTML={{ __html: blog.tomtat || blog.noidung }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. Tin tức & Sự kiện */}
                <h3 className="blogs-title" style={{ marginTop: '4rem' }}>Tin tức & Sự kiện của tỉnh {provinceName}</h3>
                {tinTucList.length === 0 ? (
                    <div className="baiviet-empty-state">
                        <p>Chưa có tin tức & sự kiện nào về tỉnh thành này.</p>
                    </div>
                ) : (
                    <div className="baiviet-grid">
                        {tinTucList.map((blog) => (
                            <div 
                                key={blog.ID_Blog || blog.id} 
                                className="baiviet-featured-card"
                                onClick={() => setSelectedBlog(blog)}
                            >
                                <div className="blog-feat-img-wrapper">
                                    <img 
                                        className="blog-feat-img" 
                                        src={blog.hinhanh ? `https://lvtnbackend.onrender.com/storage/${blog.hinhanh}` : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'60\' viewBox=\'0 0 80 60\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23f3f4f6\'/><text x=\'50%25\' y=\'50%25\' fill=\'%239ca3af\' font-size=\'10\' font-family=\'sans-serif\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>'} 
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
                                    <p className="blog-desc-text" dangerouslySetInnerHTML={{ __html: blog.tomtat || blog.noidung }} />
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
                                src={selectedBlog.hinhanh ? `https://lvtnbackend.onrender.com/storage/${selectedBlog.hinhanh}` : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'60\' viewBox=\'0 0 80 60\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23f3f4f6\'/><text x=\'50%25\' y=\'50%25\' fill=\'%239ca3af\' font-size=\'10\' font-family=\'sans-serif\' dominant-baseline=\'middle\' text-anchor=\'middle\'>No Image</text></svg>'} 
                                alt={selectedBlog.tittel} 
                            />
                            <button className="blog-modal-close" onClick={() => setSelectedBlog(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="blog-modal-body">
                            <div className="blog-modal-meta">
                                <span className="blog-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        backgroundColor: Number(selectedBlog.LoaiTin) === 1 ? '#DEF7EC' : '#E1EFFE',
                                        color: Number(selectedBlog.LoaiTin) === 1 ? '#03543F' : '#1E429F',
                                        fontWeight: '600'
                                    }}>
                                        {Number(selectedBlog.LoaiTin) === 1 ? 'Tin tức & Sự kiện' : 'Bài viết'}
                                    </span>
                                </span>
                                <span className="blog-meta-item">
                                    <User size={16} /> Tác giả: {selectedBlog.user?.HoTen || 'Ban quản trị'}
                                </span>
                                <span className="blog-meta-item">
                                    <Calendar size={16} /> Đăng ngày: {selectedBlog.ngaydang || 'Gần đây'}
                                </span>
                            </div>
                            <h3 className="blog-modal-title" style={{ marginTop: '12px' }}>{selectedBlog.tittel}</h3>
                            {selectedBlog.tomtat && (
                                <div className="blog-modal-summary" dangerouslySetInnerHTML={{ __html: selectedBlog.tomtat }} />
                            )}

                            {selectedBlog.video_url && (() => {
                                const embedUrl = getYouTubeEmbedUrl(selectedBlog.video_url);
                                if (embedUrl) {
                                    const videoId = embedUrl.split('/').pop();
                                    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                                    return (
                                        <div className="blog-video-wrapper" style={{ margin: '1.5rem 0' }}>
                                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                <iframe
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                    src={embedUrl}
                                                    title="Video player"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                            <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                                                <a 
                                                    href={watchUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="btn btn-outline btn-sm"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5', padding: '0.35rem 0.85rem', textDecoration: 'none' }}
                                                >
                                                     Xem trực tiếp trên YouTube
                                                </a>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div style={{ margin: '1.5rem 0', fontSize: '0.9rem' }}>
                                            <b>Video liên quan: </b>
                                            <a href={selectedBlog.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: '500', textDecoration: 'underline' }}>
                                                {selectedBlog.video_url}
                                            </a>
                                        </div>
                                    );
                                }
                            })()}

                            <div className="blog-modal-content" style={{ marginTop: '1.5rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: selectedBlog.noidung }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
