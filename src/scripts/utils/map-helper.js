/**
 * Map Helper Utility for Leaflet maps with multiple layers
 */
import { MAPTILER_API_KEY, MAP_DEFAULTS, MAP_STYLE_OPTIONS } from "./map-config.js";

/**
 * Load Leaflet CSS and JS if not already loaded
 */
const loadLeaflet = async () => {
  if (window.L) return Promise.resolve();

  if (!document.getElementById("leaflet-css")) {
    const leafletCss = document.createElement("link");
    leafletCss.id = "leaflet-css";
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    leafletCss.crossOrigin = "";
    document.head.appendChild(leafletCss);
  }

  return new Promise((resolve) => {
    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletScript.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    leafletScript.crossOrigin = "";
    leafletScript.onload = resolve;
    document.head.appendChild(leafletScript);
  });
};

/**
 * Load Leaflet.VectorGrid plugin for vector tile support
 */
const loadVectorGridPlugin = async () => {
  if (window.L && window.L.vectorGrid) return Promise.resolve();

  if (!window.L) {
    await loadLeaflet();
  }

  return new Promise((resolve) => {
    const vectorGridScript = document.createElement("script");
    vectorGridScript.src = "https://unpkg.com/leaflet.vectorgrid@latest/dist/Leaflet.VectorGrid.bundled.js";
    vectorGridScript.onload = resolve;
    document.head.appendChild(vectorGridScript);
  });
};

/**
 * Get available base map layers
 */
const getBaseLayers = () => {
  if (!window.L) {
    console.error("Leaflet is not loaded. Call loadLeaflet() first.");
    return {};
  }

  const openStreetMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: "OpenStreetMap",
  });

  const mapTilerStreets = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    name: "MapTiler Streets",
  });

  const mapTilerSatellite = L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`, {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    name: "MapTiler Satellite",
  });

  const mapTilerOutdoor = L.tileLayer(`https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`, {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    name: "MapTiler Outdoor",
  });

  const baseLayers = {
    OpenStreetMap: openStreetMap,
    Streets: mapTilerStreets,
    Satellite: mapTilerSatellite,
    Outdoor: mapTilerOutdoor,
  };

  let defaultLayer = openStreetMap;
  if (MAP_DEFAULTS.defaultLayer && baseLayers[MAP_DEFAULTS.defaultLayer]) {
    defaultLayer = baseLayers[MAP_DEFAULTS.defaultLayer];
  }

  return {
    baseLayers,
    defaultLayer,
  };
};

/**
 * Get vector tile layers
 */
const getVectorLayers = () => {
  if (!window.L || !window.L.vectorGrid) {
    console.error("Leaflet or VectorGrid plugin is not loaded. Call loadVectorGridPlugin() first.");
    return {};
  }

  const vectorBasic = L.vectorGrid.protobuf(`https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=${MAPTILER_API_KEY}`, {
    vectorTileLayerStyles: {},
    subdomains: "0123",
    maxNativeZoom: 14,
    maxZoom: 22,
    minZoom: 1,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  });

  const vectorTopo = L.vectorGrid.protobuf(`https://api.maptiler.com/tiles/v3-topo/{z}/{x}/{y}.pbf?key=${MAPTILER_API_KEY}`, {
    vectorTileLayerStyles: {},
    subdomains: "0123",
    maxNativeZoom: 14,
    maxZoom: 22,
    minZoom: 1,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
  });

  return {
    "Vector Basic": vectorBasic,
    "Vector Topo": vectorTopo,
  };
};

/**
 * Get standard Leaflet marker icon
 */
const getStandardMarkerIcon = () => {
  if (!window.L) {
    console.error("Leaflet is not loaded. Call loadLeaflet() first.");
    return null;
  }

  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

/**
 * Initialize a map with multiple layers and layer control
 */
const initMap = async (containerId, lat, lon, zoom = MAP_DEFAULTS.defaultZoom, includeVectorTiles = MAP_DEFAULTS.includeVectorTiles) => {
  await loadLeaflet();

  if (includeVectorTiles) {
    await loadVectorGridPlugin();
  }

  const mapContainer = document.getElementById(containerId);
  if (!mapContainer) {
    console.error(`Map container with ID '${containerId}' not found.`);
    return null;
  }

  const map = L.map(mapContainer).setView([lat, lon], zoom);
  const { baseLayers, defaultLayer } = getBaseLayers();
  defaultLayer.addTo(map);

  if (includeVectorTiles && window.L.vectorGrid) {
    const vectorLayers = getVectorLayers();
    L.control.layers(baseLayers, vectorLayers, { position: "topright" }).addTo(map);
  } else {
    L.control.layers(baseLayers, null, { position: "topright" }).addTo(map);
  }

  return map;
};

export default {
  loadLeaflet,
  loadVectorGridPlugin,
  getBaseLayers,
  getVectorLayers,
  getStandardMarkerIcon,
  initMap,
};
