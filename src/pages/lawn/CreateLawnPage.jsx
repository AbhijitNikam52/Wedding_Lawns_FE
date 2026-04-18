import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLawn } from "../../services/lawnService";
import PhotoUploader from "../../components/ui/PhotoUploader";
import toast from "react-hot-toast";

const AMENITY_OPTIONS = [
  "AC", "Parking", "Catering", "Generator",
  "Sound System", "Decoration", "Swimming", "Garden",
];

const CreateLawnPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:        "",
    city:        "",
    address:     "",
    capacity:    "",
    pricePerDay: "",
    description: "",
    amenities:   [],
  });
  const [createdLawnId, setCreatedLawnId] = useState(null); // set after lawn saved
  const [step,    setStep]    = useState(1); // step 1: details, step 2: photos
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleAmenity = (a) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));

  // ── Step 1: Save lawn details ────────────────────────────
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await createLawn({
        ...form,
        capacity:    Number(form.capacity),
        pricePerDay: Number(form.pricePerDay),
      });
      setCreatedLawnId(data.lawn._id);
      toast.success("Lawn details saved! Now add photos.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lawn");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Done (photos uploaded via PhotoUploader) ─────
  const handleFinish = () => {
    toast.success("Lawn listing created! Awaiting admin approval.");
    navigate("/dashboard/owner");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">🏡 List Your Lawn</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in your venue details — it will go live after admin approval.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Venue Details", "Upload Photos"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > i + 1
                ? "bg-green-500 text-white"
                : step === i + 1
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
            }`}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? "text-primary" : "text-gray-400"}`}>
              {label}
            </span>
            {i === 0 && <span className="text-gray-200 mx-1">——</span>}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Details form ── */}
      {step === 1 && (
        <form onSubmit={handleSaveDetails} className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lawn / Venue Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Royal Garden Lawn" className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input name="city" value={form.city} onChange={handleChange}
                placeholder="e.g. Pune" className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Capacity *</label>
              <input name="capacity" type="number" min="50" value={form.capacity}
                onChange={handleChange} placeholder="e.g. 500" className="input-field" required />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="Street, Area, City, PIN" className="input-field" required />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                <input name="pricePerDay" type="number" min="0" value={form.pricePerDay}
                  onChange={handleChange} placeholder="e.g. 75000"
                  className="input-field pl-8" required />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe your lawn — ambiance, surroundings, special features..."
                className="input-field resize-none" />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => {
                const active = form.amenities.includes(a);
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                    }`}>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Saving..." : "Save Details & Continue →"}
          </button>
        </form>
      )}

      {/* ── STEP 2: Photo upload ── */}
      {step === 2 && createdLawnId && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-lg font-bold text-dark mb-1">Upload Lawn Photos</h2>
            <p className="text-gray-500 text-sm">
              Add up to 10 photos. The first photo will be the cover image shown in search results.
            </p>
          </div>

          <PhotoUploader lawnId={createdLawnId} initialPhotos={[]} />

          <div className="flex gap-3 pt-2">
            <button onClick={handleFinish} className="btn-primary flex-1 py-3">
              ✅ Finish & Go to Dashboard
            </button>
            <button
              onClick={handleFinish}
              className="btn-outline px-6 py-3 text-sm"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLawnPage;