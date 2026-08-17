import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Filter, Layers, Box, Globe, RotateCw, X, Heart, MapPin, Package, ShoppingCart, ArrowRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import bannerBg from '../../assets/bannermap.webp';
import './Bando.css'
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
const MERGER_GROUPS = {
  "TP. Hồ Chí Minh": {
    name: "Thành phố Hồ Chí Minh",
    constituents: ["TP. Hồ Chí Minh", "Thành phố Hồ Chí Minh", "Bà Rịa - Vũng Tàu", "Bình Dương"],
    geojsonNames: ["HồChíMinh", "BàRịa-VũngTàu", "BìnhDương"],
    color: "#ff4d4d",
    center: { lat: 10.776, lng: 106.701 } 
  },
  "Đồng Nai": {
    name: "Tỉnh Đồng Nai",
    constituents: ["Đồng Nai", "Bình Phước"],
    geojsonNames: ["ĐồngNai", "BìnhPhước"],
    color: "#ff9f43",
    center: { lat: 10.957, lng: 106.842 }
  },
  "Tây Ninh": {
    name: "Tỉnh Tây Ninh",
    constituents: ["Tây Ninh", "Long An"],
    geojsonNames: ["TâyNinh", "LongAn"],
    color: "#10b981",
    center: { lat: 10.538, lng: 106.413 }
  },
  "Cần Thơ": {
    name: "Thành phố Cần Thơ",
    constituents: ["Cần Thơ", "TP. Cần Thơ", "Sóc Trăng", "Hậu Giang"],
    geojsonNames: ["CầnThơ", "SócTrăng", "HậuGiang"],
    color: "#2e86de",
    center: { lat: 10.036, lng: 105.787 } 
  },
  "Vĩnh Long": {
    name: "Tỉnh Vĩnh Long",
    constituents: ["Vĩnh Long", "Bến Tre", "Trà Vinh"],
    geojsonNames: ["VĩnhLong", "BếnTre", "TràVinh"],
    color: "#ff9ff3",
    center: { lat: 10.252, lng: 105.972 }
  },
  "Đồng Tháp": {
    name: "Tỉnh Đồng Tháp",
    constituents: ["Đồng Tháp", "Tiền Giang"],
    geojsonNames: ["ĐồngTháp", "TiềnGiang"],
    color: "#00d2d3",
    center: { lat: 10.449, lng: 106.341 } 
  },
  "Cà Mau": {
    name: "Tỉnh Cà Mau",
    constituents: ["Cà Mau", "Bạc Liêu"],
    geojsonNames: ["CàMau", "BạcLiêu"],
    color: "#ee5253",
    center: { lat: 9.176, lng: 105.152 }
  },
  "An Giang": {
    name: "Tỉnh An Giang",
    constituents: ["An Giang", "Kiên Giang"],
    geojsonNames: ["AnGiang", "KiênGiang"],
    color: "#5f27cd",
    center: { lat: 9.982, lng: 105.124 }
  }
};

const FRIENDLY_NAMES = {
  "TP. Hồ Chí Minh": "Thành phố Hồ Chí Minh",
  "Đồng Nai": "Tỉnh Đồng Nai",
  "Tây Ninh": "Tỉnh Tây Ninh",
  "Cần Thơ": "Thành phố Cần Thơ",
  "Vĩnh Long": "Tỉnh Vĩnh Long",
  "Đồng Tháp": "Tỉnh Đồng Tháp",
  "Cà Mau": "Tỉnh Cà Mau",
  "An Giang": "Tỉnh An Giang"
};
export default function BanDoDacSan() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const rotationRequestRef = useRef(null);

 
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePin, setActivePin] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const [ranhGioiData, setRanhGioiData] = useState(null);
  useEffect(() => {
    fetch('/RanhGioi.json')
      .then(res => res.json())
      .then(data => setRanhGioiData(data))
      .catch(err => console.error("Error loading boundary data:", err));
  }, []);

 
  const [toast, setToast] = useState({ active: false, title: '', desc: '' });
  const [showShowroom, setShowShowroom] = useState(false);
  const [showroomProduct, setShowroomProduct] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const handleOpenStory = async (pin) => {
    setLoadingStory(true);
    try {
      const response = await axiosClient.get(`/Cauchuyensanvat/${pin.ID_TinhThanh}`);
      const blogsList = response.data?.data || [];
      const matchingBlog = blogsList.find(blog => {
        const blogTitle = blog.tittel.toLowerCase();
        const specialtyTitle = pin.title.toLowerCase();
        return blogTitle.includes(specialtyTitle) || specialtyTitle.includes(blogTitle);
      });

      if (matchingBlog) {
        navigate(`/blogs/${matchingBlog.ID_Blog || matchingBlog.id}`);
      } else {
        alert("Sản vật này hiện tại chưa có câu chuyện chi tiết!");
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      alert("Đã xảy ra lỗi khi tìm câu chuyện. Vui lòng thử lại sau!");
    } finally {
      setLoadingStory(false);
    }
  };

  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX || e.touches?.[0]?.clientX || 0;
    startAngleRef.current = rotationAngle;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const deltaX = clientX - startXRef.current;
    setRotationAngle(startAngleRef.current + deltaX * 0.01);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    setZoomScale(prev => {
      const next = prev - e.deltaY * 0.001;
      return Math.min(Math.max(0.5, next), 2.0);
    });
  };
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
  const specialtyPins = useMemo(() => {
    const pins = rawMapsData || [];
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    return pins.map(item => {
      const provinceName = item.tinh_thanh?.TenTinhThanh || '';
      
      let thumbImg = "https://via.placeholder.com/300x200?text=No+Image";
      if (item.HinhAnh) {
        try {
          const parsed = JSON.parse(item.HinhAnh);
          if (Array.isArray(parsed) && parsed.length > 0) {
            thumbImg = `${backendUrl}/storage/${parsed[0]}`;
          } else {
            thumbImg = `${backendUrl}/storage/${item.HinhAnh}`;
          }
        } catch (e) {
          if (item.HinhAnh.startsWith('http')) {
            thumbImg = item.HinhAnh;
          } else {
            thumbImg = `${backendUrl}/storage/${item.HinhAnh}`;
          }
        }
      }

      return {
        id: item.ID,
        ID_TinhThanh: item.ID_TinhThanh,
        lat: parseFloat(item.ViDo) || 0,
        lng: parseFloat(item.KinhDo) || 0,
        title: item.TenDacSan || '',
        desc: item.MoTa || '',
        category: item.PhanLoai || '',
        location: provinceName,
        detailedLocation: [item.ap?.Ten_ap, item.xa?.Ten_xa].filter(Boolean).join(', ') || provinceName,
        thumb: thumbImg
      };
    });
  }, [rawMapsData]);
  const provinceFlags = useMemo(() => {
    const counts = {};
    const thumbMap = {};
    specialtyPins.forEach(pin => {
      if (pin.location) {
        counts[pin.location] = (counts[pin.location] || 0) + 1;
        if (!thumbMap[pin.location]) thumbMap[pin.location] = pin.thumb;
      }
    });

    return Object.entries(counts).map(([province, count], index) => {
      const group = MERGER_GROUPS[province];
      const coords = group ? group.center : (PROVINCE_COORDINATES[province] || { lat: 10.0, lng: 105.0 });
      const color = group ? group.color : '#10b981';
      const provinceInfo = TinhThanh.find(t => t.TenTinhThanh === province);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
      const thumb = provinceInfo?.HinhAnh
        ? (provinceInfo.HinhAnh.startsWith('http') ? provinceInfo.HinhAnh : `${backendUrl}/storage/${provinceInfo.HinhAnh}`)
        : (thumbMap[province] || 'https://via.placeholder.com/150');
      return {
        id: index,
        lat: coords.lat,
        lng: coords.lng,
        province,
        color,
        thumb,
        count: `${count} đặc sản`
      };
    });
  }, [specialtyPins, TinhThanh]);
  const filteredPins = useMemo(() => {
    return specialtyPins.filter(pin => {
      const matchSearch = pin.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pin.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Tất cả' || pin.category === selectedCategory;
      const matchProvince = selectedProvince === 'all' || pin.location.toLowerCase() === selectedProvince.toLowerCase();
      return matchSearch && matchCategory && matchProvince;
    });
  }, [specialtyPins, selectedCategory, selectedProvince, searchQuery]);
  const provinceSpecialties = useMemo(() => {
    if (!showroomProduct) return [];
    if (showroomProduct.isProvince) {
      return specialtyPins.filter(pin => {
        const pinLoc = pin.location.toLowerCase().replace(/\s+/g, '');
        const provName = showroomProduct.province.toLowerCase().replace(/\s+/g, '');
        return pinLoc.includes(provName) || provName.includes(pinLoc);
      });
    }
    return [showroomProduct];
  }, [showroomProduct, specialtyPins]);
  useEffect(() => {
    if (!showShowroom || provinceSpecialties.length <= 1) return;

    let reqId;
    const animate = () => {
      if (!isDraggingRef.current) {
        setRotationAngle(prev => prev + 0.0035);
      }
      reqId = requestAnimationFrame(animate);
    };
    reqId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(reqId);
    };
  }, [showShowroom, provinceSpecialties]);
  const triggerToast = (title, desc) => {
    setToast({ active: true, title, desc });
    setTimeout(() => {
      setToast(prev => ({ ...prev, active: false }));
    }, 3500);
  };
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
      // Thêm nguồn hình ảnh vệ tinh
      map.addSource('esri-satellite', {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256
      });
      map.addSource('province-boundaries', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
      map.addLayer({
        id: 'province-boundaries-fill',
        type: 'fill',
        source: 'province-boundaries',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.15
        }
      });
      map.addLayer({
        id: 'province-boundaries-line',
        type: 'line',
        source: 'province-boundaries',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5
        }
      });
    });
    return () => {
      if (rotationRequestRef.current) cancelAnimationFrame(rotationRequestRef.current);
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updateBoundaries = () => {
      const source = map.getSource('province-boundaries');
      if (!source) return;
      if (!ranhGioiData) return;
      let features = [];
      if (selectedProvince === 'all') {
        features = [];
      } else {
        const group = MERGER_GROUPS[selectedProvince];
        if (group) {
          const activeGeojsonNames = group.geojsonNames;
          const boundaryColor = group.color;
          map.flyTo({
            center: [group.center.lng, group.center.lat],
            zoom: 9.2,
            duration: 1500
          });

          triggerToast(group.name, `Hiển thị ranh giới khu vực sáp nhập ${group.name}.`);

          ranhGioiData.features.forEach(f => {
            const name1 = f.properties.NAME_1;
            if (activeGeojsonNames.some(gn => gn.toLowerCase() === name1.toLowerCase())) {
              features.push({
                ...f,
                properties: {
                  ...f.properties,
                  color: boundaryColor
                }
              });
            }
          });
        }
      }

      source.setData({
        type: 'FeatureCollection',
        features: features
      });
    };

    if (map.isStyleLoaded()) {
      updateBoundaries();
    } else {
      map.once('load', updateBoundaries);
    }
  }, [selectedProvince, ranhGioiData]);
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
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker, .maplibregl-marker');
    existingMarkers.forEach(el => el.remove());
    provinceFlags.forEach(flag => {
      const el = document.createElement('div');
      // anchor:'bottom' → MapLibre ghim bottom-center của el vào tọa độ
      // Wrapper có chiều cao cố định, không dùng CSS transform trên chính nó
      el.className = 'prov-marker-wrap';

      el.innerHTML = `
        <div class="prov-marker">
          <div class="prov-marker-label">
            <span class="prov-marker-name" style="color: ${flag.color}">${flag.province}</span>
            <span class="prov-marker-count">${flag.count}</span>
            <div class="prov-marker-bar" style="background:${flag.color}"></div>
          </div>
          <div class="prov-marker-pin" style="--c:${flag.color}">
            <div class="prov-marker-img-wrap">
              <img src="${flag.thumb}" alt="${flag.province}" class="prov-marker-img" />
            </div>
          </div>
          <div class="prov-marker-rings" style="--c:${flag.color}">
            <span class="prov-ring r1"></span>
            <span class="prov-ring r2"></span>
            <span class="prov-ring r3"></span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedProvince(flag.province);
        setIs3DMode(false);
        map.flyTo({ 
          center: [flag.lng, flag.lat], 
          zoom: 9.5, 
          pitch: 0,
          bearing: 0,
          duration: 1500 
        });
        triggerToast(flag.province, `Đang hiển thị danh mục sản vật tại ${flag.province} dưới dạng 2D.`);
        setShowroomProduct({
          title: flag.province,
          location: 'Đặc sản',
          isProvince: true,
          province: flag.province
        });
        setShowShowroom(true);
      });

      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([flag.lng, flag.lat])
        .addTo(map);
    });
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
            <span class="marker-location-text">${pin.detailedLocation}</span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActivePin(pin);
        map.flyTo({ center: [pin.lng, pin.lat], zoom: 11.5, duration: 1200 });
      });

      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
    });

  }, [filteredPins, provinceFlags]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const rotateCamera = () => {
      if (!isRotating) return;
      // rotate at 1.5 degrees per frame
      map.rotateTo((map.getBearing() + 0.1) % 360, { duration: 0 });
      rotationRequestRef.current = requestAnimationFrame(rotateCamera);
    };

    if (isRotating) {
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
    setIsRotating(prev => {
      const next = !prev;
      if (next) {
        triggerToast("Chế độ xoay", "Bản đồ đang tự động quay quanh góc nhìn.");
      }
      return next;
    });
  };
  const closeProductPopup = () => {
    setActivePin(null);
  };
  const closeShowroom = () => {
    setShowShowroom(false);
    setRotationAngle(0);
    setZoomScale(1);
  };

  return (
    <main className="marketplace-map-page">
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

      <section id="map-core">
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
                <select 
                  className="province-select" 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Tất cả">Tất cả</option>
                  {listPhanLoai.map(pl => (
                    <option key={pl.ID_PhanLoai || pl.id} value={pl.TenLoai}>
                      {pl.TenLoai}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="filter-label">Khu vực / Tỉnh thành (Đã sáp nhập)</span>
                <select 
                  className="province-select" 
                  id="provinceSelect"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="all">Toàn miền Nam (Tất cả)</option>
                  {TinhThanh.map(tinh => (
                    <option key={tinh.ID_TinhThanh || tinh.id} value={tinh.TenTinhThanh}>
                      {FRIENDLY_NAMES[tinh.TenTinhThanh] || tinh.TenTinhThanh}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-results-list" style={{ marginTop: '20px', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', paddingRight: '5px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-color)' }}>Danh sách kết quả ({filteredPins.length})</h3>
              {filteredPins.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredPins.map(pin => (
                    <div 
                      key={pin.id} 
                      className="result-item" 
                      onClick={() => {
                        const map = mapRef.current;
                        if (map) {
                          map.flyTo({ center: [pin.lng, pin.lat], zoom: 11.5, duration: 1200 });
                          setActivePin(pin);
                        }
                      }}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '12px', 
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <img 
                        src={pin.thumb} 
                        alt={pin.title} 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a' }}>{pin.title}</h4>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#64748b' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '6px' }}></span>
                          {pin.detailedLocation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                  <p>Không tìm thấy sản vật nào phù hợp.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div id="specialty-map">
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
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
          <div id="map-toast" className={`map-toast ${toast.active ? 'active' : ''}`}>
            <span className="map-toast-icon">✨</span>
            <div class="map-toast-content">
              <span id="map-toast-title" className="map-toast-title">{toast.title}</span>
              <span id="map-toast-desc" className="map-toast-desc">{toast.desc}</span>
            </div>
          </div>
        </div>
      </section>
      <div id="product-popup" className={`product-popup-card ${activePin ? 'active' : ''}`}>
        <button className="close-popup" onClick={closeProductPopup}>
          <X size={16} />
        </button>
        {activePin && (
          <>
            <img src={activePin.thumb} id="popup-img" className="popup-img" alt={activePin.title} />
            <div className="popup-content">
              <span id="popup-location" className="location">{activePin.detailedLocation}</span>
              <h3 id="popup-title">{activePin.title}</h3>
              <p id="popup-desc">{activePin.desc}</p>
              <div className="popup-actions">
                <button className="btn-buy" onClick={() => navigate(`/products?search=${encodeURIComponent(activePin.title)}`)}>MUA NGAY</button>
                <button 
                  className="btn-story" 
                  disabled={loadingStory} 
                  onClick={() => handleOpenStory(activePin)}
                >
                  {loadingStory ? 'ĐANG TÌM...' : 'CÂU CHUYỆN'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
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
            
            <div 
              className="css-3d-scene" 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              onWheel={handleWheel}
            >
              <div 
                className="css-3d-carousel"
                style={{
                  transform: `translateZ(-200px) rotateY(${rotationAngle}rad) scale(${zoomScale})`,
                }}
              >
                {provinceSpecialties.map((pin, i) => {
                  const angle = (i / provinceSpecialties.length) * Math.PI * 2;
                  const radius = provinceSpecialties.length > 1 ? 280 : 0;
                  return (
                    <div 
                      key={pin.id || i}
                      className="css-3d-card redesigned"
                      style={{
                        transform: `rotateY(${angle}rad) translateZ(${radius}px)`,
                      }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/products?search=${encodeURIComponent(pin.title)}`); closeShowroom(); }}
                    >
                      <div className="card-image-wrap-new">
                        <img src={pin.thumb} alt={pin.title} />
                      </div>
                      <div className="card-body-new">
                        <h3 className="card-title-new">{pin.title}</h3>
                        <div className="card-divider-new"></div>
                        <div className="card-loc-item">
                          <MapPin size={16} color="#c0392b" />
                          <span>Tỉnh: {pin.location}</span>
                        </div>
                        <div className="card-loc-item">
                          <Home size={16} color="#c0392b" />
                          <span>Xã/Phường: {pin.detailedLocation}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="showroom-instruction">Kéo để xoay • Cuộn để phóng to</div>
          </div>
        </div>
      )}
    </main>
  );
}