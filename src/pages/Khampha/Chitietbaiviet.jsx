import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBaiVietById } from '../../api/khamphaAPI';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,User,Calendar } from 'lucide-react';
import './chitiet.css';

const Chitietbaiviet = () => {
    const { id } = useParams();
    const [baiViet, setBaiViet] = useState(null);
    const [loading, setLoading] = useState(true);
    const Navigate = useNavigate();
    const url = baiViet?.hinhanh ? `https://lvtnbackend.onrender.com/storage/${baiViet.hinhanh}` : `http://localhost:8000/storage/${baiViet?.hinhanh}`;
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
            return url;
        }
        const regExp = new RegExp('^.*(youtu.be/|v/|u/\\w/|embed/|watch\\?v=|&v=)([^#&?]*).*');
        const match = url.match(regExp);

        if (match && match[2] && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    };
    useEffect(() => {
        const fetchBaiViet = async (id) => {
            try {
                const response = await getBaiVietById(id);
                setBaiViet(response.data.data);
            } catch (error) {
                console.error("Error fetching blog post:", error);
                Navigate('/not-found');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBaiViet(id);
        }
    }, [id]);

    if (loading) return (
        <div className="blog-loading-container">
            <div className="blog-spinner"></div>
            <p>Đang tải bài viết...</p>
        </div>
    );

    return (
        <div className='chitietbaiviet-container'>
            <div className='chitietbaiviet-content'>
                <div>
                    <button className="blog-back-btn" onClick={() => Navigate(-1)}>
                        <ArrowLeft size={16} />
                        Quay lại
                    </button>
                </div >
                {baiViet ? (
                    <div className='chitietbaiviet-detail'>
                        <div className='chitietbaiviet-image'>
                            {baiViet.hinhanh && (
                                <img
                                    src={url}
                                    alt={baiViet.tittel}
                                />
                            )}
                        </div>

                        <div className='chitietbaiviet-meta'>
                            <span style={{ color: Number(baiViet.LoaiTin) === 1 ? '#03543F' : '#1E429F', }}> {baiViet.loaitin ? 'Tin tức & sự kiện' : 'Bài viết'}</span>
                            <span><User size={16} />Tác giả: {baiViet.user?.HoTen}</span>
                            <span><Calendar size={16} />Ngày đăng: {new Date(baiViet.ngaydang).toLocaleDateString()}</span>
                            <span> Tỉnh thành: {baiViet.tinh_thanh?.TenTinhThanh}</span>
                        </div>
                        <h2>{baiViet.tittel}</h2>
                        {baiViet.video_url && (() => {
                            const embedUrl = getYouTubeEmbedUrl(baiViet.video_url);
                            if (embedUrl) {
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
                                    </div>
                                );
                            } else {
                                return (
                                    <div style={{ margin: '1.5rem 0', fontSize: '0.9rem' }}>
                                        <b>Video liên quan: </b>
                                        <a href={baiViet.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: '500', textDecoration: 'underline' }}>
                                            {baiViet.video_url}
                                        </a>
                                    </div>
                                );
                            }
                        })()}
                        <p className='tomtat'>{baiViet.tomtat}</p>
                        <p className='noidung' dangerouslySetInnerHTML={{ __html: baiViet.noidung }} />

                    </div>
                ) : (
                    <p>Bài viết không tồn tại.</p>
                )}
            </div>


        </div>
    );
};

export default Chitietbaiviet;