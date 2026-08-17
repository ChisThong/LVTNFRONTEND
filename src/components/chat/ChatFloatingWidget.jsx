import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { MessageSquare, X, Send, Store, MessageCircle, AlertCircle, Loader, ChevronLeft, User } from 'lucide-react';
import '../../styles/chat-widget.css';

export default function ChatFloatingWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); 
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [conversations, setConversations] = useState([]);

  const [phongChat, setPhongChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [shopId, setShopId] = useState(null);
  const [shopName, setShopName] = useState('');
  const [vaiTro, setVaiTro] = useState('user'); 
  
  const messagesEndRef = useRef(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const currentUserRef = useRef(null);
  const pollingRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const listPollingRef = useRef(null);
  const activeRoomRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = phongChat;
  }, [phongChat]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axiosClient.get('/me')
        .then(res => {
          if (res.data?.data) {
            currentUserRef.current = res.data.data;
          }
        })
        .catch(() => {
          currentUserRef.current = null;
        });
    }
  }, [isOpen]);

  const fetchConversations = async (silent = false) => {
    if (!silent) setListLoading(true);
    try {
      const res = await axiosClient.get('/chat/danh-sach-phong');
      if (res.data?.success) {
        let newList = res.data.data ?? [];
        if (activeRoomRef.current) {
          newList = newList.map(c => 
            c.ID_PhongChat === activeRoomRef.current.ID_PhongChat ? { ...c, tin_chua_doc: 0 } : c
          );
        }
        setConversations(newList);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phòng chat:', err);
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations(view !== 'list');
      listPollingRef.current = setInterval(() => {
        fetchConversations(true);
      }, 5000);
      return () => {
        if (listPollingRef.current) clearInterval(listPollingRef.current);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    window.openChatWithShop = (idShop, nameShop) => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để bắt đầu trò chuyện!');
        navigate('/login');
        return;
      }
      setShopId(idShop);
      setShopName(nameShop);
      setVaiTro('user'); 
      setView('chat'); 
      setIsOpen(true);
    };

    window.openChatWidget = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xem tin nhắn!');
        navigate('/login');
        return;
      }
      setView('list');
      setIsOpen(true);
    };

    return () => {
      delete window.openChatWithShop;
      delete window.openChatWidget;
    };
  }, [navigate]);
  useEffect(() => {
    if (!isOpen || !shopId || view !== 'chat') return;

    const connectToRoom = async () => {
      setLoading(true);
      try {
        const roomRes = await axiosClient.post('/chat/vao-phong', { ID_Shop: shopId });
        const roomData = roomRes.data?.du_lieu;
        setPhongChat(roomData);

        if (roomData?.ID_PhongChat) {
          const msgRes = await axiosClient.get(`/chat/phong/${roomData.ID_PhongChat}/tin-nhan`);
          const initialMsgs = msgRes.data ?? [];
          setMessages(initialMsgs);
          if (initialMsgs.length > 0) {
            lastMsgIdRef.current = initialMsgs[initialMsgs.length - 1].ID_TinNhan;
          }
          window.dispatchEvent(new CustomEvent('chat-unread-change'));
          setConversations(prev => prev.map(c => 
            c.ID_PhongChat === roomData.ID_PhongChat ? { ...c, tin_chua_doc: 0 } : c
          ));
          
          const token = localStorage.getItem('token');
          const apiUrl = import.meta.env.VITE_API_URL || 'https://lvtnbackend.onrender.com/api';
          const pusher = new Pusher('74b5dea7d94f427dbf7b', {
            cluster: 'ap1',
            forceTLS: true,
            authEndpoint: `${apiUrl}/broadcasting/auth`,
            auth: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          });
          pusherRef.current = pusher;

          const appendMessage = (payload) => {
            setMessages(prev => {
              const exists = prev.some(m =>
                m.ID_TinNhan === payload.ID_TinNhan ||
                (m.ThoiGianGui === payload.ThoiGianGui && m.NoiDung === payload.NoiDung)
              );
              if (exists) return prev;
              lastMsgIdRef.current = payload.ID_TinNhan;
              return [...prev, {
                ID_TinNhan: payload.ID_TinNhan,
                ID_PhongChat: payload.ID_PhongChat,
                LoaiNguoiGui: payload.LoaiNguoiGui,
                ID_NguoiGui: payload.ID_NguoiGui,
                NoiDung: payload.NoiDung,
                ThoiGianGui: payload.ThoiGianGui
              }];
            });
            window.dispatchEvent(new CustomEvent('chat-unread-change'));
          };

          // Try subscribing to private channel
          try {
            const privateChannel = pusher.subscribe(`private-phong-chat.${roomData.ID_PhongChat}`);
            channelRef.current = privateChannel;
            privateChannel.bind('tin-nhan.moi', (data) => appendMessage(data.message || data));
            privateChannel.bind('.tin-nhan.moi', (data) => appendMessage(data.message || data));
            privateChannel.bind('pusher:subscription_error', (err) => {
              console.warn('[Pusher] Private channel auth failed, relying on polling:', err);
            });
          } catch(e) {
            console.warn('[Pusher] Subscribe error:', e);
          }

          // Step D: Polling every 3s as guaranteed fallback
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = setInterval(async () => {
            try {
              const pollRes = await axiosClient.get(`/chat/phong/${roomData.ID_PhongChat}/tin-nhan`);
              const allMsgs = pollRes.data ?? [];
              setMessages(prev => {
                if (allMsgs.length === prev.length) return prev;
                const prevIds = new Set(prev.map(m => m.ID_TinNhan));
                const newMsgs = allMsgs.filter(m => !prevIds.has(m.ID_TinNhan));
                if (newMsgs.length === 0) return prev;
                window.dispatchEvent(new CustomEvent('chat-unread-change'));
                return [...prev, ...newMsgs];
              });
            } catch(e) {
            }
          }, 3000);
        }
      } catch (err) {
        console.error('Lỗi khi vào phòng chat:', err);
        toast.error('Không thể kết nối đến máy chủ chat.');
      } finally {
        setLoading(false);
      }
    };

    connectToRoom();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      setPhongChat(null);
      setMessages([]);
    };
  }, [isOpen, shopId, view]);

  // 5. Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 6. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !phongChat || sending) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await axiosClient.post('/chat/gui-tin-nhan', {
        ID_PhongChat: phongChat.ID_PhongChat,
        NoiDung: contentToSend,
        LoaiNguoiGui: vaiTro === 'shop' ? 'shop' : 'user'
      });

      const savedMsg = res.data?.du_lieu;
      if (savedMsg) {
        setMessages(prev => {
          const exists = prev.some(m => m.ID_TinNhan === savedMsg.ID_TinNhan);
          if (exists) return prev;
          return [...prev, savedMsg];
        });
        window.dispatchEvent(new CustomEvent('chat-unread-change'));
        setConversations(prevList =>
          prevList.map(c =>
            c.ID_PhongChat === phongChat.ID_PhongChat
              ? { ...c, TinNhanCuoi: contentToSend, ThoiGianCapNhat: new Date().toISOString(), tin_chua_doc: 0 }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
      toast.error('Không thể gửi tin nhắn.');
      setNewMessage(contentToSend);
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setShopId(null);
    setShopName('');
    setPhongChat(null);
    setMessages([]);
  };

  const selectConversation = (conv) => {
    setShopId(conv.ID_Shop);
    setShopName(conv.ten_doi_tac);
    setVaiTro(conv.vai_tro === 'customer' ? 'shop' : 'user'); // Set our role based on partner role
    setView('chat');
  };

  // Format display time
  const formatMsgTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatListTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="chat-floating-container">
      {!isOpen && (
        <button 
          className="chat-bubble-btn" 
          onClick={() => {
            const token = localStorage.getItem('token');
            if (!token) {
              toast.error('Vui lòng đăng nhập để chat!');
              navigate('/login');
              return;
            }
            setView('list');
            setIsOpen(true);
          }}
          title="Trò chuyện với Shop"
        >
          <MessageSquare size={24} />
          <span className="chat-tooltip">Trò chuyện</span>
        </button>
      )}

      {/* ── CHAT PANEL ── */}
      {isOpen && (
        <div className="chat-panel card-premium">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-shop-info">
              {view === 'chat' && (
                <button className="chat-back-btn" onClick={handleBackToList}>
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="shop-avatar-placeholder">
                {view === 'chat' && vaiTro === 'shop' ? <User size={18} /> : <Store size={18} />}
              </div>
              <div className="shop-text">
                {view === 'chat' ? (
                  <>
                    <h4>{shopName || 'Hội thoại'}</h4>
                    <span className="status-online">{vaiTro === 'shop' ? 'Khách hàng' : 'Cửa hàng'}</span>
                  </>
                ) : (
                  <>
                    <h4>Hộp thư hỗ trợ</h4>
                    <span className="status-sub">Danh sách cuộc hội thoại</span>
                  </>
                )}
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="chat-body">
            {view === 'list' && (
              <div className="conversations-list-container">
                {listLoading ? (
                  <div className="chat-loading">
                    <p>Đang tải danh sách hộp thư...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="chat-empty">
                    <MessageCircle size={32} color="#cbd5e1" />
                    <p>Hộp thư trống</p>
                    <span className="chat-hint">Chọn "Chat ngay" tại chi tiết sản phẩm của Shop bất kỳ để bắt đầu trò chuyện.</span>
                  </div>
                ) : (
                  <div className="conversations-list">
                    {conversations.map((conv) => (
                      <div 
                        key={conv.ID_PhongChat} 
                        className="conversation-item"
                        onClick={() => selectConversation(conv)}
                      >
                        <div className="conv-avatar">
                          {conv.vai_tro === 'customer' ? <User size={16} /> : <Store size={16} />}
                        </div>
                        <div className="conv-details">
                          <div className="conv-header-row">
                            <span className="conv-name">
                              {conv.vai_tro === 'customer' ? `[Khách] ${conv.ten_doi_tac}` : conv.ten_doi_tac}
                            </span>
                            <span className="conv-time">{formatListTime(conv.ThoiGianCapNhat)}</span>
                          </div>
                          <div className="conv-message-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                            <p className="conv-last-msg" style={{ fontWeight: Number(conv.tin_chua_doc) > 0 ? 800 : 400, color: Number(conv.tin_chua_doc) > 0 ? '#1e293b' : '#64748b', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                              {conv.TinNhanCuoi || 'Chưa có tin nhắn'}
                            </p>
                            {Number(conv.tin_chua_doc) > 0 && (
                              <span style={{
                                minWidth: '18px',
                                height: '18px',
                                borderRadius: '9px',
                                background: '#EF4444',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 5px',
                                marginLeft: '8px',
                                flexShrink: 0
                              }}>
                                {conv.tin_chua_doc}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW B: CHAT WINDOW */}
            {view === 'chat' && (
              <>
                {loading ? (
                  <div className="chat-loading">
                    <p>Đang kết nối phòng chat...</p>
                  </div>
                ) : !phongChat ? (
                  <div className="chat-error">
                    <AlertCircle size={24} color="#EF4444" />
                    <p>Không thể kết nối đến cuộc hội thoại.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <MessageCircle size={32} color="#cbd5e1" />
                    <p>Bắt đầu cuộc trò chuyện với <strong>{shopName}</strong></p>
                    <span className="chat-hint">Gửi tin nhắn để bắt đầu cuộc trò chuyện!</span>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg, index) => {
                      const isMe = (msg.LoaiNguoiGui === 'user' && vaiTro === 'user') || (msg.LoaiNguoiGui === 'shop' && vaiTro === 'shop');
                      return (
                        <div key={msg.ID_TinNhan || index} className={`message-item ${isMe ? 'msg-me' : 'msg-them'}`}>
                          <div className="msg-bubble">
                            <p>{msg.NoiDung}</p>
                            <span className="msg-time">{formatMsgTime(msg.ThoiGianGui)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}
          </div>

          {view === 'chat' && (
            <form className="chat-footer" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={loading || !phongChat}
              />
              <button 
                type="submit" 
                className="chat-send-btn" 
                disabled={!newMessage.trim() || loading || !phongChat || sending}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
