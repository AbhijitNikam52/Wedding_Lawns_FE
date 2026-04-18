import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchBookingById } from "../../services/bookingService";
import {
  createRazorpayOrder,
  verifyPayment,
  loadRazorpayScript,
  openRazorpayCheckout,
} from "../../services/paymentService";
import BookingStatusBadge from "../../components/ui/BookingStatusBadge";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const PaymentPage = () => {
  const { id }   = useParams(); // bookingId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking,   setBooking]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [paying,    setPaying]    = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  // Load booking details
  useEffect(() => {
    fetchBookingById(id)
      .then((d) => setBooking(d.booking))
      .catch(() => toast.error("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id]);

  // Preload Razorpay script
  useEffect(() => {
    loadRazorpayScript().then((ok) => {
      setScriptReady(ok);
      if (!ok) toast.error("Failed to load payment gateway. Please refresh.");
    });
  }, []);

  const handlePay = async () => {
    if (!scriptReady) return toast.error("Payment gateway not ready. Please refresh.");
    if (!booking)     return;

    setPaying(true);
    try {
      // 1. Create order on backend
      const orderData = await createRazorpayOrder(booking._id);

      // 2. Open Razorpay modal
      openRazorpayCheckout({
        order:       orderData.order,
        keyId:       orderData.keyId,
        bookingInfo: orderData.bookingInfo,
        user,
        onSuccess: async (paymentData) => {
          try {
            // 3. Verify signature on backend
            await verifyPayment(paymentData);
            toast.success("Payment successful! 🎉");
            navigate(`/payment/success?bookingId=${booking._id}`);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
            navigate(`/payment/failure?bookingId=${booking._id}`);
          }
        },
        onFailure: (err) => {
          toast.error(err.message || "Payment failed");
          setPaying(false);
          navigate(`/payment/failure?bookingId=${booking._id}`);
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
      setPaying(false);
    }
  };

  if (loading) return <Spinner text="Loading booking details..." />;
  if (!booking) return null;

  const lawn     = booking.lawnId;
  const alreadyPaid = !!booking.paymentId;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link to="/bookings/my" className="hover:text-primary">My Bookings</Link>
        <span>/</span>
        <span className="text-dark font-medium">Payment</span>
      </nav>

      <h1 className="text-2xl font-bold text-dark mb-2">💳 Complete Payment</h1>
      <p className="text-gray-500 text-sm mb-8">
        Review your booking and pay securely via Razorpay.
      </p>

      {/* Booking summary */}
      <div className="card mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
            {lawn?.photos?.[0] ? (
              <img src={lawn.photos[0]} alt={lawn.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🏡</div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-dark">{lawn?.name}</h3>
            <p className="text-gray-500 text-xs">📍 {lawn?.city}</p>
            <div className="mt-1">
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
          <Row label="Event Date"  value={new Date(booking.eventDate).toDateString()} />
          <Row label="Guests"      value={booking.guestCount || "—"} />
          <Row label="Booking ID"  value={booking._id} mono />
        </div>
      </div>

      {/* Amount summary */}
      <div className="card mb-6 bg-purple-50 border-purple-100">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Lawn booking</span>
          <span className="font-medium">₹{booking.totalAmount?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-600">Platform fee</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        <div className="flex justify-between font-bold text-dark border-t border-purple-200 pt-3">
          <span>Total Payable</span>
          <span className="text-primary text-xl">₹{booking.totalAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Already paid */}
      {alreadyPaid ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-bold text-green-700 mb-1">Already Paid</p>
          <p className="text-green-600 text-sm mb-4">
            This booking has been successfully paid.
          </p>
          <Link to="/bookings/my" className="btn-primary">
            View My Bookings
          </Link>
        </div>
      ) : booking.status !== "confirmed" ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <div className="text-4xl mb-2">⏳</div>
          <p className="font-bold text-yellow-700 mb-1">Booking Not Yet Confirmed</p>
          <p className="text-yellow-600 text-sm">
            Payment will be available once the owner confirms your booking.
          </p>
        </div>
      ) : (
        <>
          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={paying || !scriptReady}
            className="btn-primary w-full py-4 text-base mb-4 disabled:opacity-40"
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Opening Payment Gateway...
              </span>
            ) : (
              "💳 Pay ₹" + booking.totalAmount?.toLocaleString() + " Now"
            )}
          </button>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
            <span>🔒 256-bit SSL</span>
            <span>•</span>
            <span>🛡️ Razorpay Secured</span>
            <span>•</span>
            <span>🏦 RBI Compliant</span>
          </div>

          <p className="text-center text-xs text-gray-400">
            Supports UPI, Credit/Debit Cards, Net Banking & Wallets
          </p>
        </>
      )}
    </div>
  );
};

const Row = ({ label, value, mono }) => (
  <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className={`font-medium text-dark text-right ml-4 max-w-[60%] truncate ${mono ? "font-mono text-xs" : ""}`}>
      {value}
    </span>
  </div>
);

export default PaymentPage;