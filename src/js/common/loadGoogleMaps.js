let googleMapsLoaderPromise = null;

export function loadGoogleMaps() {
  if (typeof window !== "undefined" && window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[data-google-maps-loader="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google Maps API 載入失敗")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyACfOxn7DJ9gdcb-XBx-R2X5pbHWeskzUg";
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google Maps API 載入失敗"));
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
}
