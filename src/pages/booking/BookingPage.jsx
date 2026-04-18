import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { fetchLawnById } from "../../services/lawnService";
import { createBooking } from "../../services/bookingService";
import { checkDate } from "../../services/availabilityService";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const BookingPage = () => {
  const { id }     = useParams();        // lawnId
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const dateParam  = params.get("date"); // pre-filled from LawnDetailPage

  const [lawn,    setLawn]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateOk,  setDateOk]  = useState(null); // null=checking, true=ok, false=unavailable

  const [form, setForm] = useState({
    guestCount:      "",
    specialRequests: "",
  });

  // Load lawn details
  useEffect(() => {
    fetchLawnById(id)
      .then((d) => setLawn(d.lawn))
      .catch(() => toast.error("Failed to load lawn"))
      .finally(() => setLoading(false));
  }, [id]);

  // Verify the date is still available
  useEffect(() => {
    if (!dateParam || !id) return;
    checkDate(id, dateParam)
      .then((d) => setDateOk(d.isAvailable))
      .catch(() => setDateOk(false));
  }, [id, dateParam]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateOk) return toast.error("This date is not available");

    setSubmitting(true);
    try {
      const data = await createBooking({
        lawnId:          id,
        eventDate:       dateParam,
        guestCount:      Number(form.guestCount) || 0,
        specialRequests: form.specialRequests,
      });
      toast.success("Booking request sent! 🎉");
      navigate(`/bookings/${data.booking._id}/confirmation`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Loading venue details..." />;
  if (!lawn)   return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link to="/lawns" className="hover:text-primary">Lawns</Link>
        <span>/</span>
        <Link to={`/lawns/${id}`} className="hover:text-primary truncate">{lawn.name}</Link>
        <span>/</span>
        <span className="text-dark font-medium">Book</span>
      </nav>

      <h1 className="text-2xl font-bold text-dark mb-2">📅 Confirm Your Booking</h1>
      <p className="text-gray-500 text-sm mb-8">
        Review the details below and submit your booking request.
      </p>

      {/* Lawn Summary Card */}
      <div className="card flex gap-4 mb-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
          {lawn.photos?.[0] ? (
            <img src={lawn.photos[0]} alt={lawn.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🏡</div>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-dark">{lawn.name}</h3>
          <p className="text-gray-500 text-sm">📍 {lawn.city}</p>
          <p className="text-gray-500 text-sm">👥 Up to {lawn.capacity?.toLocaleString()} guests</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-primary">₹{lawn.pricePerDay?.toLocaleString()}</p>
          <p className="text-xs text-gray-400">per day</p>
        </div>
      </div>

      {/* Date availability check */}
      {!dateParam ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-700 text-sm font-medium">
            ⚠️ No date selected.{" "}
            <Link to={`/lawns/${id}`} className="underline">
              Go back and pick a date from the calendar.
            </Link>
          </p>
        </div>
      ) : dateOk === false ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm font-medium">
            ❌ This date is no longer available. Please{" "}
            <Link to={`/lawns/${id}`} className="underline">
              choose a different date.
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-700 font-semibold text-sm">✅ Date Available</p>
              <p className="text-green-600 text-sm mt-0.5">
                {new Date(dateParam).toLocaleDateString("en-IN", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
            <Link to={`/lawns/${id}`} className="text-xs text-green-600 hover:underline">
              Change date
            </Link>
          </div>
        </div>
      )}

      {/* Booking form */}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Guest Count
          </label>
          <input
            type="number"
            name="guestCount"
            value={form.guestCount}
            onChange={handleChange}
            placeholder={`Max ${lawn.capacity?.toLocaleString()} guests`}
            min={1}
            max={lawn.capacity}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="specialRequests"
            value={form.specialRequests}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Need a stage, extra parking, specific setup..."
            className="input-field resize-none"
          />
        </div>

        {/* Price summary */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Lawn price</span>
            <span className="font-medium">₹{lawn.pricePerDay?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Platform fee</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between font-bold text-dark border-t border-purple-200 pt-3">
            <span>Total Amount</span>
            <span className="text-primary text-lg">₹{lawn.pricePerDay?.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * Payment will be collected after the owner confirms your booking.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !dateParam || dateOk === false}
          className="btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending Request..." : "Send Booking Request →"}
        </button>

        <p className="text-center text-xs text-gray-400">
          No payment charged now. You pay only after the owner confirms.
        </p>
      </form>
    </div>
  );
};

export default BookingPage;