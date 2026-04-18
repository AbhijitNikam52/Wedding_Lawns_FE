import { useEffect, useRef, useState } from "react";

/**
 * MapView — renders a Google Maps iframe with a marker at the lawn location.
 *
 * Props:
 *   lat            — latitude number
 *   lng            — longitude number
 *   lawnName       — shown in the marker popup
 *   formattedAddress — shown below map
 *   height         — CSS height string (default "320px")
 */
const MapView = ({ lat, lng, lawnName, formattedAddress, height = "320px" }) => {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);
    const iframeRef = useRef(null);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Build the embed URL — Google Maps Embed API (free, no billing required for basic embed)
    const embedUrl = apiKey
        ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`
        : null;

    // Fallback: static map image (no JS API needed)
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x320&markers=color:purple%7C${lat},${lng}&key=${apiKey}`;

    // Google Maps directions URL (opens in Maps app on mobile)
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(lawnName)}`;

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
            {/* Map */}
            <div className="relative" style={{ height }}>
                {/* Loading shimmer */}
                {!loaded && !errored && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 animate-shimmer flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-3xl mb-2">🗺️</div>
                            <p className="text-xs text-gray-400">Loading map...</p>
                        </div>
                    </div>
                )}

                {/* Google Maps Embed iframe */}
                {embedUrl && !errored ? (
                    <iframe
                        ref={iframeRef}
                        title={`Map — ${lawnName}`}
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, display: loaded ? "block" : "none" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={() => setLoaded(true)}
                        onError={() => setErrored(true)}
                    />
                ) : (
                    /* Fallback: static map image */
                    <img
                        src={staticMapUrl}
                        alt={`Map of ${lawnName}`}
                        className="w-full h-full object-cover"
                        onLoad={() => setLoaded(true)}
                        onError={() => setErrored(true)}
                    />
                )}

                {/* Error state */}
                {errored && (
                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
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
                    className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
                >
                    🗺️ Get Directions
                </a>
            </div>
        </div>
    );
};

export default MapView;