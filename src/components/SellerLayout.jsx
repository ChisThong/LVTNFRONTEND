import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getMyShop } from '../api/shopApi';
import axiosClient from '../api/axiosClient';
import { Bell, X, Sparkles, Store, ShoppingBag, Menu } from 'lucide-react';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';
import '../styles/navbar-admin.css';
import '../styles/seller.css';

function SellerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState('');
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);

  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notifications state
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchShop = () => {
    setShopLoading(true);
    getMyShop()
      .then((res) => {
        if (res.data?.success) setShop(res.data.data);
        else setShopError(res.data?.message || 'Không lấy được thông tin gian hàng.');
      })
      .catch((err) => {
        if (err?.response?.status === 404) setShopError('Bạn chưa đăng ký gian hàng.');
        else setShopError(err?.response?.data?.message || 'Lỗi kết nối.');
      })
      .finally(() => setShopLoading(false));
  };

  useEffect(() => {
    fetchShop();

    axiosClient.get('/phan-loai')
      .then((res) => {
        const list = res.data?.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {});

    axiosClient.get('/tinh-thanh')
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setProvinces(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

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

  // Pusher setup when shop is loaded
  // Fetch activities from DB to initialize
  const fetchActivities = async () => {
    if (!shop?.ID_Shop) return;
    try {
      const res = await axiosClient.get('/seller/activities');
      if (res.data?.success) {
        const dbActivities = res.data.data ?? [];
        setActivities(dbActivities);
        localStorage.setItem(`seller_activities_${shop.ID_Shop}`, JSON.stringify(dbActivities));

        // Calculate unread count based on last seen activity ID
        const lastSeenId = localStorage.getItem(`seller_last_seen_activity_id_${shop.ID_Shop}`);
        if (lastSeenId && dbActivities.length > 0) {
          const lastSeenIndex = dbActivities.findIndex(act => act.id === lastSeenId);
          if (lastSeenIndex === -1) {
            setUnreadCount(dbActivities.length);
          } else {
            setUnreadCount(lastSeenIndex);
          }
        } else if (!lastSeenId && dbActivities.length > 0) {
          setUnreadCount(dbActivities.length);
          localStorage.setItem(`seller_last_seen_activity_id_${shop.ID_Shop}`, dbActivities[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  useEffect(() => {
    if (!shop?.ID_Shop) return;

    // Load initial values from localStorage for fallback
    const savedActivities = localStorage.getItem(`seller_activities_${shop.ID_Shop}`);
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    } else {
      setActivities([]);
    }

    // Fetch fresh activities from DB
    fetchActivities();

    console.log("Connecting Pusher to Seller channel for shop:", shop.ID_Shop);
    const pusher = new Pusher('74b5dea7d94f427dbf7b', {
      cluster: 'ap1',
      forceTLS: true
    });

    const channelName = `seller-shop-channel.${shop.ID_Shop}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('seller-new-activity', (data) => {
      console.log('Received seller-new-activity:', data);
      playChime();

      const activityData = data.activity || data;
      const timeISO = activityData.thoigian || new Date().toISOString();

      const newAct = {
        id: activityData.id || ('pusher_' + Math.random().toString()),
        tieude: activityData.tieude,
        thoigian: timeISO,
        trangthai: activityData.trangthai || 'Mới',
        type: activityData.type || 'order',
        pulse: true
      };

      // 1. Save to state and localStorage
      setActivities(prev => {
        const updated = [newAct, ...prev].slice(0, 50);
        localStorage.setItem(`seller_activities_${shop.ID_Shop}`, JSON.stringify(updated));
        return updated;
      });

      // 2. Increment unread count
      setUnreadCount(prev => prev + 1);

      // 3. Trigger Toast notification matching Messenger-like styling
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
            borderLeft: '5px solid #2C3A29', // Dark green brand color
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
            backgroundColor: '#f3f6f3',
            borderRadius: '8px',
            color: '#2C3A29',
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
              Thông Báo Mới
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
      console.log("Unsubscribing Pusher from channel:", channelName);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [shop?.ID_Shop]);

  const handleClearUnread = () => {
    if (shop?.ID_Shop) {
      setUnreadCount(0);
      if (activities.length > 0) {
        localStorage.setItem(`seller_last_seen_activity_id_${shop.ID_Shop}`, activities[0].id);
      }
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/seller/dashboard')) return 'Dashboard người bán';
    if (path.includes('/seller/products')) return 'Quản lý sản phẩm';
    if (path.includes('/seller/orders')) return 'Quản lý đơn hàng';
    if (path.includes('/seller/reviews')) return 'Đánh giá khách hàng';
    if (path.includes('/seller/wallet')) return 'Ví người bán';
    if (path.includes('/seller/settings/profile')) return 'Hồ sơ gian hàng';
    return 'Kênh Người Bán';
  };

  const isShopLocked = shop?.TrangThai === 0;

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
          <button className="mobile-bell-btn" onClick={() => {
            setShowNotifications(!showNotifications);
            handleClearUnread();
          }} style={{ position: 'relative', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="mobile-bell-badge" style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                background: '#EF4444',
                borderRadius: '50%',
                border: '1px solid #FFFFFF'
              }} />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar Backdrop */}
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="admin-wrapper" style={{ '--sidebar-bg': '#2C3A29', '--sidebar-active': '#4A5B45', '--gold': '#D2B48C' }}>
        <Sidebar role="seller" mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        
        {/* Main content */}
        <main className="admin-main" style={{ background: '#F8F5F1', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          {/* Floating Notification Bell matching Admin dashboard styling */}
          {shop && (
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
                  border: '1px solid rgba(44, 58, 41, 0.25)',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <Bell size={18} color="#2C3A29" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2C3A29' }}>Thông báo</span>
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
          )}

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
                  border: '1px solid rgba(44, 58, 41, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  animation: 'slideIn 0.2s ease-out forwards'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#2C3A29', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={18} color="#2C3A29" /> Thông báo gần đây
                  </h3>
                  <button 
                    onClick={() => {
                      handleClearUnread();
                      setShowNotifications(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#2C3A29', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
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
                        if (act.type === 'shop') return <Store size={16} color="#2C3A29" />;
                        if (act.type === 'review') return <Sparkles size={16} color="#CA8A04" />;
                        return <ShoppingBag size={16} color="#10b981" />;
                      };
                      
                      const handleItemClick = () => {
                        setShowNotifications(false);
                        if (act.type === 'shop') navigate('/seller/settings/profile');
                        else if (act.type === 'product') navigate('/seller/products');
                        else if (act.type === 'order') navigate('/seller/orders');
                        else if (act.type === 'review') navigate('/seller/reviews');
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
                            background: act.type === 'shop' ? 'rgba(44, 58, 41, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {renderIcon()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0, color: '#1e293b', lineBreak: 'anywhere' }}>
                              {act.tieude}
                            </p>
                            <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
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

          {isShopLocked && (
            <div style={{
              background: '#FEF2F2', borderLeft: '4px solid #DC2626', color: '#991B1B',
              padding: '1rem 1.5rem', margin: '0', fontWeight: 600, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              Gian hàng của bạn hiện đang bị quản trị viên tạm khóa. Bạn không thể thêm mới hoặc chỉnh sửa sản phẩm.
            </div>
          )}
          <div style={{ flex: 1 }}>
            <Outlet context={{ shop, setShop, shopLoading, shopError, fetchShop, categories, provinces, isShopLocked }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default SellerLayout;
