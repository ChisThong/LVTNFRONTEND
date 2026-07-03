import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Menu, Bell, X, Sparkles, Store, Users, ShoppingBag } from 'lucide-react';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import '../../styles/navbar-admin.css';
import '../../styles/admin-custom.css';

function Admin() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Notification count state
    const [unreadCount, setUnreadCount] = useState(() => {
        return parseInt(localStorage.getItem('admin_unread_count') || '0', 10);
    });

    const [showNotifications, setShowNotifications] = useState(false);
    const [activities, setActivities] = useState(() => {
        return JSON.parse(localStorage.getItem('admin_activities') || '[]');
    });

    const pusherRef = useRef(null);

    // Audio synthesizer for chime alert
    const playChime = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime);
            gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start();
            osc1.stop(audioCtx.currentTime + 0.35);
            
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime);
                gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.5);
            }, 100);
        } catch (e) {
            console.warn("Audio Context blocked: ", e);
        }
    };

    // Format display time for activities
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return timeStr;
        }
    };

    // Fetch activities from DB to initialize
    const fetchActivities = async () => {
        try {
            const res = await axiosClient.get('/admin/dashboard');
            if (res.data?.data?.activities) {
                const dbActivities = res.data.data.activities;
                setActivities(dbActivities);
                localStorage.setItem('admin_activities', JSON.stringify(dbActivities));

                // Tính toán số thông báo chưa đọc thực tế từ DB
                const lastSeenId = localStorage.getItem('admin_last_seen_activity_id');
                if (lastSeenId && dbActivities.length > 0) {
                    const lastSeenIndex = dbActivities.findIndex(act => act.id === lastSeenId);
                    if (lastSeenIndex !== -1) {
                        const newUnread = lastSeenIndex;
                        setUnreadCount(newUnread);
                        localStorage.setItem('admin_unread_count', newUnread.toString());
                    } else {
                        // Nếu ID đã xem quá cũ không còn trong danh sách 30 tin nhắn gần nhất
                        setUnreadCount(0);
                        localStorage.setItem('admin_unread_count', '0');
                    }
                } else if (!lastSeenId && dbActivities.length > 0) {
                    // Lần đầu vào trang, coi như đã xem tin nhắn mới nhất hiện tại
                    localStorage.setItem('admin_last_seen_activity_id', dbActivities[0].id);
                    setUnreadCount(0);
                    localStorage.setItem('admin_unread_count', '0');
                }
            }
        } catch (err) {
            console.error("Error fetching activities:", err);
        }
    };

    useEffect(() => {
        // Initial fetch from DB
        fetchActivities();

        // Configure and Connect Pusher globally
        console.log("Initializing Global Pusher connection in Admin Layout...");
        const pusher = new Pusher('74b5dea7d94f427dbf7b', {
            cluster: 'ap1',
            forceTLS: true
        });
        pusherRef.current = pusher;

        const channel = pusher.subscribe('admin-dashboard-channel');
        
        channel.bind('new-activity', (data) => {
            console.log('Global Pusher received new-activity:', data);
            playChime();

            const activityData = data.activity || data;
            const timeISO = activityData.thoigian || new Date().toISOString();

            const newAct = {
                id: Math.random().toString(),
                tieude: activityData.tieude,
                thoigian: timeISO,
                trangthai: activityData.trangthai || 'Mới',
                type: activityData.type || 'shop',
                pulse: true
            };

            // 1. Save to local state and localStorage
            setActivities(prev => {
                const updated = [newAct, ...prev].slice(0, 50);
                localStorage.setItem('admin_activities', JSON.stringify(updated));
                return updated;
            });

            // 2. Increment unread notifications count
            setUnreadCount(prev => {
                const nextCount = prev + 1;
                localStorage.setItem('admin_unread_count', nextCount.toString());
                return nextCount;
            });

            // 3. Dispatch global custom event for active Dashboard view
            window.dispatchEvent(new CustomEvent('new-admin-activity', { detail: newAct }));

            // 4. Trigger Toast Notification with premium horizontal design using pure inline styles
            toast.custom((t) => (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '12px',
                        width: '420px',
                        maxWidth: '100%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        borderLeft: '5px solid #d4a373',
                        padding: '12px 16px',
                        position: 'relative',
                        pointerEvents: 'auto',
                        animation: t.visible ? 'slideIn 0.3s ease-out forwards' : 'slideOut 0.3s ease-out forwards',
                        boxSizing: 'border-box',
                        zIndex: 99999
                    }}
                >
                    <div style={{
                        padding: '8px',
                        backgroundColor: '#fdf8f1',
                        borderRadius: '8px',
                        color: '#d4a373',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Sparkles size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '24px' }}>
                        <p style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 800, 
                            color: '#1e293b', 
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            Thông Báo Hệ Thống Mới
                        </p>
                        <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#64748b', 
                            margin: '2px 0 0 0',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {activityData.tieude}
                        </p>
                    </div>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '12px',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ), { duration: 5000 });
        });

        return () => {
            if (pusherRef.current) {
                pusherRef.current.unsubscribe('admin-dashboard-channel');
                pusherRef.current.disconnect();
            }
        };
    }, []);

    // Clear notifications count on click
    const handleClearUnread = () => {
        setUnreadCount(0);
        localStorage.setItem('admin_unread_count', '0');
        if (activities.length > 0) {
            localStorage.setItem('admin_last_seen_activity_id', activities[0].id);
        }
    };

    // Map location pathname to readable title
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/dashboard')) return 'Dashboard hệ thống';
        if (path.includes('/admin/shops')) return 'Duyệt gian hàng';
        if (path.includes('/admin/orders')) return 'Quản lý đơn hàng';
        if (path.includes('/admin/products')) return 'Quản lý sản phẩm';
        if (path.includes('/admin/regions')) return 'Danh mục vùng miền';
        if (path.includes('/admin/posts')) return 'Quản lý bài viết';
        if (path.includes('/admin/users')) return 'Quản lý người dùng';
        if (path.includes('/admin/wallet')) return 'Quản lý Ví điện tử';
        return 'Quản trị hệ thống';
    };

    return (
        <div className="admin-layout-container">
            {/* Mobile Header */}
            <header className="admin-mobile-header">
                <div className="mobile-header-left">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="mobile-header-title">{getPageTitle()}</span>
                </div>
                <div className="mobile-header-right">
                    <button className="mobile-nav-link" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span>Về</span>
                        <span>trang chủ</span>
                    </button>
                    <button className="mobile-bell-btn" onClick={() => {
                        setShowNotifications(!showNotifications);
                        handleClearUnread();
                    }} style={{ position: 'relative', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="mobile-bell-badge" style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: '#EF4444',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '0.65rem',
                                padding: '2px 5px',
                                fontWeight: 'bold',
                                minWidth: '15px',
                                height: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Sidebar Backdrop */}
            <div
                className={`admin-sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <div className="admin-wrapper">
                <Sidebar role="admin" mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

                <main className="admin-main">
                    <Outlet />
                </main>
            </div>

            {/* Floating Notification Bell for Desktop Admin Panel */}
            <div className="desktop-notification-container" style={{
                position: 'fixed',
                top: '20px',
                right: '30px',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button 
                    className="filter-btn" 
                    onClick={() => {
                        setShowNotifications(!showNotifications);
                        handleClearUnread();
                    }}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '0.5rem 1rem', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderRadius: '20px',
                        background: '#ffffff',
                        border: '1px solid rgba(212, 163, 115, 0.25)',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                >
                    <Bell size={18} color="#d4a373" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Thông báo</span>
                    {unreadCount > 0 && (
                        <span style={{
                            background: '#EF4444',
                            color: 'white',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            fontWeight: 'bold'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
                <>
                    <div 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                        onClick={() => setShowNotifications(false)}
                    />
                    <div 
                        className="admin-card"
                        style={{
                            position: 'fixed',
                            top: '70px',
                            right: '30px',
                            width: '380px',
                            maxHeight: '480px',
                            zIndex: 999,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                            borderRadius: '16px',
                            background: '#ffffff',
                            border: '1px solid rgba(212, 163, 115, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1.25rem',
                            animation: 'slideIn 0.2s ease-out forwards'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={18} color="#d4a373" /> Thông báo gần đây
                            </h3>
                            <button 
                                onClick={() => {
                                    handleClearUnread();
                                    setShowNotifications(false);
                                }}
                                style={{ background: 'none', border: 'none', color: '#d4a373', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Đóng
                            </button>
                        </div>

                        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                            {activities.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '2rem 0' }}>
                                    Không có thông báo nào
                                </div>
                            ) : (
                                activities.map((act) => {
                                    const renderIcon = () => {
                                        if (act.type === 'shop') return <Store size={16} color="#d4a373" />;
                                        if (act.type === 'user') return <Users size={16} color="#3b82f6" />;
                                        return <ShoppingBag size={16} color="#10b981" />;
                                    };
                                    
                                    const handleItemClick = () => {
                                        setShowNotifications(false);
                                        if (act.type === 'shop') navigate('/admin/shops');
                                        else if (act.type === 'user') navigate('/admin/users');
                                        else if (act.type === 'order') navigate('/admin/orders');
                                    };

                                    return (
                                        <div 
                                            key={act.id} 
                                            onClick={handleItemClick}
                                            style={{ 
                                                display: 'flex', 
                                                gap: '12px',
                                                alignItems: 'flex-start', 
                                                borderBottom: '1px solid #f8fafc', 
                                                paddingBottom: '10px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                padding: '8px',
                                                borderRadius: '8px'
                                            }}
                                            className="notification-item-hover"
                                        >
                                            <div style={{
                                                padding: '8px',
                                                background: act.type === 'shop' ? 'rgba(212, 163, 115, 0.1)' : act.type === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                {renderIcon()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0, color: 'var(--text-main)', lineBreak: 'anywhere' }}>
                                                    {act.tieude}
                                                </p>
                                                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    {formatTime(act.thoigian)}
                                                </small>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Admin;
