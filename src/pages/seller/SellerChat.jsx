import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { MessageSquare, Send, User, Loader, AlertCircle, MessageCircle } from 'lucide-react';
import '../../styles/seller.css';

export default function SellerChat() {
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Active chat state
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  // 1. Fetch all conversations for this Shop
  const fetchConversations = async () => {
    setListLoading(true);
    try {
      const res = await axiosClient.get('/chat/danh-sach-phong?role=seller');
      if (res.data?.success) {
        setConversations(res.data.data ?? []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách chat của shop:', err);
      toast.error('Không thể tải danh sách cuộc trò chuyện.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Select conversation and load messages
  const selectConversation = async (room) => {
    setActiveRoom(room);
    setLoading(true);
    setMessages([]);

    try {
      const res = await axiosClient.get(`/chat/phong/${room.ID_PhongChat}/tin-nhan`);
      setMessages(res.data ?? []);
      window.dispatchEvent(new CustomEvent('chat-unread-change'));

      // Realtime listener
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }

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

      const channelName = `private-phong-chat.${room.ID_PhongChat}`;
      const channel = pusher.subscribe(channelName);
      channelRef.current = channel;

      channel.bind('tin-nhan.moi', (data) => {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.ID_TinNhan === data.ID_TinNhan ||
              (m.ThoiGianGui === data.ThoiGianGui && m.NoiDung === data.NoiDung)
          );
          if (exists) return prev;
          return [...prev, data];
        });
        window.dispatchEvent(new CustomEvent('chat-unread-change'));
      });
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
      toast.error('Không thể tải lịch sử tin nhắn.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Cleanup Pusher connection
  useEffect(() => {
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  // 4. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Send message from Shop
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || sending) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await axiosClient.post('/chat/gui-tin-nhan', {
        ID_PhongChat: activeRoom.ID_PhongChat,
        NoiDung: contentToSend,
        LoaiNguoiGui: 'shop' // Gửi với vai trò Shop
      });

      const savedMsg = res.data?.du_lieu;
      if (savedMsg) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.ID_TinNhan === savedMsg.ID_TinNhan);
          if (exists) return prev;
          return [...prev, savedMsg];
        });
        window.dispatchEvent(new CustomEvent('chat-unread-change'));

        // Update last message in local list state
        setConversations((prevList) =>
          prevList.map((c) =>
            c.ID_PhongChat === activeRoom.ID_PhongChat
              ? { ...c, TinNhanCuoi: contentToSend, ThoiGianCapNhat: new Date().toISOString() }
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div style={{ padding: '2rem', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2C3A29' }}>Tin nhắn khách hàng</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Tư vấn trực tiếp và hỗ trợ khách hàng mua sản phẩm.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 0 }}>
        {/* LEFT BAR: LIST OF BUYERS */}
        <div style={{
          width: '320px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#2C3A29' }}>
            Hội thoại gần đây
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            {listLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', gap: '8px' }}>
                <Loader style={{ animation: 'spin 1.5s linear infinite' }} size={20} />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Đang tải danh sách...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                Chưa có khách hàng nào nhắn tin cho Shop.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conversations.map((conv) => {
                  const isActive = activeRoom?.ID_PhongChat === conv.ID_PhongChat;
                  return (
                    <div
                      key={conv.ID_PhongChat}
                      onClick={() => selectConversation(conv)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: isActive ? '#f1f5f9' : '#ffffff',
                        border: `1px solid ${isActive ? '#cbd5e1' : '#f1f5f9'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#fdf8f1',
                        color: '#d4a373',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(212,163,115,0.2)'
                      }}>
                        <User size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {conv.ten_doi_tac || 'Khách hàng'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: Number(conv.tin_chua_doc) > 0 ? 800 : 400, color: Number(conv.tin_chua_doc) > 0 ? '#1e293b' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT CONTENT */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {activeRoom ? (
            <>
              {/* Header */}
              <div style={{ padding: '15px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#fdf8f1',
                  color: '#d4a373',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                    {activeRoom.ten_doi_tac || 'Khách hàng'}
                  </h4>
                  <small style={{ color: '#94a3b8' }}>{activeRoom.email_doi_tac}</small>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '25px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px' }}>
                    <Loader style={{ animation: 'spin 1.5s linear infinite', color: '#2C3A29' }} size={24} />
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Đang tải tin nhắn...</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isMe = msg.LoaiNguoiGui === 'shop';
                      return (
                        <div
                          key={msg.ID_TinNhan || index}
                          style={{
                            display: 'flex',
                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                            width: '100%'
                          }}
                        >
                          <div style={{
                            maxWidth: '65%',
                            padding: '10px 15px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            lineHeight: 1.45,
                            background: isMe ? 'linear-gradient(135deg, #2C3A29 0%, #3e503a 100%)' : '#ffffff',
                            color: isMe ? '#ffffff' : '#1e293b',
                            border: isMe ? 'none' : '1px solid #e2e8f0',
                            borderBottomRightRadius: isMe ? '4px' : '12px',
                            borderBottomLeftRadius: isMe ? '12px' : '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}>
                            <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.NoiDung}</p>
                            <span style={{ fontSize: '0.65rem', alignSelf: 'flex-end', opacity: 0.7 }}>
                              {formatTime(msg.ThoiGianGui)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Footer */}
              <form
                onSubmit={handleSendMessage}
                style={{ padding: '15px 25px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '15px', alignItems: 'center' }}
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn phản hồi..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loading || sending}
                  style={{
                    flex: 1,
                    height: '40px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '0 20px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#f8fafc'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading || sending}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#2C3A29',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', padding: '20px' }}>
              <MessageCircle size={48} style={{ marginBottom: '10px', color: '#cbd5e1' }} />
              <h3>Chưa chọn cuộc hội thoại</h3>
              <p style={{ fontSize: '0.85rem' }}>Hãy chọn một khách hàng từ danh sách bên trái để xem nội dung tin nhắn và tư vấn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
