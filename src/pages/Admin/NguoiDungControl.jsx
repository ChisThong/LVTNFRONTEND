import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, Unlock, Mail, Phone, Users, Shield, UserCheck, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Capquyenadmin, getAlluser, Lockuser } from '../../api/QLUserAPi';

export default function NguoiDungControl() {
    const [page, setpage] = useState(1);
    const [search, setsearch] = useState("");
    const queryClient = useQueryClient();
    const [quyen, setquyen] = useState("");
    const [trangthai, settrangthai] = useState("");

    // Gọi API lấy danh sách người dùng
    const { data: responseData, isFetching } = useQuery({
        queryKey: ['user', page, search, quyen, trangthai],
        queryFn: async () => {
            const params = {
                page: page,
                limit: 10,
                search: search
            };
            if (quyen !== "") {
                params.ID_role = quyen;
            }
            if (trangthai !== "") {
                params.TrangThai = trangthai;
            }
            const response = await getAlluser(params);
            return response.data;
        }
    });

    const users = responseData?.data?.data || [];
    const Total = responseData?.tong || 0;
    const adCount = responseData?.demadmin || 0;
    const sellCount = responseData?.demseller || 0;
    const lockCount = responseData?.demblock || 0;
    const Tongpage = responseData?.data?.last_page || 1;

    // Quản lý input tìm kiếm
    const [inputText, setinputText] = useState("");
    const handleSearch = () => {
        setsearch(inputText);
        setpage(1);
    }

    const handlechangeSearch = (e) => {
        const value = e.target.value;
        setinputText(value);
        if (value.trim() === "") {
            setsearch("");
            setpage(1);
        }
    }

    // Lọc theo vai trò (Role)
    const handlelocrole = (value) => {
        setquyen(value);
        setpage(1);
    };

    // Lọc theo trạng thái hoạt động
    const handlelocTT = (value) => {
        settrangthai(value);
        setpage(1);
    };

    // Mutation: Khóa / Mở khóa người dùng
    const lockuser = useMutation({
        mutationFn: (id) => Lockuser(id),
        onSuccess: (response) => {
            alert(response?.data?.message);
            queryClient.invalidateQueries(['user'])
        }, onError: (error) => {
            alert("Thao tác khóa/mở khóa thất bại!!")
            console.error(error);
        }
    });

    // Mutation: Cấp quyền quản trị viên (Admin)
    const CapquyenAdmin = useMutation({
        mutationFn: (id) => Capquyenadmin(id),
        onSuccess: (response) => {
            alert(response?.data?.message);
            queryClient.invalidateQueries(['user']);
        },
        onError: (error) => {
            alert("Cấp quyền admin thất bại!!");
            console.error(error);
        }
    });

    const handleCapQuyen = (q) => {
        const c = window.confirm(`Bạn có chắc muốn cấp quyền Admin cho tài khoản này không?`);
        if (c) {
            CapquyenAdmin.mutate(q)
        }
    }

    return (
        <div className="view-section">
            <h1 className="admin-title">Quản lý người dùng</h1>

            {/* Khu vực thẻ thống kê */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-member">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng thành viên</h3>
                        <div className="value">{Total}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-seller">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Nhà bán hàng</h3>
                        <div className="value">{sellCount}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-admin">
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Quản trị viên</h3>
                        <div className="value">{adCount}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-locked">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tài khoản bị khóa</h3>
                        <div className="value">{lockCount}</div>
                    </div>
                </div>
            </div>

            {/* Khu vực tìm kiếm và bộ lọc */}
            <div className="admin-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thành viên..."
                        value={inputText}
                        onChange={handlechangeSearch}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button type="button" className="icon-btn" onClick={() => handleSearch()}><Search size={18} /></button>
                </div>
                
                <div className="filter-group">
                    <select name="role" id="role" className="admin-form-control" value={quyen} onChange={(e) => handlelocrole(e.target.value)}>
                        <option value="">Tất cả vai trò</option>
                        <option value="1">Quản trị viên</option>
                        <option value="3">Nhà bán hàng</option>
                        <option value="2">Khách hàng</option>
                    </select>

                    <select name="trangthai" id="trangthai" className="admin-form-control" value={trangthai} onChange={(e) => handlelocTT(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Hoạt động</option>
                        <option value="2">Bị khóa</option>
                    </select>
                </div>
            </div>

            {/* Bảng dữ liệu người dùng */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Thành viên</th>
                            <th>Thông tin liên hệ</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <tr>
                                <td colSpan="5" className="text-center text-muted-small">
                                    Đang tải dữ liệu người dùng......
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center text-muted-small">
                                    Không tìm thấy thông tin phù hợp
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.ID_User}>
                                    <td>
                                        <div className="flex-center-gap-12">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.HoTen)}&background=EAE3DA&color=4A3B32`}
                                                alt={u.HoTen}
                                                className="admin-avatar"
                                            />
                                            <span className="text-semibold">{u.HoTen}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex-column-gap-4">
                                            <span className="flex-align-center-gap-6 text-muted-small">
                                                <Mail size={14} /> {u.email}
                                            </span>
                                            {u.diachi && (
                                                <span className="text-muted-small">
                                                    {u.diachi}
                                                </span>
                                            )}
                                            <span className="flex-align-center-gap-6 text-muted-small">
                                                <Phone size={14} /> {u.sdt || 'Chưa cập nhật'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.ID_role === 1 ? 'badge-role-admin' : u.ID_role === 3 ? 'badge-role-seller' : 'badge-role-buyer'}`}>
                                            {u.role?.Ten_role || 'Chưa cập nhật'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.TrangThai == 1 ? 'badge-success' : 'badge-pending'}`}>
                                            {u.TrangThai == 1 ? "Hoạt động" : "Bị khóa"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button 
                                                type="button" 
                                                className="icon-btn" 
                                                title={u.TrangThai == 1 ? "Khóa tài khoản" : "Mở khóa tài khoản"} 
                                                onClick={() => lockuser.mutate(u.ID_User)}
                                            >
                                                {u.TrangThai == 1 ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                            {u.ID_role !== 1 && u.ID_role !== 3 && (
                                                <button 
                                                    type="button" 
                                                    className="btn-action btn-primary" 
                                                    onClick={() => handleCapQuyen(u.ID_User)}
                                                >
                                                    Cấp Admin
                                                </button>
                                            )}
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
        </div>
    )
}