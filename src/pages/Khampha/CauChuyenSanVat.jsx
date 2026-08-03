import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import './Cauchuyen.css'
import axiosClient from '../../api/axiosClient';
import { useQuery } from '@tanstack/react-query';

function CauChuyenSanVat() {
    const [activeIndex, setActiveIndex] = useState(0);
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


    useEffect(() => {
        if (activeSlides.length === 0) return;
        const timer = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % activeSlides.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [activeSlides.length]);



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
                    {activeSlides.map((slide) => (
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
                        <Link 
                            to={`/blogs/${randomBlogs[0].ID_Blog || randomBlogs[0].id}`} 
                            className="blog-featured-card"
                            style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'flex' }}
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
                        </Link>

                        {/* Side List of 4 other blogs */}
                        <div className="blogs-side-list">
                            {randomBlogs.slice(1, 5).map((blog) => (
                                <Link 
                                    key={blog.ID_Blog || blog.id}
                                    to={`/blogs/${blog.ID_Blog || blog.id}`} 
                                    className="blog-simple-card"
                                    style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'flex' }}
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
                                </Link>
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
                        <Link 
                            to={`/blogs/${tinTucList[0].ID_Blog || tinTucList[0].id}`}
                            className="blog-featured-card"
                            style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'flex' }}
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
                        </Link>

                        {/* Side List of 4 other news items */}
                        <div className="blogs-side-list">
                            {tinTucList.slice(1, 5).map((news) => (
                                <Link 
                                    key={news.ID_Blog || news.id}
                                    to={`/blogs/${news.ID_Blog || news.id}`}
                                    className="blog-simple-card"
                                    style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'flex' }}
                                >
                                    <img
                                        className="blog-simple-img"
                                        src={news.hinhanh ? `https://lvtnbackend.onrender.com/storage/${news.hinhanh}` : 'https://via.placeholder.com/150?text=San+Vat'}
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
                                </Link>
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


        </div>
    );
}

export default CauChuyenSanVat;