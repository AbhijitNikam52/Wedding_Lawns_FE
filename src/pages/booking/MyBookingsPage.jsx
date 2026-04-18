import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMyBookings, updateBookingStatus } from "../../services/bookingService";
import BookingStatusBadge from "../../components/ui/BookingStatusBadge";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [cancelling, setCancelling] = useState(null); // bookingId being cancelled

  const load = () => {
    setLoading(true);
    fetchMyBookings()
      .then((d) => setBookings(d.bookings))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Reason for cancellation (optional):");
    if (reason === null) return; // user clicked Cancel on prompt

    setCancelling(bookingId);
    try {
      await updateBookingStatus(bookingId, "cancelled", reason);
      toast.success("Booking cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(null);
    }
  };

  const STATUS_FILTERS = ["all", "pending", "confirmed", "cancelled", "completed"];

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">📅 My Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track all your venue booking requests
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all capitalize ${
              filter === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {s}
            {s === "all" && ` (${bookings.length})`}
            {s !== "all" && ` (${bookings.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Spinner text="Loading bookings..." />
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancelling === booking._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Booking Card ─────────────────────────────────────────
const BookingCard = ({ booking, onCancel, cancelling }) => {
  const lawn  = booking.lawnId;
  const canCancel = ["pending", "confirmed"].includes(booking.status);

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Lawn thumbnail */}
        <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
          {lawn?.photos?.[0] ? (
            <img src={lawn.photos[0]} alt={lawn.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🏡</div>
          )}
        </div>

        {/* Details */}
        <div className="flex-grow">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
            <div>
              <h3 className="font-bold text-dark">{lawn?.name}</h3>
              <p className="text-gray-500 text-xs">📍 {lawn?.city}</p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 text-sm mb-3">
            <Info label="Event Date"  value={new Date(booking.eventDate).toDateString()} />
            <Info label="Amount"      value={`₹${booking.totalAmount?.toLocaleString()}`} />
            <Info label="Guests"      value={booking.guestCount || "—"} />
            <Info label="Booked On"   value={new Date(booking.createdAt).toLocaleDateString()} />
            {booking.cancelReason && (
              <Info label="Reason" value={booking.cancelReason} className="col-span-2" />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/bookings/${booking._id}/confirmation`}
              className="text-xs text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all font-medium"
            >
              View Details
            </Link>

            {booking.status === "confirmed" && !booking.paymentId && (
              <Link
                to={`/bookings/${booking._id}/pay`}
                className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all font-medium"
              >
                💳 Pay Now
              </Link>
            )}

            {booking.paymentId && (
              <Link
                to="/payment/history"
                className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all font-medium"
              >
                🧾 View Receipt
              </Link>
            )}

            {canCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                disabled={cancelling}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-dark">{value}</p>
  </div>
);

const EmptyState = ({ filter }) => (
  <div className="text-center py-20 bg-purple-50 rounded-2xl">
    <div className="text-5xl mb-4">📋</div>
    <h3 className="text-lg font-bold text-dark mb-2">
      No {filter === "all" ? "" : filter} bookings yet
    </h3>
    <p className="text-gray-500 text-sm mb-6">
      {filter === "all"
        ? "Start by browsing available wedding lawns."
        : `You have no ${filter} bookings.`}
    </p>
    {filter === "all" && (
      <Link to="/lawns" className="btn-primary">
        Browse Lawns
      </Link>
    )}
  </div>
);

export default MyBookingsPage;