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

  const [bookingItems, setBookingItems] = useState({
    venue: true,
    catering: false,
    decoration: false,
    selectedDecorations: [],
  });

  const calculateTotalPrice = () => {
    if (!lawn) return 0;
    let total = 0;
    if (bookingItems.venue) {
      total += lawn.pricePerDay || 0;
    }
    if (bookingItems.catering && lawn.catering?.available) {
      total += (lawn.catering.pricePerPlate || 0) * (Number(form.guestCount) || 0);
    }
    if (bookingItems.decoration && lawn.decoration?.available) {
      total += lawn.decoration.basePrice || 0;
      bookingItems.selectedDecorations.forEach((dName) => {
        const found = lawn.decoration.types?.find((t) => t.name === dName);
        if (found) {
          total += found.price || 0;
        }
      });
    }
    return total;
  };

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

    if (!bookingItems.venue && !bookingItems.catering && !bookingItems.decoration) {
      return toast.error("Please select at least one item (Venue, Catering, or Decoration) to book.");
    }

    setSubmitting(true);
    try {
      const data = await createBooking({
        lawnId:          id,
        eventDate:       dateParam,
        guestCount:      Number(form.guestCount) || 0,
        specialRequests: form.specialRequests,
        bookingItems:    bookingItems,
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

        {/* Booking Cart / Item Selection */}
        <div className="space-y-4 border-t border-purple-100 pt-4">
          <label className="block text-sm font-semibold text-dark">
            🛒 Customize Your Booking (Add/Remove items)
          </label>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Venue Item */}
            <div className={`p-4 rounded-xl border transition-all ${bookingItems.venue ? 'border-primary bg-purple-50/50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bookingItems.venue}
                    onChange={(e) => setBookingItems(p => ({ ...p, venue: e.target.checked }))}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                    id="item-venue"
                  />
                  <label htmlFor="item-venue" className="font-semibold text-sm text-dark cursor-pointer flex items-center gap-1.5 select-none">
                    🏡 Venue Rental (Lawn Hire)
                  </label>
                </div>
                <span className="text-sm font-bold text-dark">₹{lawn.pricePerDay?.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 pl-7">Full day exclusive access to the lawn & standard amenities.</p>
            </div>

            {/* Catering Item */}
            {lawn.catering?.available && (
              <div className={`p-4 rounded-xl border transition-all ${bookingItems.catering ? 'border-primary bg-purple-50/50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bookingItems.catering}
                      onChange={(e) => setBookingItems(p => ({ ...p, catering: e.target.checked }))}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                      id="item-catering"
                    />
                    <label htmlFor="item-catering" className="font-semibold text-sm text-dark cursor-pointer flex items-center gap-1.5 select-none">
                      🍽️ Catering Services
                    </label>
                  </div>
                  <span className="text-sm font-bold text-dark">
                    ₹{lawn.catering.pricePerPlate} / plate
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7 font-normal">
                  {lawn.catering.description || "In-house culinary service tailored to your guest size."}
                </p>
                {bookingItems.catering && (
                  <div className="mt-3 pl-7 bg-white p-3 rounded-lg border border-purple-100 text-xs text-gray-600 flex justify-between items-center">
                    <span>
                      Catering Cost ({Number(form.guestCount) || 0} guests × ₹{lawn.catering.pricePerPlate})
                    </span>
                    <span className="font-semibold text-primary">
                      ₹{((lawn.catering.pricePerPlate || 0) * (Number(form.guestCount) || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Decoration Item */}
            {lawn.decoration?.available && (
              <div className={`p-4 rounded-xl border transition-all ${bookingItems.decoration ? 'border-primary bg-purple-50/50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bookingItems.decoration}
                      onChange={(e) => setBookingItems(p => ({ ...p, decoration: e.target.checked }))}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                      id="item-decoration"
                    />
                    <label htmlFor="item-decoration" className="font-semibold text-sm text-dark cursor-pointer flex items-center gap-1.5 select-none">
                      🎊 Decoration Package (Base)
                    </label>
                  </div>
                  <span className="text-sm font-bold text-dark">₹{lawn.decoration.basePrice?.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-7">Standard flower arrangements, stage lighting, and main gate entry decor.</p>
                
                {/* Sub decorations options */}
                {bookingItems.decoration && lawn.decoration.types?.length > 0 && (
                  <div className="mt-3 pl-7 space-y-2 border-t border-purple-100 pt-3">
                    <p className="text-xs font-semibold text-dark">✨ Include Sub-Decorations:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {lawn.decoration.types.map((type) => {
                        const isSelected = bookingItems.selectedDecorations.includes(type.name);
                        return (
                          <div
                            key={type.name}
                            onClick={() => {
                              setBookingItems(p => ({
                                ...p,
                                selectedDecorations: isSelected
                                  ? p.selectedDecorations.filter(n => n !== type.name)
                                  : [...p.selectedDecorations, type.name]
                              }));
                            }}
                            className={`flex justify-between items-center px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected ? 'bg-purple-100/50 border-primary text-primary font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'
                            }`}
                          >
                            <span className="capitalize">{type.name}</span>
                            <span>+₹{type.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
          {bookingItems.venue && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Lawn price (Venue rent)</span>
              <span className="font-medium">₹{lawn.pricePerDay?.toLocaleString()}</span>
            </div>
          )}
          {bookingItems.catering && lawn.catering?.available && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Catering ({Number(form.guestCount) || 0} guests)</span>
              <span className="font-medium">₹{((lawn.catering.pricePerPlate || 0) * (Number(form.guestCount) || 0)).toLocaleString()}</span>
            </div>
          )}
          {bookingItems.decoration && lawn.decoration?.available && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Base Decoration</span>
              <span className="font-medium">₹{lawn.decoration.basePrice?.toLocaleString()}</span>
            </div>
          )}
          {bookingItems.decoration && bookingItems.selectedDecorations.length > 0 && (
            <div className="flex justify-between text-sm mb-2 pl-3 border-l-2 border-purple-200">
              <span className="text-gray-500 text-xs">Add-ons ({bookingItems.selectedDecorations.join(", ")})</span>
              <span className="font-medium text-xs text-gray-600">
                +₹{bookingItems.selectedDecorations.reduce((sum, dName) => {
                  const found = lawn.decoration.types?.find(t => t.name === dName);
                  return sum + (found?.price || 0);
                }, 0).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">Platform fee</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between font-bold text-dark border-t border-purple-200 pt-3">
            <span>Total Amount</span>
            <span className="text-primary text-lg">₹{calculateTotalPrice().toLocaleString()}</span>
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