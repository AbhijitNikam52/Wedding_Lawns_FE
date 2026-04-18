import { useState, useEffect } from "react";
import { fetchOwnerBookings, updateBookingStatus } from "../../services/bookingService";
import BookingStatusBadge from "../../components/ui/BookingStatusBadge";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const OwnerBookingsPage = ({ embedded = false }) => {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("pending");
  const [actionId,   setActionId]   = useState(null); // booking being actioned

  const load = (status = filter) => {
    setLoading(true);
    fetchOwnerBookings(status === "all" ? "" : status)
      .then((d) => setBookings(d.bookings))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = async (bookingId, newStatus) => {
    let reason = "";
    if (newStatus === "cancelled") {
      reason = window.prompt("Reason for declining (optional):") || "";
      if (reason === null) return; // cancelled prompt
    }

    setActionId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus, reason);
      const msg = {
        confirmed: "✅ Booking confirmed! Date is now locked.",
        cancelled: "❌ Booking declined.",
        completed: "🎊 Booking marked as completed!",
      }[newStatus];
      toast.success(msg);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  const STATUS_FILTERS = ["pending", "confirmed", "cancelled", "completed", "all"];

  return (
    <div className={embedded ? "" : "max-w-5xl mx-auto px-4 py-10"}>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark">📋 Booking Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all booking requests for your lawns</p>
        </div>
      )}

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
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner text="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-purple-50 rounded-2xl">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-dark mb-2">
            No {filter === "all" ? "" : filter} bookings
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === "pending"
              ? "New booking requests will appear here."
              : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <OwnerBookingCard
              key={b._id}
              booking={b}
              onAction={handleAction}
              loading={actionId === b._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Owner Booking Card ────────────────────────────────────
const OwnerBookingCard = ({ booking, onAction, loading }) => {
  const lawn = booking.lawnId;
  const user = booking.userId;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Lawn photo */}
        <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
          {lawn?.photos?.[0] ? (
            <img src={lawn.photos[0]} alt={lawn.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🏡</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
            <div>
              <h3 className="font-bold text-dark">{lawn?.name}</h3>
              <p className="text-gray-400 text-xs font-mono">{booking._id}</p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Customer info */}
          <div className="bg-purple-50 rounded-lg p-3 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Detail label="👤 Customer"   value={user?.name} />
            <Detail label="📧 Email"      value={user?.email} />
            <Detail label="📞 Phone"      value={user?.phone || "—"} />
            <Detail label="👥 Guests"     value={booking.guestCount || "—"} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-sm">
            <Detail label="📅 Event Date"  value={new Date(booking.eventDate).toDateString()} />
            <Detail label="💰 Amount"      value={`₹${booking.totalAmount?.toLocaleString()}`} />
            <Detail label="🗓️ Requested"   value={new Date(booking.createdAt).toLocaleDateString()} />
          </div>

          {booking.specialRequests && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-yellow-700">
                <span className="font-semibold">Special Requests: </span>
                {booking.specialRequests}
              </p>
            </div>
          )}

          {booking.cancelReason && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-red-700">
                <span className="font-semibold">Cancellation Reason: </span>
                {booking.cancelReason}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {booking.status === "pending" && (
              <>
                <button
                  onClick={() => onAction(booking._id, "confirmed")}
                  disabled={loading}
                  className="text-sm bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? "..." : "✅ Accept"}
                </button>
                <button
                  onClick={() => onAction(booking._id, "cancelled")}
                  disabled={loading}
                  className="text-sm bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? "..." : "❌ Decline"}
                </button>
              </>
            )}

            {booking.status === "confirmed" && (
              <>
                <button
                  onClick={() => onAction(booking._id, "completed")}
                  disabled={loading}
                  className="text-sm bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? "..." : "🎊 Mark Completed"}
                </button>
                <button
                  onClick={() => onAction(booking._id, "cancelled")}
                  disabled={loading}
                  className="text-sm border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-all font-medium disabled:opacity-50"
                >
                  {loading ? "..." : "Cancel"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-dark break-all">{value}</p>
  </div>
);

export default OwnerBookingsPage;