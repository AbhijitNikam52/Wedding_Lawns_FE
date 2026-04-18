import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchLawnById } from "../../services/lawnService";
import { useAuth } from "../../context/AuthContext";
import AvailabilityCalendar from "../../components/ui/AvailabilityCalendar";
import LazyImage     from "../../components/ui/LazyImage";
import SkeletonDetail from "../../components/ui/SkeletonDetail";

const AMENITY_ICONS = {
  AC: "❄️", Parking: "🚗", Catering: "🍽️", Generator: "⚡",
  "Sound System": "🔊", Decoration: "🎊", Swimming: "🏊", Garden: "🌿",
};

const LawnDetailPage = () => {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [lawn,      setLawn]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [photoIdx,  setPhotoIdx]  = useState(0);
  const [notFound,  setNotFound]  = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLawnById(id);
        setLawn(data.lawn);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <SkeletonDetail />;

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center">
        <div className="text-5xl mb-4">🏚️</div>
        <h2 className="text-xl font-bold text-dark mb-2">Lawn Not Found</h2>
        <p className="text-gray-500 mb-4">This venue may have been removed.</p>
        <Link to="/lawns" className="btn-primary">Browse All Lawns</Link>
      </div>
    </div>
  );

  const photos = lawn.photos?.length ? lawn.photos : [];
  const owner  = lawn.ownerId;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/lawns" className="hover:text-primary">Browse Lawns</Link>
        <span>/</span>
        <span className="text-dark font-medium truncate">{lawn.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Photos + Details ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Photo Gallery */}
          <div className="rounded-2xl overflow-hidden bg-purple-50">
            {photos.length > 0 ? (
              <>
                {/* Main photo */}
                <div className="relative h-80 sm:h-96">
                  <LazyImage
                    src={photos[photoIdx]}
                    alt={`${lawn.name} photo ${photoIdx + 1}`}
                    wrapperClass="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-all"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-all"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        {photoIdx + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {photos.map((ph, i) => (
                      <img
                        key={i}
                        src={ph}
                        alt={`thumb ${i + 1}`}
                        onClick={() => setPhotoIdx(i)}
                        className={`h-16 w-24 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-all ${
                          i === photoIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-8xl">🏡</div>
            )}
          </div>

          {/* Lawn Info */}
          <div className="card">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-dark">{lawn.name}</h1>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <span>📍</span> {lawn.address}, {lawn.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ₹{lawn.pricePerDay?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">per day</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-4">
              <Stat icon="👥" label="Capacity" value={`${lawn.capacity?.toLocaleString()} guests`} />
              <Stat icon="📍" label="City"     value={lawn.city} />
              {lawn.rating > 0 && (
                <Stat icon="⭐" label="Rating" value={`${lawn.rating.toFixed(1)} / 5`} />
              )}
            </div>

            {/* Description */}
            {lawn.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-dark mb-2">About this venue</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{lawn.description}</p>
              </div>
            )}

            {/* Amenities */}
            {lawn.amenities?.length > 0 && (
              <div>
                <h3 className="font-semibold text-dark mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {lawn.amenities.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 text-sm bg-purple-50 text-primary px-3 py-1.5 rounded-full border border-purple-100 font-medium"
                    >
                      {AMENITY_ICONS[a] || "✦"} {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Booking & Owner Card ── */}
        <div className="space-y-5">

          {/* Book / Chat CTA Card */}
          <div className="card sticky top-24">
            <div className="text-center mb-5">
              <p className="text-3xl font-bold text-primary">
                ₹{lawn.pricePerDay?.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">per day</p>
            </div>

            {isAuthenticated && user?.role === "user" ? (
              <div className="space-y-4">
                {/* Availability Calendar */}
                <div>
                  <p className="text-sm font-semibold text-dark mb-2">
                    📅 Select Your Event Date
                  </p>
                  <AvailabilityCalendar
                    lawnId={id}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>

                {selectedDate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-green-700">
                      ✅ Selected: {new Date(selectedDate).toDateString()}
                    </p>
                  </div>
                )}

                <button
                  onClick={() =>
                    selectedDate &&
                    navigate(`/lawns/${id}/book?date=${selectedDate}`)
                  }
                  disabled={!selectedDate}
                  className="btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedDate ? "Book This Date →" : "Select a Date Above"}
                </button>

                <Link
                  to={`/chat/${id}`}
                  className="btn-outline w-full py-2.5 text-sm text-center block"
                >
                  💬 Chat with Owner
                </Link>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-3">
                <Link to="/login" className="btn-primary w-full py-3 text-base text-center block">
                  Login to Book
                </Link>
                <p className="text-center text-xs text-gray-400">
                  <Link to="/register" className="text-primary hover:underline">
                    Create an account
                  </Link>{" "}
                  to book this venue
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-3">
                Switch to a customer account to make bookings.
              </p>
            )}
          </div>

          {/* Owner Info Card */}
          {owner && (
            <div className="card">
              <h3 className="font-semibold text-dark mb-3">🏡 Venue Owner</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {owner.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-dark text-sm">{owner.name}</p>
                  <p className="text-gray-400 text-xs">{owner.email}</p>
                </div>
              </div>
              {owner.phone && (
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  📞 {owner.phone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div className="text-center">
    <div className="text-xl mb-0.5">{icon}</div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-dark">{value}</p>
  </div>
);

export default LawnDetailPage;