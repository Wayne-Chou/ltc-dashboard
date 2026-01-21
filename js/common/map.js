// 地圖
const LOCATION_NAME_KEY_MAP = {
  "St Luke": "St Luke",
};

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: 25.038, lng: 121.5645 },
  });

  fetch("PageSiteAPI.json")
    .then((response) => response.json())
    .then((locations) => {
      const bounds = new google.maps.LatLngBounds();

      locations.forEach((loc) => {
        // console.log(loc);
        const position = new google.maps.LatLng(
          loc.LatLngCoordinate.Latitude,
          loc.LatLngCoordinate.Longitude,
        );
        const nameKey = LOCATION_NAME_KEY_MAP[loc.Name];

        // Marker
        new google.maps.Marker({
          position: position,
          map: map,
          title: tLocation(nameKey),
        });

        // OverlayView 顯示地區名稱 + Count
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
            this.div.style.background = "rgba(255,255,255,0.9)";
            this.div.style.padding = "4px 8px";
            this.div.style.border = "1px solid #333";
            this.div.style.borderRadius = "4px";
            this.div.style.fontSize = "14px";
            this.div.style.fontWeight = "bold";
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
              this.div.style.top = pos.y - 30 + "px";
            }
          }

          onRemove() {
            if (this.div) {
              this.div.parentNode.removeChild(this.div);
              this.div = null;
            }
          }
        }

        // 建立 overlay label
        // console.log("loc:", loc, "Count:", loc.Count);

        new LabelOverlay(
          position,
          `${tLocation(nameKey)}<br>${t("assessedCount")}: ${loc.Count}`,
          map,
        );

        bounds.extend(position);
      });

      map.fitBounds(bounds);
    })
    .catch((err) => console.error("讀取 JSON 錯誤:", err));
}
