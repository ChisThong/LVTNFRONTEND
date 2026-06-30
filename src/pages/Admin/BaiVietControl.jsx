import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { createPortal } from "react-dom"
import { Search, Eye, Edit, Trash2, Plus, Save, X, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { createBaiViet, deleteBaiViet, getBaiViet, updateBaiViet } from "../../api/blogAPI";
import { getTinhThanh } from "../../api/productPublicApi";

// Hàm chuyển đổi URL YouTube thành dạng nhúng
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
        return url;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        const videoId = match[2];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
};

const IMG_URL = "https://lvtnbackend.onrender.com/storage/";

export default function BaiVietController() {
    const [page, setpage] = useState(1);
    const [search, setsearch] = useState("");
    const [LoaiTin, setLoaiTin] = useState("");
    const queryClient = useQueryClient();

    // Gọi API lấy tất cả bài viết
    const { data: responseData, isFetching } = useQuery({
        queryKey: ['baiviet', page, search, LoaiTin],
        queryFn: async () => {
            const params = {
                page: page,
                limit: 10,
                search: search
            };
            if (LoaiTin !== "") {
                params.LoaiTin = LoaiTin;
            }
            const response = await getBaiViet(params);
            return response.data.data;
        }
    });

    const baiviet = responseData?.data || [];
    const Tongpage = responseData?.last_page || 1;

    // Gọi API lấy thông tin Tỉnh Thành
    const { data: tinhthanh = [] } = useQuery({
        queryKey: ['tinhthanh'],
        queryFn: async () => {
            const response = await getTinhThanh();
            return response.data?.data?.data || response.data?.data || response.data || [];
        }
    });

    // Xử lý tìm kiếm bài viết
    const [inputText, setinputText] = useState("")
    const handleSearch = () => {
        setsearch(inputText);
        setpage(1);
    }
    const handelchangeSearch = (e) => {
        const value = e.target.value;
        setinputText(value);
        if (value.trim() === "") {
            setsearch("");
            setpage(1);
        }
    }

    // Lọc theo loại tin tức
    const handleLocLoaiTin = (value) => {
        setLoaiTin(value);
        setpage(1);
    }

    // Mutation: Xóa bài viết
    const deletebaiviet = useMutation({
        mutationFn: (id) => deleteBaiViet(id),
        onSuccess: () => {
            alert("Xóa bài viết thành công");
            queryClient.invalidateQueries(['baiviet'])
        },
        onError: (error) => {
            alert("Xóa không thành công")
            console.error(error);
        }
    });
    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            deletebaiviet.mutate(id);
        }
    };

    // Khởi tạo state cho việc Thêm mới
    const [isopenThem, setisopenThem] = useState(false);
    const [validateError, setvalidateError] = useState({});
    const [addFormData, setaddFormData] = useState({
        tittel: "",
        tomtat: "",
        noidung: "",
        hinhanh: null,
        ID_TinhThanh: "",
        LoaiTin: "0",
        video_url: ""
    });

    const handleOpenFormThem = () => {
        setisopenThem(true);
    };
    const handleCloseFormThem = () => {
        setisopenThem(false);
        setaddFormData({ tittel: "", tomtat: "", noidung: "", hinhanh: null, ID_TinhThanh: "", LoaiTin: "0", video_url: "" });
        setvalidateError({});
    }
    const handleInputModel = (e) => {
        const { name, value } = e.target;
        setaddFormData({ ...addFormData, [name]: value });
    }
    const handleFile = (e) => {
        if (e.target.files && e.target.files[0]) {
            setaddFormData({ ...addFormData, hinhanh: e.target.files[0] })
        }
    }

    // Mutation: Tạo bài viết mới
    const createbaiviet = useMutation({
        mutationFn: (formData) => createBaiViet(formData),
        onSuccess: () => {
            alert("Thêm bài viết thành công!");
            queryClient.invalidateQueries(['baiviet']);
            handleCloseFormThem();
            setvalidateError({})
            setaddFormData({ tittel: "", tomtat: "", noidung: "", hinhanh: null, ID_TinhThanh: "", LoaiTin: "", video_url: "" });
        },
        onError: (error) => {
            if (error.response && error.response.status === 422) {
                const serverErrors = error.response.data.errors;
                setvalidateError(serverErrors);
                alert("Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại!");
            } else {
                alert("Thêm mới thất bại! Lỗi hệ thống.");
                console.error(error);
            }
        }
    });

    const handleSumbmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("tittel", addFormData.tittel);
        formData.append("tomtat", addFormData.tomtat);
        formData.append("noidung", addFormData.noidung);
        formData.append("ID_TinhThanh", Number(addFormData.ID_TinhThanh));
        formData.append("LoaiTin", addFormData.LoaiTin);
        formData.append("video_url", addFormData.video_url);

        if (addFormData.hinhanh) {
            formData.append("hinhanh", addFormData.hinhanh);
        }
        createbaiviet.mutate(formData);
    };

    // Khởi tạo state cho việc Cập nhật (Sửa)
    const [isopenSua, setisopnSua] = useState(false);
    const [chonID, setChonID] = useState(null);

    const handleCloseSua = () => {
        setisopnSua(false);
        setaddFormData({ tittel: "", tomtat: "", noidung: "", hinhanh: null, ID_TinhThanh: "", LoaiTin: "0", video_url: "" });
        setvalidateError({});
    }

    const handleOpenSua = (e) => {
        setChonID(e.ID_Blog);
        setaddFormData({
            tittel: e.tittel,
            tomtat: e.tomtat,
            noidung: e.noidung,
            hinhanh: null,
            ID_TinhThanh: e.ID_TinhThanh,
            LoaiTin: String(e.LoaiTin),
            video_url: e.video_url || ""
        });
        setisopnSua(true)
    }

    // Mutation: Cập nhật bài viết
    const updatebaiviet = useMutation({
        mutationFn: (formData) => updateBaiViet(chonID, formData),
        onSuccess: () => {
            alert("Cập nhật bài viết thành công!!");
            queryClient.invalidateQueries(['baiviet']);
            setisopnSua(false);
            setvalidateError({});
            setaddFormData({ tittel: "", tomtat: "", noidung: "", hinhanh: null, ID_TinhThanh: "", LoaiTin: "0", video_url: "" });
        },
        onError: (error) => {
            if (error.response && error.response.status === 422) {
                setvalidateError(error.response.data.errors);
            } else {
                alert("Cập nhật thất bại!");
            }
        }
    })

    const handleSubmitUpdate = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("tittel", addFormData.tittel);
        formData.append("tomtat", addFormData.tomtat);
        formData.append("noidung", addFormData.noidung);
        formData.append("ID_TinhThanh", Number(addFormData.ID_TinhThanh));
        formData.append("LoaiTin", addFormData.LoaiTin);
        formData.append("video_url", addFormData.video_url || "");
        formData.append("_method", "PUT");

        if (addFormData.hinhanh) {
            formData.append("hinhanh", addFormData.hinhanh);
        }
        updatebaiviet.mutate(formData);
    };

    // Khởi tạo state cho việc xem chi tiết bài viết
    const [isopenchitiet, setisopenchitiet] = useState(false);
    const [datachitiet, setdatachitiet] = useState(null);

    return (
        <div className="view-section">
            <h1 className="admin-title">Quản lý bài viết</h1>

            {/* Bộ lọc và Tìm kiếm */}
            <div className="admin-filters">
                <div className="search-box">
                    <input type="text"
                        value={inputText}
                        onChange={handelchangeSearch}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Nhập tiêu đề bài viết..."
                    />
                    <button className="icon-btn" onClick={() => handleSearch()}><Search size={18} /></button>
                </div>
                
                <div className="flex-align-center-gap-6">
                    <div className="filter-group">
                        <button className={`filter-btn ${LoaiTin === "" ? "active" : ""}`} onClick={() => handleLocLoaiTin("")}>
                            Tất cả
                        </button>
                        <button className={`filter-btn ${LoaiTin === "1" ? "active" : ""}`} onClick={() => handleLocLoaiTin("1")}>
                            Tin tức & Sự kiện
                        </button>
                        <button className={`filter-btn ${LoaiTin === "0" ? "active" : ""}`} onClick={() => handleLocLoaiTin("0")}>
                            Bài viết
                        </button>
                    </div>

                    <button className="btn-action btn-primary flex-align-center-gap-6" onClick={handleOpenFormThem}>
                        <Plus size={16} /> Thêm bài viết mới
                    </button>
                </div>
            </div>

            {/* Bảng danh sách bài viết */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Tác giả</th>
                            <th>Loại Tin</th>
                            <th>Ngày Đăng</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted-small">
                                    Đang tải dữ liệu bài viết. Vui lòng đợi...
                                </td>
                            </tr>
                        ) : baiviet.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted-small">
                                    Không tìm thấy bài viết phù hợp
                                </td>
                            </tr>
                        ) : (
                            baiviet.map((b) => (
                                <tr key={b.ID_Blog}>
                                    <td>
                                        <img src={`${IMG_URL}${b.hinhanh}`}
                                            className="post-thumbnail"
                                            alt="" />
                                    </td>
                                    <td className="text-semibold">
                                        {b.tittel}
                                    </td>
                                    <td>{b.user?.HoTen}</td>
                                    <td>
                                        <span className={`badge ${b.LoaiTin == 0 ? 'badge-role-buyer' : 'badge-role-seller'}`}>
                                            {b.LoaiTin == 0 ? "Bài viết" : "Tin tức & sự kiện"}
                                        </span>
                                    </td>
                                    <td className="text-muted-small">{b.ngaydang}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="icon-btn" title="Cập nhật bài viết" onClick={() => handleOpenSua(b)}>
                                                <Edit size={15} />
                                            </button>
                                            <button className="icon-btn danger" title="Xóa bài viết" onClick={() => handleDelete(b.ID_Blog)}>
                                                <Trash2 size={15} />
                                            </button>
                                            <button className="icon-btn" title="Xem chi tiết" onClick={() => { setisopenchitiet(true); setdatachitiet(b) }}>
                                                <Eye size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="admin-pagination">
                <button className="filter-btn" disabled={page === 1} onClick={() => setpage(prev => Math.max(prev - 1, 1))}>
                    <ChevronLeft size={16} />
                </button>
                <span>Trang: <strong>{page}</strong> / {Tongpage}</span>
                <button className="filter-btn" disabled={page >= Tongpage} onClick={() => setpage(prev => prev + 1)}>
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Modal Thêm bài viết */}
            {isopenThem && createPortal(
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content order-modal-content">
                        <div className="nam-modal-header">
                            <h3>Thêm mới bài viết</h3>
                            <button type="button" onClick={handleCloseFormThem} className="nam-modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSumbmit} className="post-detail-layout">
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Tiêu đề <span className="status-text-red">*</span></label>
                                    <input
                                        type="text"
                                        name="tittel"
                                        className="admin-form-control"
                                        onChange={handleInputModel}
                                        value={addFormData.tittel}
                                        required
                                    />
                                    {validateError.tittel && (
                                        <span className="error-message">
                                            {validateError.tittel[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="admin-form-group">
                                    <label>Loại tin</label>
                                    <select
                                        name="LoaiTin"
                                        id="LoaiTin"
                                        className="admin-form-control"
                                        onChange={handleInputModel}
                                        value={addFormData.LoaiTin}
                                    >
                                        <option value="0">Bài viết</option>
                                        <option value="1">Tin tức & Sự kiện</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Hình ảnh đại diện <span className="status-text-red">*</span></label>
                                    <input
                                        type="file"
                                        name="hinhanh"
                                        className="admin-form-control"
                                        onChange={handleFile}
                                        required
                                    />
                                    {validateError.hinhanh && (
                                        <span className="error-message">
                                            {validateError.hinhanh[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="admin-form-group">
                                    <label>Tỉnh thành liên quan <span className="status-text-red">*</span></label>
                                    <select
                                        name="ID_TinhThanh"
                                        id="tinhthanh"
                                        className="admin-form-control"
                                        onChange={handleInputModel}
                                        value={addFormData.ID_TinhThanh}
                                        required
                                    >
                                        <option value="">-- Chọn Tỉnh thành --</option>
                                        {tinhthanh.map((t) => (
                                            <option key={t.ID_TinhThanh} value={t.ID_TinhThanh}>{t.TenTinhThanh}</option>
                                        ))}
                                    </select>
                                    {validateError.ID_TinhThanh && (
                                        <span className="error-message">
                                            {validateError.ID_TinhThanh[0]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Video URL (YouTube/Đính kèm - nếu có)</label>
                                <input
                                    type="text"
                                    name="video_url"
                                    className="admin-form-control"
                                    onChange={handleInputModel}
                                    value={addFormData.video_url}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Tóm tắt ngắn gọn <span className="status-text-red">*</span></label>
                                <textarea
                                    name="tomtat"
                                    className="admin-form-control textarea-desc-them"
                                    onChange={handleInputModel}
                                    value={addFormData.tomtat}
                                    required
                                />
                                {validateError.tomtat && (
                                    <span className="error-message">
                                        {validateError.tomtat[0]}
                                    </span>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label>Nội dung chi tiết <span className="status-text-red">*</span></label>
                                <textarea
                                    name="noidung"
                                    className="admin-form-control textarea-noidung-them"
                                    onChange={handleInputModel}
                                    value={addFormData.noidung}
                                    required
                                />
                                {validateError.noidung && (
                                    <span className="error-message">
                                        {validateError.noidung[0]}
                                    </span>
                                )}
                            </div>

                            <div className="nam-modal-footer">
                                <button type="button" className="btn-action btn-role-buyer" onClick={handleCloseFormThem}><X size={16} /> Hủy bỏ</button>
                                <button type="submit" className="btn-action btn-primary"><Save size={16} /> Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Sửa bài viết */}
            {isopenSua && createPortal(
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content order-modal-content">
                        <div className="nam-modal-header">
                            <h3>Cập nhật bài viết</h3>
                            <button type="button" onClick={handleCloseSua} className="nam-modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitUpdate} className="post-detail-layout">
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Tiêu đề <span className="status-text-red">*</span></label>
                                    <input
                                        type="text"
                                        name="tittel"
                                        className="admin-form-control"
                                        onChange={handleInputModel}
                                        value={addFormData.tittel}
                                        required
                                    />
                                    {validateError.tittel && (
                                        <span className="error-message">
                                            {validateError.tittel[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="admin-form-group">
                                    <label>Loại tin</label>
                                    <select
                                        name="LoaiTin"
                                        id="LoaiTin"
                                        className="admin-form-control"
                                        onChange={handleInputModel}
                                        value={addFormData.LoaiTin}
                                    >
                                        <option value="0">Bài viết</option>
                                        <option value="1">Tin tức & Sự kiện</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Hình ảnh mới (Để trống nếu giữ nguyên)</label>
                                    <input
                                        type="file"
                                        name="hinhanh"
                                        className="admin-form-control"
                                        onChange={handleFile}
                                    />
                                    {validateError.hinhanh && (
                                        <span className="error-message">
                                            {validateError.hinhanh[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="admin-form-group">
                                    <label>Tỉnh thành liên quan <span className="status-text-red">*</span></label>
                                    <select
                                        name="ID_TinhThanh"
                                        id="tinhthanh"
                                        className="admin-form-control"
                                        onChange={handleInputModel}
                                        value={addFormData.ID_TinhThanh}
                                        required
                                    >
                                        <option value="">-- Chọn Tỉnh thành --</option>
                                        {tinhthanh.map((t) => (
                                            <option key={t.ID_TinhThanh} value={t.ID_TinhThanh}>{t.TenTinhThanh}</option>
                                        ))}
                                    </select>
                                    {validateError.ID_TinhThanh && (
                                        <span className="error-message">
                                            {validateError.ID_TinhThanh[0]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Video URL (YouTube/Đính kèm - nếu có)</label>
                                <input
                                    type="text"
                                    name="video_url"
                                    className="admin-form-control"
                                    onChange={handleInputModel}
                                    value={addFormData.video_url}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Tóm tắt ngắn gọn <span className="status-text-red">*</span></label>
                                <textarea
                                    name="tomtat"
                                    className="admin-form-control textarea-desc-them"
                                    onChange={handleInputModel}
                                    value={addFormData.tomtat}
                                    required
                                />
                                {validateError.tomtat && (
                                    <span className="error-message">
                                        {validateError.tomtat[0]}
                                    </span>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label>Nội dung chi tiết <span className="status-text-red">*</span></label>
                                <textarea
                                    name="noidung"
                                    className="admin-form-control textarea-noidung-them"
                                    onChange={handleInputModel}
                                    value={addFormData.noidung}
                                    required
                                />
                                {validateError.noidung && (
                                    <span className="error-message">
                                        {validateError.noidung[0]}
                                    </span>
                                )}
                            </div>

                            <div className="nam-modal-footer">
                                <button type="button" className="btn-action btn-role-buyer" onClick={handleCloseSua}><X size={16} /> Hủy bỏ</button>
                                <button type="submit" className="btn-action btn-primary"><Save size={16} /> Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Xem chi tiết bài viết */}
            {isopenchitiet && datachitiet && createPortal(
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content order-modal-content">
                        <div className="nam-modal-header">
                            <h3>Xem chi tiết bài viết</h3>
                            <button type="button" className="nam-modal-close" onClick={() => setisopenchitiet(false)}><X size={20} /></button>
                        </div>
                        <div className="post-detail-layout">
                            <div className="post-meta-info">
                                <span className="flex-align-center-gap-6"><User size={16} /> Tác giả: <strong>{datachitiet.user?.HoTen}</strong></span>
                                <span className="flex-align-center-gap-6"><Calendar size={16} /> Ngày đăng: <strong>{datachitiet.ngaydang}</strong></span>
                                <span>Loại Tin: <strong>{datachitiet.LoaiTin == 0 ? "Bài viết" : "Tin tức & Sự kiện"}</strong></span>
                                <span>Tỉnh Thành: <strong>{datachitiet.tinh_thanh?.TenTinhThanh}</strong></span>
                            </div>

                            <h2 className="post-tittel-heading">{datachitiet.tittel}</h2>
                            
                            <div>
                                <img src={`${IMG_URL}${datachitiet.hinhanh}`} alt="" className="post-detail-cover" />
                            </div>

                            {datachitiet.video_url && getYouTubeEmbedUrl(datachitiet.video_url) ? (
                                <div className="video-attachment-section">
                                    <strong>Video đính kèm:</strong>
                                    <div className="video-iframe-container">
                                        <iframe
                                            className="video-iframe"
                                            src={getYouTubeEmbedUrl(datachitiet.video_url)}
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            ) : datachitiet.video_url ? (
                                <div className="video-attachment-section">
                                    <strong>Link đính kèm khác:</strong>{' '}
                                    <a href={datachitiet.video_url} target="_blank" rel="noreferrer" className="status-text-blue">
                                        {datachitiet.video_url}
                                    </a>
                                </div>
                            ) : null}

                            <div className="post-body-content">
                                <strong>Tóm Tắt:</strong>
                                <p className="post-tomtat-box">{datachitiet.tomtat}</p>
                            </div>

                            <div className="post-body-content">
                                <strong>Nội dung chi tiết:</strong>
                                <div
                                    className="content-html-render html-render-box"
                                    dangerouslySetInnerHTML={{ __html: datachitiet?.noidung || "" }}
                                />
                            </div>
                        </div>

                        <div className="nam-modal-footer">
                            <button type="button" className="btn-action btn-primary" onClick={() => setisopenchitiet(false)}>Đóng chi tiết</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}