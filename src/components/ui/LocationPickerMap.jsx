import { useEffect, useRef, useState } from "react";

/**
 * LocationPickerMap — renders a Leaflet Map with a draggable marker to select/refine location.
 *
 * Props:
 *   lat            — latitude number (null if not set)
 *   lng            — longitude number (null if not set)
 *   onChange       — callback called with { lat, lng } when marker is dragged or map is clicked
 *   lawnName       — name of the lawn (for display)
 *   height         — CSS height string (default "300px")
 */
const LocationPickerMap = ({
    lat,
    lng,
    onChange,
    lawnName = "My Lawn Venue",
    height = "320px",
}) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    // Default center (India center if coordinates not set)
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    // Dynamically load Leaflet CDN assets (same as MapView.jsx)
    useEffect(() => {
        // Load CSS
        let link = document.getElementById("leaflet-css");
        if (!link) {
            link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        // Load JS
        let script = document.getElementById("leaflet-js");
        if (!script) {
            script = document.createElement("script");
            script.id = "leaflet-js";
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => setLeafletLoaded(true);
            script.onerror = () => setErrored(true);
            document.body.appendChild(script);
        } else {
            if (window.L) {
                setLeafletLoaded(true);
            } else {
                const handleScriptLoad = () => setLeafletLoaded(true);
                const handleScriptError = () => setErrored(true);

                script.addEventListener("load", handleScriptLoad);
                script.addEventListener("error", handleScriptError);

                return () => {
                    script.removeEventListener("load", handleScriptLoad);
                    script.removeEventListener("error", handleScriptError);
                };
            }
        }
    }, []);

    // Initialize map once Leaflet is loaded
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || !window.L) return;

        // Clean up previous map instance
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
            markerInstance.current = null;
        }

        try {
            const L = window.L;

            const initialLat = lat || defaultCenter[0];
            const initialLng = lng || defaultCenter[1];
            const initialZoom = lat && lng ? 15 : defaultZoom;

            // Set up map
            const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);
            mapInstance.current = map;

            // OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // Custom icon definition (to prevent bundling asset path issues)
            const customIcon = L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });

            // If coordinates are set, place the marker
            if (lat && lng) {
                const marker = L.marker([lat, lng], {
                    icon: customIcon,
                    draggable: true,
                }).addTo(map);
                
                marker.bindPopup(`<b>${lawnName}</b><br/>Drag me to adjust location!`).openPopup();
                markerInstance.current = marker;

                // Event: Drag marker
                marker.on("dragend", () => {
                    const pos = marker.getLatLng();
                    onChange?.({ lat: pos.lat, lng: pos.lng });
                });
            }

            // Event: Click map (moves/creates marker)
            map.on("click", (e) => {
                const { lat: clickLat, lng: clickLng } = e.latlng;
                
                if (markerInstance.current) {
                    markerInstance.current.setLatLng([clickLat, clickLng]);
                } else {
                    const marker = L.marker([clickLat, clickLng], {
                        icon: customIcon,
                        draggable: true,
                    }).addTo(map);
                    
                    marker.bindPopup(`<b>${lawnName}</b><br/>Drag me to adjust location!`).openPopup();
                    markerInstance.current = marker;

                    marker.on("dragend", () => {
                        const pos = marker.getLatLng();
                        onChange?.({ lat: pos.lat, lng: pos.lng });
                    });
                }
                
                onChange?.({ lat: clickLat, lng: clickLng });
            });

        } catch (err) {
            console.error("Leaflet map initialization failed:", err);
            setErrored(true);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                markerInstance.current = null;
            }
        };
    }, [leafletLoaded]);

    // Update marker position and map center when props change (from external source, e.g., Autocomplete)
    useEffect(() => {
        if (!mapInstance.current || !lat || !lng || !window.L) return;

        const L = window.L;
        const currentCenter = mapInstance.current.getCenter();
        
        // If center is significantly different, pan map
        if (Math.abs(currentCenter.lat - lat) > 0.0001 || Math.abs(currentCenter.lng - lng) > 0.0001) {
            mapInstance.current.setView([lat, lng], 15);
        }

        const customIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });

        if (markerInstance.current) {
            markerInstance.current.setLatLng([lat, lng]);
        } else {
            const marker = L.marker([lat, lng], {
                icon: customIcon,
                draggable: true,
            }).addTo(mapInstance.current);
            
            marker.bindPopup(`<b>${lawnName}</b><br/>Drag me to adjust location!`).openPopup();
            markerInstance.current = marker;

            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                onChange?.({ lat: pos.lat, lng: pos.lng });
            });
        }
    }, [lat, lng, lawnName]);

    return (
        <div className="rounded-xl overflow-hidden border border-purple-100 shadow-sm bg-white">
            <div className="relative" style={{ height }}>
                {/* Loading state */}
                {!leafletLoaded && !errored && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 animate-shimmer flex items-center justify-center z-[1000]">
                        <div className="text-center">
                            <div className="text-3xl mb-2">🗺️</div>
                            <p className="text-xs text-gray-400">Loading map picker...</p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {errored && (
                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 z-[1000]">
                        <span className="text-4xl mb-2">⚠️</span>
                        <p className="text-sm">Map could not load</p>
                    </div>
                )}

                <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
            </div>

            {/* Hint / Helper Footer */}
            <div className="bg-purple-50 px-4 py-2 flex items-center justify-between gap-2 border-t border-purple-100">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                    <span>📍</span>
                    <span>
                        {lat && lng 
                            ? `Pinned: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
                            : "Click anywhere on the map or search address to pin venue location"
                        }
                    </span>
                </p>
                {lat && lng && (
                    <span className="text-[10px] bg-purple-200 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Drag Pin to Adjust
                    </span>
                )}
            </div>
        </div>
    );
};

export default LocationPickerMap;
