
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './BaivietTT.css';

export default function BaiVietTinhThanh() {
    const { id } = useParams();
    const navigate = useNavigate();
    const url = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage`;

    const getImageUrl = (hinhanh) => {
        if (!hinhanh) return null;
        let imagePath = hinhanh;
        try {
            const parsed = JSON.parse(hinhanh);
            if (Array.isArray(parsed) && parsed.length > 0) {
                imagePath = parsed[0];
            }
        } catch (e) {}
        
        if (imagePath.startsWith('http')) return imagePath;
        // Ensure there's a slash between storage and the path
        const separator = imagePath.startsWith('/') ? '' : '/';
        return `${url}${separator}${imagePath}`;
    };

    const { data: blogs = [], isLoading: blogsLoading } = useQuery({
        queryKey: ['provinceBlogs', id],
        queryFn: async () => {
            const response = await axiosClient.get(`/Cauchuyensanvat/${id}`);
            return response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

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

    const cauChuyenList = blogs.filter(blog => Number(blog.LoaiTin) === 0 || blog.LoaiTin === undefined);
    const tinTucList = blogs.filter(blog => Number(blog.LoaiTin) === 1);

    return (
        <div className="baiviet-container">
            <div className="baiviet-back-button">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} />
                    Quay lại
                </button>
            </div>
            <div className="baiviet-header">
                <p>Danh Mục</p>
                <h1 className="baiviet-title">Sản Vật & Văn Hóa{provinceName}</h1>
                <div className="baiviet-subtitle">Tìm hiểu văn hóa, ẩm thực và các câu chuyện sản vật độc đáo được lưu truyền của người dân vùng đất {provinceName}</div>
            </div>
            <div className="baiviet-content">
                <section className="cauchuyen-section">
                    <h2 className="section-title">Câu chuyện sản vật của {provinceName}</h2>
                    <div className="cauchuyen-grid">
                        {cauChuyenList.length > 0 ? (
                            cauChuyenList.map(blog => (
                                <Link to={`/blogs/${blog.ID_Blog}`} key={blog.ID_Blog} className="cauchuyen-card">
                                    <div className="cauchuyen-image">
                                        {blog.hinhanh ? (
                                            <img src={getImageUrl(blog.hinhanh)} alt={blog.tittel} />
                                        ) : (
                                            <div className="no-image">Không có hình ảnh</div>
                                        )}
                                    </div>
                                    <div className="cauchuyen-info">
                                        <h3 className="cauchuyen-title">{blog.tittel}</h3>
                                        <p className="cauchuyen-summary">{blog.tomtat}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-blogs-message">Không có câu chuyện nào về {provinceName}.</p>
                        )}
                    </div>
                </section>
                <section className="tintuc-section">
                    <h2 className="section-title">Tin tức & sự kiện về {provinceName}</h2>
                    <div className="tintuc-grid">
                        {tinTucList.length > 0 ? (
                            tinTucList.map(blog => (
                                <Link to={`/blogs/${blog.ID_Blog}`} key={blog.ID_Blog} className="tintuc-card">
                                    <div className="tintuc-image">
                                        {blog.hinhanh ? (
                                            <img src={getImageUrl(blog.hinhanh)} alt={blog.tittel} />
                                        ) : (
                                            <div className="no-image">Không có hình ảnh</div>
                                        )}
                                    </div>
                                    <div className="tintuc-info">
                                        <h3 className="tintuc-title">{blog.tittel}</h3>
                                        <p className="tintuc-summary">{blog.tomtat}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="no-blogs-message">Không có tin tức & sự kiện nào về {provinceName}.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}


