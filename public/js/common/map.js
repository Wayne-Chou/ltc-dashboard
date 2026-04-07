// js/common/initMap.js

// 用來存放所有的 marker 和 label，切換語系時才能清空
window.mapElements = window.mapElements || [];

function initMap() {
  if (!window.google || !google.maps) {
    console.warn("Google Maps 尚未載入，略過 initMap");
    return;
  }
  // --- 1. 清除地圖上現有的 Marker 和 Label ---
  if (window.mapElements.length > 0) {
    window.mapElements.forEach((item) => {
      if (item.setMap) item.setMap(null); // 清除 Google Marker 或 Overlay
    });
    window.mapElements = []; // 清空陣列
  }

  // --- 2. 定義標籤類別 ---
  class LabelOverlay extends google.maps.OverlayView {
    constructor(position, text, map) {
      super();
      this.position = position;
      this.text = text;
      this.map = map;
      this.div = null;
      this.setMap(map);
    }

    onAdd() {
      this.div = document.createElement("div");
      this.div.style.position = "absolute";
      this.div.style.background = "rgba(255,255,255,0.95)";
      this.div.style.padding = "6px 10px";
      this.div.style.border = "1px solid #333";
      this.div.style.borderRadius = "6px";
      this.div.style.fontSize = "13px";
      this.div.style.fontWeight = "bold";
      this.div.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.2)";
      this.div.style.whiteSpace = "nowrap";
      this.div.innerHTML = this.text;
      const panes = this.getPanes();
      panes.overlayLayer.appendChild(this.div);
    }

    draw() {
      const overlayProjection = this.getProjection();
      const pos = overlayProjection.fromLatLngToDivPixel(this.position);
      if (this.div) {
        this.div.style.left = pos.x + "px";
        this.div.style.top = pos.y - 45 + "px";
      }
    }

    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }
  }

  // --- 3. 初始化地圖實體 ---
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  // 建立地圖
  const map = new google.maps.Map(mapElement, {
    zoom: 12,
    center: { lat: 25.038, lng: 121.5645 },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  // --- 4. 畫 Marker 和 Label ---
  const bounds = new google.maps.LatLngBounds();

  // 確保 locationMap 存在
  if (typeof locationMap === "undefined" || !locationMap) return;

  Object.values(locationMap).forEach((loc) => {
    const position = new google.maps.LatLng(loc.lat, loc.lng);

    // 翻譯據點名稱
    const translatedName =
      typeof tLocation === "function" ? tLocation(loc.name) : loc.name;

    // Marker
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: translatedName,
    });
    window.mapElements.push(marker); // 紀錄以便之後清除

    // LabelOverlay
    // 翻譯「鑑測人數」與據點名
    const labelText = `
      <div style="text-align:center">
        <strong style="color:#2563eb">${translatedName}</strong><br>
        ${t("assessedCount")} <span style="color:red">${loc.Count}</span>
      </div>`;

    const label = new LabelOverlay(position, labelText, map);
    window.mapElements.push(label); // 紀錄以便之後清除

    bounds.extend(position);
  });

  // 自動縮放以包含所有據點
  if (Object.keys(locationMap).length > 0) {
    map.fitBounds(bounds);
  }
}

window.initMap = initMap;
