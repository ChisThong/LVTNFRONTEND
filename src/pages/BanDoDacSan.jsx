import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Search, Filter, Layers, Box, Globe, RotateCw, X, ChevronRight, ShoppingCart, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import bannerBg from '../assets/bannermap.png';
import '../styles/map.css';

// Coordinated lookups for Southern Vietnam provinces
const PROVINCE_COORDINATES = {
  "TP. Hồ Chí Minh": { lat: 10.776, lng: 106.701 },
  "Tây Ninh": { lat: 11.362, lng: 106.126 },
  "Đồng Tháp": { lat: 10.435, lng: 105.632 },
  "Cà Mau": { lat: 9.176, lng: 105.152 },
  "Đồng Nai": { lat: 10.957, lng: 106.842 },
  "Vĩnh Long": { lat: 10.252, lng: 105.972 },
  "An Giang": { lat: 10.372, lng: 105.437 },
  "TP. Cần Thơ": { lat: 10.036, lng: 105.787 },
  "Sóc Trăng": { lat: 9.602, lng: 105.973 },
  "Hậu Giang": { lat: 9.784, lng: 105.470 },
  "Bến Tre": { lat: 10.243, lng: 106.375 },
  "Trà Vinh": { lat: 9.948, lng: 106.340 },
  "Bạc Liêu": { lat: 9.294, lng: 105.727 },
  "Kiên Giang": { lat: 9.982, lng: 105.124 },
  "Long An": { lat: 10.538, lng: 106.413 },
  "Tiền Giang": { lat: 10.449, lng: 106.341 },
  "Bình Dương": { lat: 10.980, lng: 106.651 },
  "Bình Phước": { lat: 11.532, lng: 106.884 },
  "Bà Rịa - Vũng Tàu": { lat: 10.496, lng: 107.170 },
};

export default function BanDoDacSan() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const rotationRequestRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const threeRendererRef = useRef(null);
  const threeSceneRef = useRef(null);

  // States
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePin, setActivePin] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState({ active: false, title: '', desc: '' });
  
  // 3D Showroom Modal
  const [showShowroom, setShowShowroom] = useState(false);
  const [showroomProduct, setShowroomProduct] = useState(null);

  // Fetch data from backend
  const { data: rawMapsData } = useQuery({
    queryKey: ['publicMaps'],
    queryFn: async () => {
      const response = await axiosClient.get('/bando?all=1');
      return response.data?.data || [];
    }
  });

  const { data: TinhThanh = [] } = useQuery({
    queryKey: ['tinhthanh'],
    queryFn: async () => {
      const response = await axiosClient.get('/tinh-thanh');
      return response.data?.data?.data || response.data?.data || response.data || [];
    },
    staleTime: 30000,
  });

  const { data: listPhanLoai = [] } = useQuery({
    queryKey: ['phanloai'],
    queryFn: async () => {
      const response = await axiosClient.get('/phan-loai');
      return response.data?.data || response.data || [];
    },
    staleTime: 30000,
  });

  const pins = rawMapsData || [];

  // Transform backend pins to frontend model
  const specialtyPins = useMemo(() => {
    return pins.map(item => {
      const provinceName = item.tinh_thanh?.TenTinhThanh || '';
      return {
        id: item.ID,
        lat: parseFloat(item.ViDo) || 0,
        lng: parseFloat(item.KinhDo) || 0,
        title: item.TenDacSan || '',
        desc: item.MoTa || '',
        category: item.PhanLoai || '',
        location: provinceName,
        thumb: item.HinhAnh ? `http://127.0.0.1:8000/storage/${item.HinhAnh}` : "https://via.placeholder.com/300x200?text=No+Image"
      };
    });
  }, [pins]);

  // Compute dynamic province flags
  const provinceFlags = useMemo(() => {
    const counts = {};
    specialtyPins.forEach(pin => {
      if (pin.location) {
        counts[pin.location] = (counts[pin.location] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([province, count], index) => {
      const coords = PROVINCE_COORDINATES[province] || { lat: 10.0, lng: 105.0 };
      return {
        id: index,
        lat: coords.lat,
        lng: coords.lng,
        province,
        count: `${count} đặc sản`
      };
    });
  }, [specialtyPins]);

  // Filter logic
  const filteredPins = useMemo(() => {
    return specialtyPins.filter(pin => {
      const matchSearch = pin.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pin.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Tất cả' || pin.category === selectedCategory;
      const matchProvince = selectedProvince === 'all' || pin.location.toLowerCase() === selectedProvince.toLowerCase();
      return matchSearch && matchCategory && matchProvince;
    });
  }, [specialtyPins, selectedCategory, selectedProvince, searchQuery]);

  // Show toast notification
  const triggerToast = (title, desc) => {
    setToast({ active: true, title, desc });
    setTimeout(() => {
      setToast(prev => ({ ...prev, active: false }));
    }, 3500);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [105.78, 10.03],
      zoom: 8.0,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add Satellite Imagery Source
      map.addSource('esri-satellite', {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256
      });
    });

    return () => {
      if (rotationRequestRef.current) cancelAnimationFrame(rotationRequestRef.current);
      map.remove();
    };
  }, []);

  // Update Satellite Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSatellite = () => {
      if (isSatellite) {
        if (!map.getLayer('satellite-layer')) {
          map.addLayer({
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            paint: { 'raster-opacity': 1.0 }
          });
          triggerToast("Bản đồ vệ tinh", "Đã chuyển sang góc nhìn vệ tinh độ nét cao.");
        }
      } else {
        if (map.getLayer('satellite-layer')) {
          map.removeLayer('satellite-layer');
          triggerToast("Bản đồ mặc định", "Đã quay lại bản đồ vector chuẩn.");
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateSatellite();
    } else {
      map.once('load', updateSatellite);
    }
  }, [isSatellite]);

  // Update Markers (Province Red Flags & Specialty Teardrops)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers by selecting elements with maplibre-marker class
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker, .maplibregl-marker');
    existingMarkers.forEach(el => el.remove());

    // 1. Add Province Red Flags
    provinceFlags.forEach(flag => {
      const el = document.createElement('div');
      el.className = 'province-marker-wrapper';
      
      el.innerHTML = `
        <div class="province-pulse"></div>
        <div class="province-capsule">
          <span class="province-capsule-icon">✨</span>
          <div class="province-capsule-info">
            <span class="province-capsule-name">${flag.province}</span>
            <span class="province-capsule-count">${flag.count}</span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedProvince(flag.province);
        map.flyTo({ center: [flag.lng, flag.lat], zoom: 9.5, duration: 1500 });
        triggerToast(flag.province, `Đang hiển thị danh mục sản vật tại ${flag.province}.`);
      });

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([flag.lng, flag.lat])
        .addTo(map);
    });

    // 2. Add Specialty Teardrop Pins
    filteredPins.forEach(pin => {
      const el = document.createElement('div');
      el.className = 'specialty-marker-container';
      
      el.innerHTML = `
        <div class="marker-dot"></div>
        <div class="marker-line"></div>
        <div class="marker-card">
          <div class="marker-teardrop">
            <div class="marker-thumb-wrapper">
              <img class="marker-thumb-img" src="${pin.thumb}" alt="${pin.title}" />
            </div>
          </div>
          <div class="marker-title-slide">
            <span class="marker-title-text">${pin.title}</span>
            <span class="marker-location-text">${pin.location}</span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActivePin(pin);
        map.flyTo({ center: [pin.lng, pin.lat], zoom: 11.5, duration: 1200 });
      });

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
    });

  }, [filteredPins, provinceFlags]);

  // Rotation effect
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const rotateCamera = (timestamp) => {
      if (!isRotating) return;
      // rotate at 1.5 degrees per frame
      map.rotateTo((map.getBearing() + 0.1) % 360, { duration: 0 });
      rotationRequestRef.current = requestAnimationFrame(rotateCamera);
    };

    if (isRotating) {
      triggerToast("Chế độ xoay", "Bản đồ đang tự động quay quanh góc nhìn.");
      rotationRequestRef.current = requestAnimationFrame(rotateCamera);
    } else {
      if (rotationRequestRef.current) {
        cancelAnimationFrame(rotationRequestRef.current);
      }
    }

    return () => {
      if (rotationRequestRef.current) cancelAnimationFrame(rotationRequestRef.current);
    };
  }, [isRotating]);

  // Helper Controls
  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;
    setIs3DMode(false);
    map.easeTo({ pitch: 0, bearing: 0, zoom: 8.0, center: [105.78, 10.03], duration: 1500 });
    triggerToast("Góc nhìn 2D", "Đã đặt lại góc nhìn phẳng 2D mặc định.");
  };

  const enable3D = () => {
    const map = mapRef.current;
    if (!map) return;
    setIs3DMode(true);
    map.easeTo({ pitch: 60, bearing: -20, zoom: 9.0, duration: 1500 });
    triggerToast("Góc nhìn 3D", "Đã nghiêng bản đồ 60 độ mô phỏng không gian 3D.");
  };

  const toggleSatellite = () => {
    setIsSatellite(prev => !prev);
  };

  const toggleRotation = () => {
    setIsRotating(prev => !prev);
  };

  // Close Popup
  const closeProductPopup = () => {
    setActivePin(null);
  };

  // Initialize and run Three.js Showroom
  useEffect(() => {
    if (!showShowroom || !threeCanvasRef.current) return;

    const container = threeCanvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    threeSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3e0, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 1, 10);
    pointLight.position.set(-2, 2, 2);
    scene.add(pointLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 20, 0x10b981, 0x374151);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Create a beautiful rotating geometry to represent the specialty
    let mesh;
    if (showroomProduct?.category === 'Trái cây') {
      // Orange/Mango sphere model
      const geometry = new THREE.DodecahedronGeometry(1.2, 1);
      const material = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.1,
        metalness: 0.1,
        flatShading: true
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (showroomProduct?.category === 'Bánh kẹo') {
      // Cylinder/Jar shape
      const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.2,
        metalness: 0.3
      });
      mesh = new THREE.Mesh(geometry, material);
    } else {
      // Box representing specialty packages
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const material = new THREE.MeshStandardMaterial({
        color: 0xa3432d,
        roughness: 0.4,
        metalness: 0.1
      });
      mesh = new THREE.Mesh(geometry, material);
    }

    mesh.position.y = 0.2;
    scene.add(mesh);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Animation Loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [showShowroom, showroomProduct]);

  // Open Showroom
  const openPinShowroom = () => {
    setShowroomProduct(activePin);
    setShowShowroom(true);
  };

  const closeShowroom = () => {
    setShowShowroom(false);
  };

  return (
    <main className="marketplace-map-page">
      {/* Hero Header */}
      <section 
        className="map-hero-marketplace" 
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bannerBg})` }}
      >
        <div className="hero-content">
          <h1 className="fade-in">Bản Đồ <span>Đặc Sản</span></h1>
          <p className="fade-in-delay">
            Hành trình khám phá tinh hoa ẩm thực và sản vật trù phú từ vùng đất chín rồng.
          </p>
          <button 
            className="btn-primary"
            onClick={() => document.getElementById('map-core')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Bắt đầu khám phá
          </button>
        </div>
      </section>

      {/* Main Core Map Area */}
      <section id="map-core">
        {/* Left Sidebar Filter Section */}
        <div className="map-left-sidebar">
          <div className="search-container-map">
            <input 
              type="text" 
              placeholder="Tìm kiếm đặc sản (ví dụ: Kẹo dừa, Xoài cát...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-section-marketplace">
            <div className="filter-header">
              <div className="filter-title">
                <h2><Filter size={20} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Bộ lọc</h2>
              </div>
              <div className="map-stats-bar">
                <span className="stat-item" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {filteredPins.length} sản vật
                </span>
              </div>
            </div>

            <div className="filter-grid">
              <div>
                <span className="filter-label">Loại đặc sản</span>
                <div className="specialty-tags">
                  <button 
                    className={`tag-btn ${selectedCategory === 'Tất cả' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Tất cả')}
                  >
                    Tất cả
                  </button>
                  {listPhanLoai.map(pl => (
                    <button 
                      key={pl.ID_PhanLoai || pl.id} 
                      className={`tag-btn ${selectedCategory === pl.TenLoai ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(pl.TenLoai)}
                    >
                      {pl.TenLoai}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="filter-label">Khu vực / Tỉnh thành</span>
                <select 
                  className="province-select" 
                  id="provinceSelect"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="all">Toàn miền Nam (Tất cả)</option>
                  {TinhThanh.map(tinh => (
                    <option key={tinh.ID_TinhThanh || tinh.id} value={tinh.TenTinhThanh}>
                      {tinh.TenTinhThanh}
                    </option>
                  ))}
                </select>
              </div>


            </div>
          </div>
        </div>

        {/* Mapbox Container */}
        <div id="specialty-map">
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Layer and Rotation Controls */}
          <div className="map-overlay-controls">
            <button 
              className={`map-ctrl-btn ${!is3DMode ? 'active' : ''}`} 
              id="btn-2d" 
              title="Góc nhìn 2D" 
              onClick={resetView}
            >
              <Layers size={18} />
            </button>
            <button 
              className={`map-ctrl-btn ${is3DMode ? 'active' : ''}`} 
              id="btn-3d" 
              title="Góc nhìn 3D" 
              onClick={enable3D}
            >
              <Box size={18} />
            </button>
            <button 
              className={`map-ctrl-btn ${isSatellite ? 'active' : ''}`} 
              id="btn-satellite" 
              title="Bản đồ Vệ tinh"
              onClick={toggleSatellite}
            >
              <Globe size={18} />
            </button>
            <button 
              className={`map-ctrl-btn ${isRotating ? 'active' : ''}`} 
              id="btn-rotate" 
              title="Xoay" 
              onClick={toggleRotation}
            >
              <RotateCw size={18} />
            </button>
          </div>

          {/* Premium Toast Notification */}
          <div id="map-toast" className={`map-toast ${toast.active ? 'active' : ''}`}>
            <span className="map-toast-icon">✨</span>
            <div class="map-toast-content">
              <span id="map-toast-title" className="map-toast-title">{toast.title}</span>
              <span id="map-toast-desc" className="map-toast-desc">{toast.desc}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Product Detail Card */}
      <div id="product-popup" className={`product-popup-card ${activePin ? 'active' : ''}`}>
        <button className="close-popup" onClick={closeProductPopup}>
          <X size={16} />
        </button>
        {activePin && (
          <>
            <img src={activePin.thumb} id="popup-img" className="popup-img" alt={activePin.title} />
            <div className="popup-content">
              <span id="popup-location" className="location">{activePin.location}</span>
              <h3 id="popup-title">{activePin.title}</h3>
              <p id="popup-desc">{activePin.desc}</p>
              <div className="popup-actions">
                <button className="btn-3d-popup" onClick={openPinShowroom}>XEM 3D</button>
                <button className="btn-buy" onClick={() => alert('Đã thêm vào giỏ hàng!')}>MUA NGAY</button>
                <button className="btn-story" onClick={() => window.location.href = `/stories?search=${encodeURIComponent(activePin.title)}`}>CÂU CHUYỆN</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3D Showroom Modal */}
      {showShowroom && (
        <div id="showroom-modal" className="active">
          <div className="showroom-container">
            <div className="showroom-ui">
              <h2 id="showroom-title">{showroomProduct?.title || 'Mini Showroom'}</h2>
              <p id="showroom-province">{showroomProduct?.location || 'Đặc sản Miền Nam'}</p>
            </div>
            <button className="close-showroom" onClick={closeShowroom}>
              <X size={24} />
            </button>
            <div id="three-canvas" ref={threeCanvasRef}></div>
            <div className="showroom-instruction">Kéo để xoay • Cuộn để phóng to</div>
          </div>
        </div>
      )}
    </main>
  );
}