import { useEffect, useRef, useState } from "react";

/**
 * AddressAutocomplete
 *
 * Input field with Google Places Autocomplete.
 * When user selects a suggestion it returns:
 *   { address, city, lat, lng, formattedAddress }
 *
 * Props:
 *   value       — current address string
 *   onChange    — called with new address string (for controlled input)
 *   onSelect    — called with { address, city, lat, lng, formattedAddress }
 *   placeholder — input placeholder
 *   required    — HTML required attribute
 */
const AddressAutocomplete = ({
    value,
    onChange,
    onSelect,
    placeholder = "Enter full address",
    required = false,
}) => {
    const inputRef = useRef(null);
    const autoRef = useRef(null); // Google Autocomplete instance
    const [ready, setReady] = useState(false);

    // Load Google Maps Places library dynamically
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn("VITE_GOOGLE_MAPS_API_KEY not set — autocomplete disabled");
            return;
        }

        // If already loaded
        if (window.google?.maps?.places) {
            setReady(true);
            return;
        }

        // Inject script once
        const scriptId = "google-maps-script";
        if (document.getElementById(scriptId)) {
            // Script injected but not loaded yet — wait
            const interval = setInterval(() => {
                if (window.google?.maps?.places) {
                    setReady(true);
                    clearInterval(interval);
                }
            }, 200);
            return () => clearInterval(interval);
        }

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&region=IN&language=en`;
        script.async = true;
        script.defer = true;
        script.onload = () => setReady(true);
        document.head.appendChild(script);
    }, []);

    // Attach Autocomplete once Google API is ready
    useEffect(() => {
        if (!ready || !inputRef.current) return;

        autoRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["establishment", "geocode"],
            componentRestrictions: { country: "in" }, // restrict to India
            fields: ["formatted_address", "geometry", "name", "address_components"],
        });

        autoRef.current.addListener("place_changed", () => {
            const place = autoRef.current.getPlace();
            if (!place.geometry) return; // user typed and pressed Enter without selecting

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            // Extract city from address components
            let city = "";
            for (const comp of place.address_components || []) {
                if (comp.types.includes("locality")) {
                    city = comp.long_name;
                    break;
                }
                if (comp.types.includes("administrative_area_level_2")) {
                    city = comp.long_name; // fallback
                }
            }

            const address = place.formatted_address;

            // Update the controlled input value
            onChange?.(address);

            // Call parent with full location data
            onSelect?.({ address, city, lat, lng, formattedAddress: address });
        });
    }, [ready]);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="input-field pr-10"
                autoComplete="off"
            />
            {/* Pin icon */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                📍
            </span>
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ VITE_GOOGLE_MAPS_API_KEY not set — type address manually
                </p>
            )}
        </div>
    );
};

export default AddressAutocomplete;