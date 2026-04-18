import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchBookingById } from "../../services/bookingService";
import Spinner from "../../components/ui/Spinner";

const PaymentSuccessPage = () => {
  const [params]  = useSearchParams();
  const bookingId = params.get("bookingId");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!bookingId);

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingById(bookingId)
      .then((d) => setBooking(d.booking))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <Spinner />;

  const lawn    = booking?.lawnId;
  const payment = booking?.paymentId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card text-center">
        {/* Animated checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">✅</span>
        </div>

        <h1 className="text-2xl font-bold text-dark mb-1">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your booking is confirmed and payment has been received.
          A receipt has been sent to your email.
        </p>

        {/* Booking details */}
        {booking && (
          <div className="bg-green-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <DetailRow label="Venue"       value={lawn?.name} />
            <DetailRow label="Event Date"  value={new Date(booking.eventDate).toDateString()} />
            <DetailRow label="Amount Paid" value={`₹${booking.totalAmount?.toLocaleString()}`} bold green />
            <DetailRow label="Booking ID"  value={booking._id} mono />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link to="/bookings/my" className="btn-primary py-2.5">
            View My Bookings
          </Link>
          <Link to="/payment/history" className="btn-outline py-2.5">
            Payment History
          </Link>
          <Link to="/lawns" className="text-sm text-gray-400 hover:text-primary transition-colors py-2">
            Browse More Lawns
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, mono, bold, green }) => (
  <div className="flex justify-between items-center text-sm py-1.5 border-b border-green-100 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className={`text-right ml-4 truncate max-w-[55%] ${mono ? "font-mono text-xs" : ""} ${bold ? "font-bold" : "font-medium"} ${green ? "text-green-600" : "text-dark"}`}>
      {value}
    </span>
  </div>
);

export default PaymentSuccessPage;