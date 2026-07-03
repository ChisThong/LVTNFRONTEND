import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Calendar, User, X } from 'lucide-react';
import '../../styles/CauChuyen.css';
import axiosClient from '../../api/axiosClient';
import { useQuery } from '@tanstack/react-query';

function CauChuyenSanVat() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const location = useLocation();

    const { data: TinhThanh = [], isLoading } = useQuery({
        queryKey: ['tinhthanh'],
        queryFn: async () => {
            const response = await axiosClient.get('/tinh-thanh');
            return response.data?.data?.data || response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

    const { data: randomBlogs = [] } = useQuery({
        queryKey: ['randomBlogs'],
        queryFn: async () => {
            const response = await axiosClient.get('/randombaiviet');
            return response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

    const { data: tinTucList = [] } = useQuery({
        queryKey: ['tinTucList'],
        queryFn: async () => {
            const response = await axiosClient.get('/tintuc');
            return response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

    const activeSlides = TinhThanh.map(item => ({
        province: item.TenTinhThanh,
        title: item.Tieude || item.TenTinhThanh,
        description: item.MoTa || '',
        image: item.HinhAnh 
            ? (item.HinhAnh.startsWith('http') ? item.HinhAnh : `https://lvtnbackend.onrender.com/storage/${item.HinhAnh}`)
            : 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1400&q=80',
        link: `/tinh-thanh/${item.ID_TinhThanh}/blogs`
    }));

    // Auto focus province from query param
    useEffect(() => {
        if (activeSlides.length === 0) return;
        const queryParams = new URLSearchParams(location.search);
        const tinhParam = queryParams.get('tinh');
        if (tinhParam) {
            const index = activeSlides.findIndex(
                slide => slide.province.toLowerCase() === tinhParam.toLowerCase()
            );
            if (index !== -1) {
                setActiveIndex(index);
            }
        }
    }, [location.search, activeSlides]);

    useEffect(() => {
        if (activeSlides.length === 0) return;
        const timer = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % activeSlides.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [activeSlides.length]);

    const handleProvinceClick = (index) => {
        setActiveIndex(index);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

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

    if (isLoading) {
        return (
            <div className="story-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: '#1e293b' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Đang tải dữ liệu các tỉnh thành...</p>
                </div>
            </div>
        );
    }

    if (activeSlides.length === 0) {
        return (
            <div className="story-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: '#1e293b' }}>
                <p>Không tìm thấy dữ liệu tỉnh thành nào.</p>
            </div>
        );
    }

    return (
        <div className="story-page">
            {/* Slideshow Top Section */}
            <div className="story-hero">
                {activeSlides.map((slide, index) => (
                    <div
                         key={slide.province}
                         className={`story-slide ${index === activeIndex ? 'active' : ''}`}
                    >
                        <div
                            className="story-slide-bg"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        />
                        <div className="story-slide-overlay" />
                        <div className="story-content">
                            <span className="story-province-tag">{slide.province}</span>
                            <h2 className="story-title">{slide.title}</h2>
                            <p className="story-description">{slide.description}</p>
                            <Link to={slide.link} className="story-link">
                                Khám phá sản vật <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}

                <div className="story-dots">
                    {activeSlides.map((slide, index) => (
                        <button
                            key={slide.province}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Chuyển đến ${slide.province}`}
                            className={`story-dot ${index === activeIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Grid of Provinces below */}
            <section className="story-grid-section">
                <h3 className="story-grid-title">Khám phá câu chuyện sản vật</h3>
                <div className="provinces-grid">
                    {activeSlides.map((slide, index) => (
                        <Link 
                            key={slide.province} 
                            to={slide.link}
                            className="province-card"
                        >
                            <div 
                                className="province-card-img" 
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />
                            <div className="province-card-overlay">
                                <h4 className="province-card-name">{slide.province}</h4>
                                <p className="province-card-title">{slide.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Random Blogs Section */}
            {randomBlogs.length > 0 && (
                <section className="blogs-section">
                    <h3 className="blogs-title">Bài viết nổi bật</h3>
                    <div className="blogs-grid">
                        {/* Featured Blog Card (first item) */}
                        <div 
                            className="blog-featured-card"
                            onClick={() => setSelectedBlog(randomBlogs[0])}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="blog-feat-img-wrapper">
                                <img 
                                    className="blog-feat-img" 
                                    src={randomBlogs[0].hinhanh ? `https://lvtnbackend.onrender.com/storage/${randomBlogs[0].hinhanh}` : 'https://via.placeholder.com/800x450?text=San+Vat+Mien+Tay'} 
                                    alt={randomBlogs[0].tittel} 
                                />
                            </div>
                            <div className="blog-feat-content">
                                <div>
                                    <div className="blog-meta" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            backgroundColor: Number(randomBlogs[0].LoaiTin) === 1 ? '#DEF7EC' : '#E1EFFE',
                                            color: Number(randomBlogs[0].LoaiTin) === 1 ? '#03543F' : '#1E429F',
                                            fontWeight: '600'
                                        }}>
                                            {Number(randomBlogs[0].LoaiTin) === 1 ? 'Tin tức & Sự kiện' : 'Bài viết'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={14} /> {randomBlogs[0].user?.HoTen || 'Ban quản trị'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {randomBlogs[0].ngaydang || 'Gần đây'}
                                        </span>
                                    </div>
                                    <h4 className="blog-title-text" style={{ marginTop: '8px' }}>{randomBlogs[0].tittel}</h4>
                                </div>
                                <p className="blog-desc-text">{randomBlogs[0].tomtat || randomBlogs[0].noidung}</p>
                            </div>
                        </div>

                        {/* Side List of 4 other blogs */}
                        <div className="blogs-side-list">
                            {randomBlogs.slice(1, 5).map((blog) => (
                                <div 
                                    key={blog.ID_Blog || blog.id} 
                                    className="blog-simple-card"
                                    onClick={() => setSelectedBlog(blog)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img 
                                        className="blog-simple-img" 
                                        src={blog.hinhanh ? `https://lvtnbackend.onrender.com/storage/${blog.hinhanh}` : 'https://via.placeholder.com/150?text=San+Vat'} 
                                        alt={blog.tittel} 
                                    />
                                    <div className="blog-simple-content">
                                        <div className="blog-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                padding: '1px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                backgroundColor: Number(blog.LoaiTin) === 1 ? '#DEF7EC' : '#E1EFFE',
                                                color: Number(blog.LoaiTin) === 1 ? '#03543F' : '#1E429F',
                                                fontWeight: '600'
                                            }}>
                                                {Number(blog.LoaiTin) === 1 ? 'Tin tức' : 'Bài viết'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> {blog.ngaydang || 'Gần đây'}
                                            </span>
                                        </div>
                                        <h5 className="blog-simple-title" style={{ marginTop: '4px' }}>{blog.tittel}</h5>
                                        <p className="blog-simple-desc">{blog.tomtat || blog.noidung}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Tin Tức & Sự Kiện Section */}
            {tinTucList.length > 0 && (
                <section className="blogs-section" style={{ marginTop: '3rem' }}>
                    <h3 className="blogs-title">Tin tức & Sự kiện nổi bật</h3>
                    <div className="blogs-grid">
                        {/* Featured News Card (first item) */}
                        <div 
                            className="blog-featured-card"
                            onClick={() => setSelectedBlog(tinTucList[0])}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="blog-feat-img-wrapper">
                                <img 
                                    className="blog-feat-img" 
                                    src={tinTucList[0].hinhanh ? `https://lvtnbackend.onrender.com/storage/${tinTucList[0].hinhanh}` : 'https://via.placeholder.com/800x450?text=Tin+Tuc+Mien+Tay'} 
                                    alt={tinTucList[0].tittel} 
                                />
                            </div>
                            <div className="blog-feat-content">
                                <div>
                                    <div className="blog-meta" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            backgroundColor: Number(tinTucList[0].LoaiTin) === 1 ? '#DEF7EC' : '#E1EFFE',
                                            color: Number(tinTucList[0].LoaiTin) === 1 ? '#03543F' : '#1E429F',
                                            fontWeight: '600'
                                        }}>
                                            {Number(tinTucList[0].LoaiTin) === 1 ? 'Tin tức & Sự kiện' : 'Bài viết'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={14} /> {tinTucList[0].user?.HoTen || 'Ban quản trị'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} /> {tinTucList[0].ngaydang || 'Gần đây'}
                                        </span>
                                    </div>
                                    <h4 className="blog-title-text" style={{ marginTop: '8px' }}>{tinTucList[0].tittel}</h4>
                                </div>
                                <p className="blog-desc-text">{tinTucList[0].tomtat || tinTucList[0].noidung}</p>
                            </div>
                        </div>

                        {/* Side List of 4 other news items */}
                        <div className="blogs-side-list">
                            {tinTucList.slice(1, 5).map((news) => (
                                <div 
                                    key={news.ID_Blog || news.id} 
                                    className="blog-simple-card"
                                    onClick={() => setSelectedBlog(news)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img 
                                        className="blog-simple-img" 
                                        src={news.hinhanh ? `https://lvtnbackend.onrender.com/storage/${news.hinhanh}` : 'https://via.placeholder.com/150?text=Tin+Tuc'} 
                                        alt={news.tittel} 
                                    />
                                    <div className="blog-simple-content">
                                        <div className="blog-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                padding: '1px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                backgroundColor: Number(news.LoaiTin) === 1 ? '#DEF7EC' : '#E1EFFE',
                                                color: Number(news.LoaiTin) === 1 ? '#03543F' : '#1E429F',
                                                fontWeight: '600'
                                            }}>
                                                {Number(news.LoaiTin) === 1 ? 'Tin tức' : 'Bài viết'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={12} /> {news.ngaydang || 'Gần đây'}
                                            </span>
                                        </div>
                                        <h5 className="blog-simple-title" style={{ marginTop: '4px' }}>{news.tittel}</h5>
                                        <p className="blog-simple-desc">{news.tomtat || news.noidung}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            {/* Quote and CTA Banner Section */}
            <section className="story-quote-section">
                <span className="story-quote-icon">”</span>
                <p className="story-quote-text">
                    "Ăn quả nhớ kẻ trồng cây, ăn miếng đặc sản nhớ người thợ lành nghề. Mỗi sản phẩm là một lời nhắn nhủ từ quê hương gửi đến những người con xa xứ."
                </p>
                <span className="story-quote-author">— Nghệ nhân dân gian Miền Nam</span>
            </section>

            <section className="story-cta-banner">
                <h3 className="story-cta-title">Bạn muốn trải nghiệm những hương vị này?</h3>
                <p className="story-cta-desc">
                    Ghé thăm gian hàng của chúng tôi để mang tinh hoa Miền Nam về ngôi nhà của bạn.
                </p>
                <Link to="/products" className="story-cta-btn">
                    Mua sắm ngay
                </Link>
            </section>


            {/* Blog detail modal */}
            {selectedBlog && (
                <div className="blog-modal-overlay" onClick={() => setSelectedBlog(null)}>
                    <div className="blog-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="blog-modal-header">
                            <img 
                                className="blog-modal-banner" 
                                src={selectedBlog.hinhanh ? `https://lvtnbackend.onrender.com/storage/${selectedBlog.hinhanh}` : 'https://via.placeholder.com/800x450?text=San+Vat+Mien+Tay'} 
                                alt={selectedBlog.tittel} 
                            />
                            <button className="blog-modal-close" onClick={() => setSelectedBlog(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="blog-modal-body">
                            <div className="blog-modal-meta" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={16} /> Tác giả: {selectedBlog.user?.HoTen || 'Ban quản trị'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

export default CauChuyenSanVat;