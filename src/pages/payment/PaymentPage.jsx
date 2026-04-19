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
  const [paymentMode,   setPaymentMode]   = useState("full"); // "full" or "advance"
  const [advanceAmount, setAdvanceAmount] = useState("");

  // Load booking details
  useEffect(() => {
    fetchBookingById(id)
      .then((d) => {
        setBooking(d.booking);
        // Robust remaining calculation: use remainingAmount if it's a number, else fallback to totalAmount
        const rem = typeof d.booking.remainingAmount === 'number' 
          ? d.booking.remainingAmount 
          : d.booking.totalAmount;
        setAdvanceAmount(Math.round(rem * 0.25).toString());
      })
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

  const remaining = typeof booking?.remainingAmount === 'number' 
    ? booking.remainingAmount 
    : (booking?.totalAmount || 0);
  
  const isPaid    = booking?.paymentStatus === "paid";
  
  const currentPayAmount = paymentMode === "full" 
    ? remaining 
    : Number(advanceAmount) || 0;

  const handlePay = async () => {
    if (!scriptReady) return toast.error("Payment gateway not ready. Please refresh.");
    if (!booking)     return;

    if (paymentMode === "advance") {
      if (currentPayAmount <= 0) return toast.error("Please enter a valid amount");
      if (currentPayAmount > remaining) return toast.error(`Amount cannot exceed ₹${remaining.toLocaleString()}`);
    }

    setPaying(true);
    try {
      // 1. Create order on backend (passing the specific amount)
      const orderData = await createRazorpayOrder(booking._id, currentPayAmount);

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
          // navigate(`/payment/failure?bookingId=${booking._id}`);
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
      setPaying(false);
    }
  };

  if (loading) return <Spinner text="Loading booking details..." />;
  if (!booking) return null;

  const lawn = booking.lawnId;

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
            <div className="mt-1 flex gap-2">
              <BookingStatusBadge status={booking.status} />
              {booking.paymentStatus === "partial" && (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Partially Paid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
          <Row label="Event Date"  value={new Date(booking.eventDate).toDateString()} />
          <Row label="Total Amount" value={`₹${booking.totalAmount?.toLocaleString()}`} />
          {booking.paidAmount > 0 && (
            <Row label="Already Paid" value={`₹${booking.paidAmount?.toLocaleString()}`} />
          )}
          <Row label="Booking ID"  value={booking._id} mono />
        </div>
      </div>

      {/* Payment Selection */}
      {!isPaid && booking.status === "confirmed" && (
        <div className="card mb-6 space-y-4">
          <label className="block text-sm font-bold text-dark mb-3">Select Payment Option</label>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMode("full")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMode === "full" 
                  ? "border-primary bg-purple-50" 
                  : "border-gray-100 hover:border-purple-200"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">Full Payment</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMode === "full" ? "border-primary" : "border-gray-300"
                }`}>
                  {paymentMode === "full" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </div>
              <p className="text-primary font-bold text-lg">₹{remaining.toLocaleString()}</p>
            </button>

            <button
              onClick={() => setPaymentMode("advance")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMode === "advance" 
                  ? "border-primary bg-purple-50" 
                  : "border-gray-100 hover:border-purple-200"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">Advance Booking</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMode === "advance" ? "border-primary" : "border-gray-300"
                }`}>
                  {paymentMode === "advance" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </div>
              <p className="text-gray-500 text-xs">Custom amount</p>
            </button>
          </div>

          {paymentMode === "advance" && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Enter Advance Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="Min ₹1"
                  max={remaining}
                  className="input-field pl-8 font-bold text-lg text-primary"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Pay a partial amount now to secure your booking. Remaining balance can be paid later.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Amount summary */}
      <div className="card mb-6 bg-purple-50 border-purple-100 shadow-sm">
        <div className="flex justify-between text-base mb-2">
          <span className="text-gray-600">Amount Just Paying</span>
          <span className="font-bold text-dark">₹{currentPayAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">Remaining after this</span>
          <span className="font-medium text-red-500">₹{(remaining - currentPayAmount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-dark border-t border-purple-200 pt-3">
          <span className="text-lg">Total Payable Now</span>
          <span className="text-primary text-2xl">₹{currentPayAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Already paid */}
      {isPaid ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-5xl mb-3">✨</div>
          <p className="font-bold text-green-700 text-xl mb-1">Fully Paid</p>
          <p className="text-green-600 text-sm mb-6">
            Everything is set! Your booking is fully paid.
          </p>
          <Link to="/bookings/my" className="btn-primary w-full py-3">
            View My Bookings
          </Link>
        </div>
      ) : booking.status !== "confirmed" ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">⏳</div>
          <p className="font-bold text-yellow-700 text-xl mb-1">Waiting for Confirmation</p>
          <p className="text-yellow-600 text-sm">
            The owner needs to confirm your booking before you can pay.
          </p>
        </div>
      ) : (
        <>
          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={paying || !scriptReady || currentPayAmount <= 0}
            className="btn-primary w-full py-4 text-lg font-bold mb-6 shadow-lg shadow-purple-200 disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {paying ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Initiating Secured Payment...
              </span>
            ) : (
              `💳 Pay ₹${currentPayAmount.toLocaleString()} Securely`
            )}
          </button>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-gray-400 mb-6 uppercase font-bold tracking-widest">
            <span className="flex items-center gap-1">🔒 SSL Secure</span>
            <span className="flex items-center gap-1">🛡️ Razorpay</span>
            <span className="flex items-center gap-1">🏦 RBI Verified</span>
          </div>

          <p className="text-center text-xs text-gray-400 bg-gray-50 py-3 rounded-lg border border-gray-100">
            UPI • Cards • Net Banking • Wallets
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