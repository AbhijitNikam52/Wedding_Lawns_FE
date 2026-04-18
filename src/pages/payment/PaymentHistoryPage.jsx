import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPaymentHistory } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/ui/Spinner";

const PaymentHistoryPage = () => {
  const { user }    = useAuth();
  const [payments,  setPayments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);

  useEffect(() => {
    fetchPaymentHistory()
      .then((d) => {
        setPayments(d.payments);
        setTotal(d.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isOwner = user?.role === "owner";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">
            💰 {isOwner ? "Earnings" : "Payment History"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isOwner
              ? "All payments received for your lawns"
              : "All your payment transactions"}
          </p>
        </div>

        {/* Total earnings card */}
        {payments.length > 0 && (
          <div className="bg-primary text-white rounded-xl px-6 py-3 text-center">
            <p className="text-xs opacity-80">{isOwner ? "Total Earned" : "Total Paid"}</p>
            <p className="text-2xl font-bold">₹{total.toLocaleString()}</p>
            <p className="text-xs opacity-70">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Spinner text="Loading payments..." />
      ) : payments.length === 0 ? (
        <EmptyState isOwner={isOwner} />
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <PaymentCard key={payment._id} payment={payment} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Payment Card ─────────────────────────────────────────
const PaymentCard = ({ payment, isOwner }) => {
  const booking = payment.bookingId;
  const lawn    = booking?.lawnId;
  const paidUser = booking?.userId;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Left info */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-bold text-dark">{lawn?.name}</h3>
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full border border-green-200">
              ✅ Success
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <Detail label="📅 Event Date"  value={new Date(booking.eventDate).toDateString()} />
            <Detail label="📍 City"        value={lawn?.city} />
            <Detail label="🗓️ Paid On"     value={new Date(payment.paidAt).toLocaleDateString()} />
            {isOwner && paidUser && (
              <Detail label="👤 Customer"  value={paidUser.name} />
            )}
            <Detail
              label="🔑 Payment ID"
              value={payment.razorpayPaymentId}
              mono
            />
          </div>
        </div>

        {/* Right amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-primary">
            ₹{payment.amount?.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">INR</p>
          <Link
            to={`/bookings/${booking._id}/confirmation`}
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            View Booking →
          </Link>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, mono }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className={`text-sm font-medium text-dark truncate ${mono ? "font-mono text-xs" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const EmptyState = ({ isOwner }) => (
  <div className="text-center py-20 bg-purple-50 rounded-2xl">
    <div className="text-5xl mb-4">💳</div>
    <h3 className="text-lg font-bold text-dark mb-2">No transactions yet</h3>
    <p className="text-gray-500 text-sm mb-6">
      {isOwner
        ? "Payments from your bookings will appear here."
        : "Your payment history will appear here after your first booking."}
    </p>
    {!isOwner && (
      <Link to="/lawns" className="btn-primary">
        Browse Lawns
      </Link>
    )}
  </div>
);

export default PaymentHistoryPage;