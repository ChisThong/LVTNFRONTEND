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
  const [view, setView] = useState('list'); // 'list' or 'chat'
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Conversations list
  const [conversations, setConversations] = useState([]);

  // Active Chat Room state
  const [phongChat, setPhongChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [shopId, setShopId] = useState(null);
  const [shopName, setShopName] = useState('');
  const [vaiTro, setVaiTro] = useState('user'); // 'user' (acting as buyer) or 'shop' (acting as seller/replier)
  
  // References
  const messagesEndRef = useRef(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const currentUserRef = useRef(null);

  // 1. Fetch current user info
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

  // 2. Fetch all conversations for the user
  const fetchConversations = async () => {
    setListLoading(true);
    try {
      const res = await axiosClient.get('/chat/danh-sach-phong');
      if (res.data?.success) {
        setConversations(res.data.data ?? []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phòng chat:', err);
    } finally {
      setListLoading(false);
    }
  };

  // Fetch list when panel is opened and we are in list view
  useEffect(() => {
    if (isOpen && view === 'list') {
      fetchConversations();
    }
  }, [isOpen, view]);

  // 3. Register global function on window for "Chat ngay" buttons
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
      setVaiTro('user'); // Buyer starts chat
      setView('chat'); // Bypass list and open chat directly
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

  // 4. Connect to room
  useEffect(() => {
    if (!isOpen || !shopId || view !== 'chat') return;

    const connectToRoom = async () => {
      setLoading(true);
      try {
        // Step A: Find or Create room
        const roomRes = await axiosClient.post('/chat/vao-phong', { ID_Shop: shopId });
        const roomData = roomRes.data?.du_lieu;
        setPhongChat(roomData);

        if (roomData?.ID_PhongChat) {
          // Step B: Load message history
          const msgRes = await axiosClient.get(`/chat/phong/${roomData.ID_PhongChat}/tin-nhan`);
          setMessages(msgRes.data ?? []);
          window.dispatchEvent(new CustomEvent('chat-unread-change'));
          
          // Step C: Listen to Realtime Messages via Pusher
          const token = localStorage.getItem('token');
          const pusher = new Pusher('74b5dea7d94f427dbf7b', {
            cluster: 'ap1',
            forceTLS: true,
            authEndpoint: 'https://lvtnbackend.onrender.com/api/broadcasting/auth',
            auth: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          });
          pusherRef.current = pusher;

          const channelName = `private-phong-chat.${roomData.ID_PhongChat}`;
          const channel = pusher.subscribe(channelName);
          channelRef.current = channel;

          channel.bind('tin-nhan.moi', (data) => {
            setMessages(prev => {
              const exists = prev.some(m => m.ID_TinNhan === data.ID_TinNhan || (m.ThoiGianGui === data.ThoiGianGui && m.NoiDung === data.NoiDung));
              if (exists) return prev;
              return [...prev, {
                ID_TinNhan: data.ID_TinNhan,
                ID_PhongChat: data.ID_PhongChat,
                LoaiNguoiGui: data.LoaiNguoiGui,
                ID_NguoiGui: data.ID_NguoiGui,
                NoiDung: data.NoiDung,
                ThoiGianGui: data.ThoiGianGui
              }];
            });
            window.dispatchEvent(new CustomEvent('chat-unread-change'));
          });
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
      if (pusherRef.current && phongChat?.ID_PhongChat) {
        pusherRef.current.unsubscribe(`private-phong-chat.${phongChat.ID_PhongChat}`);
        pusherRef.current.disconnect();
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
      {/* ── BUBBLE BUTTON ── */}
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
            setView('list'); // Open conversations list by default
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
            {/* VIEW A: LIST OF CONVERSATIONS */}
            {view === 'list' && (
              <div className="conversations-list-container">
                {listLoading ? (
                  <div className="chat-loading">
                    <Loader className="spinner" size={24} />
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
                    <Loader className="spinner" size={24} />
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

          {/* Footer (Only shown in Chat View) */}
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
