// src/js/common/map.js
import { t, tLocation } from "./locale.js";
import { getLocationMap } from "./location.js";

// 用來存放所有的 marker 和 label，切換語系時才能清空
let mapElements = [];

/**
 * 自定義標籤類別 (LabelOverlay)
 */
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
    this.div.style.zIndex = "1000";
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

/**
 * 初始化地圖
 */
export function initMap() {
  const mapElement = document.getElementById("map");

  // 檢查 google 是否存在，防止 API 尚未載入就執行
  if (!mapElement || typeof google === "undefined") {
    console.warn("[Map] Google Maps API 尚未載入完成");
    return;
  }

  // --- 1. 清除地圖上現有的 Marker 和 Label ---
  if (mapElements.length > 0) {
    mapElements.forEach((item) => {
      if (item.setMap) item.setMap(null);
    });
    mapElements = [];
  }

  // --- 2. 初始化地圖實體 ---
  const map = new google.maps.Map(mapElement, {
    zoom: 12,
    center: { lat: 25.038, lng: 121.5645 },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  // --- 3. 畫 Marker 和 Label ---
  const bounds = new google.maps.LatLngBounds();

  const locData = getLocationMap();
  if (!locData) {
    console.log("[Map] 尚無據點資料可顯示");
    return;
  }

  Object.values(locData).forEach((loc) => {
    const position = new google.maps.LatLng(loc.lat, loc.lng);

    // 翻譯據點名稱
    const translatedName = tLocation(loc.name) || loc.name;

    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: translatedName,
    });
    mapElements.push(marker);

    const labelText = `
      <div style="text-align:center">
        <strong style="color:#2563eb">${translatedName}</strong><br>
        ${t("assessedCount")} <span style="color:red">${loc.Count}</span>
      </div>`;

    const label = new LabelOverlay(position, labelText, map);
    mapElements.push(label);

    bounds.extend(position);
  });

  // 自動縮放至合適範圍
  if (Object.keys(locData).length > 0) {
    map.fitBounds(bounds);
  }
}

// ================================================================
// 🛠️ 核心修正：掛載與自動執行補救
// ================================================================

/**
 * 補救機制：
 * 雖然 HTML 裡寫了 callback=initMap，但如果 API 載入太快，
 * 當時這個模組還沒執行完，Google Maps 就會報 "initMap is not a function"。
 * 下面這段程式會在模組載入完後檢查，如果 google 已存在，就手動跑一次。
 */
if (typeof google !== "undefined" && google.maps) {
  initMap();
}
