// src/js/common/viewBridge.js
/** 主畫面重繪（由 main.js register，供比較模式 / 語系等呼叫） */
let renderViewImpl = () => {};

export function registerRenderView(fn) {
  renderViewImpl = typeof fn === "function" ? fn : () => {};
}

export function renderView() {
  renderViewImpl();
}
