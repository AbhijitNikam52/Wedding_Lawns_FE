import { useEffect, useRef, useState } from "react";

/**
 * MapView — renders a Leaflet Map with a marker at the lawn location.
 *
 * Props:
 *   lat            — latitude number
 *   lng            — longitude number
 *   lawnName       — shown in the marker popup
 *   formattedAddress — shown below map
 *   height         — CSS height string (default "320px")
 */
const MapView = ({ lat, lng, lawnName, formattedAddress, height = "320px" }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(lawnName)}`;

    // Dynamically load Leaflet CDN assets
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

    // Initialize/Update Map
    useEffect(() => {
        if (!leafletLoaded || !mapRef.current || !lat || !lng || !window.L) return;

        // Clean up previous map instance
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        try {
            const L = window.L;

            // Set up map
            const map = L.map(mapRef.current).setView([lat, lng], 15);
            mapInstance.current = map;

            // OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // Custom Leaflet Icons from CDN to prevent Vite asset path bugs
            const customIcon = L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });

            // Add marker
            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            if (lawnName) {
                marker.bindPopup(`<b>${lawnName}</b><br/>${formattedAddress || ""}`).openPopup();
            }
        } catch (err) {
            console.error("Leaflet map initialization failed:", err);
            setErrored(true);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [leafletLoaded, lat, lng, lawnName, formattedAddress]);

    if (!lat || !lng) {
        return (
            <div
                style={{ height }}
                className="bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-200"
            >
                <span className="text-4xl mb-2">📍</span>
                <p className="text-sm">Location not available</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border border-purple-100 shadow-sm">
            {/* Map container */}
            <div className="relative" style={{ height }}>
                {/* Loading state */}
                {!leafletLoaded && !errored && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 animate-shimmer flex items-center justify-center z-[1000]">
                        <div className="text-center">
                            <div className="text-3xl mb-2">🗺️</div>
                            <p className="text-xs text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {errored ? (
                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 z-[1000]">
                        <span className="text-4xl mb-2">⚠️</span>
                        <p className="text-sm">Map could not load</p>
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 text-xs text-primary underline"
                        >
                            Open in Google Maps →
                        </a>
                    </div>
                ) : (
                    <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
                )}
            </div>

            {/* Footer bar */}
            <div className="bg-white px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="truncate">{lawnName}</span>
                    </p>
                    {formattedAddress && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{formattedAddress}</p>
                    )}
                </div>

                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all z-10"
                >
                    🗺️ Get Directions
                </a>
            </div>
        </div>
    );
};

export default MapView;