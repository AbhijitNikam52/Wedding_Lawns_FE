import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBookingById } from "../../services/bookingService";
import BookingStatusBadge from "../../components/ui/BookingStatusBadge";
import Spinner from "../../components/ui/Spinner";

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingById(id)
      .then((d) => setBooking(d.booking))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!booking) return null;

  const lawn = booking.lawnId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full card text-center">
        {/* Icon */}
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-dark mb-2">Booking Request Sent!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your request has been sent to the lawn owner. You will be notified
          once they respond.
        </p>

        {/* Status */}
        <div className="mb-6">
          <BookingStatusBadge status={booking.status} size="md" />
        </div>

        {/* Booking details */}
        <div className="bg-purple-50 rounded-xl p-4 text-left space-y-3 mb-6">
          <Row label="Venue"       value={lawn?.name} />
          <Row label="City"        value={lawn?.city} />
          <Row label="Event Date"  value={new Date(booking.eventDate).toDateString()} />
          <Row label="Amount"      value={`₹${booking.totalAmount?.toLocaleString()}`} />
          <Row label="Booking ID"  value={booking._id} mono />
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/bookings/my" className="btn-primary py-2.5">
            View My Bookings
          </Link>
          <Link to="/lawns" className="btn-outline py-2.5">
            Browse More Lawns
          </Link>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, mono }) => (
  <div className="flex justify-between items-center text-sm py-1 border-b border-purple-100 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className={`font-medium text-dark text-right ml-4 ${mono ? "font-mono text-xs" : ""}`}>
      {value}
    </span>
  </div>
);

export default BookingConfirmationPage;