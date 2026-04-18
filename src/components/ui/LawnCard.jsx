import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

const AMENITY_ICONS = {
  AC:            "❄️",
  Parking:       "🚗",
  Catering:      "🍽️",
  Generator:     "⚡",
  "Sound System":"🔊",
  Decoration:    "🎊",
  Swimming:      "🏊",
  Garden:        "🌿",
};

const LawnCard = ({ lawn }) => {
  const {
    _id,
    name,
    city,
    address,
    capacity,
    pricePerDay,
    photos,
    amenities,
    rating,
  } = lawn;

  const thumbnail = photos?.[0] || null;

  return (
    <Link
      to={`/lawns/${_id}`}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100 group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden flex-shrink-0">
        <LazyImage
          src={thumbnail}
          alt={name}
          fallback="🏡"
          wrapperClass="w-full h-full"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-dark text-secondary text-xs font-bold px-3 py-1 rounded-full">
          ₹{pricePerDay?.toLocaleString()}/day
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name + Rating */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-dark text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
          {rating > 0 && (
            <span className="text-xs text-yellow-600 font-semibold flex-shrink-0 ml-2">
              ⭐ {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Location */}
        <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
          <span>📍</span>
          <span className="line-clamp-1">{city} — {address}</span>
        </p>

        {/* Capacity */}
        <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
          <span>👥</span>
          <span>Up to {capacity?.toLocaleString()} guests</span>
        </p>

        {/* Amenities */}
        {amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="text-xs bg-purple-50 text-primary px-2 py-0.5 rounded-full border border-purple-100"
              >
                {AMENITY_ICONS[a] || "✦"} {a}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="text-xs text-gray-400 px-1">
                +{amenities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4">
        <div className="w-full text-center bg-primary text-white text-sm font-semibold py-2 rounded-lg group-hover:bg-opacity-90 transition-all">
          View Details →
        </div>
      </div>
    </Link>
  );
};

export default LawnCard;