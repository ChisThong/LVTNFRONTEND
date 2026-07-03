import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import ChatFloatingWidget from '../chat/ChatFloatingWidget';
import axiosClient from '../../api/axiosClient';

/* ═══════════════════════════════════════════════════════════
   PublicLayout — wrapper cho tất cả trang Public
   Navbar + <Outlet /> (nội dung trang) + Footer
   ═══════════════════════════════════════════════════════════ */
export default function PublicLayout() {
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loadingPublicData, setLoadingPublicData] = useState(true);

  useEffect(() => {
    setLoadingPublicData(true);
    Promise.all([
      axiosClient.get('/phan-loai'),
      axiosClient.get('/tinh-thanh')
    ])
      .then(([catRes, provRes]) => {
        const catList = catRes.data?.data ?? [];
        setCategories(Array.isArray(catList) ? catList : []);

        const provList = provRes.data?.data ?? provRes.data ?? [];
        setProvinces(Array.isArray(provList) ? provList : []);
      })
      .catch((err) => console.error("Failed to load public layout static resources", err))
      .finally(() => setLoadingPublicData(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet context={{ categories, provinces, loadingPublicData }} />
      </div>
      <PublicFooter />
      <ChatFloatingWidget />
    </div>
  );
}
