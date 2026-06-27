import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLawn } from "../../services/lawnService";
import PhotoUploader from "../../components/ui/PhotoUploader";
import AddressAutocomplete from "../../components/ui/AddressAutocomplete";
import LocationPickerMap from "../../components/ui/LocationPickerMap";
import toast from "react-hot-toast";

const AMENITY_OPTIONS = [
  "AC", "Parking", "Catering", "Generator",
  "Sound System", "Decoration", "Swimming", "Garden",
];

const CreateLawnPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    capacity: "",
    pricePerDay: "",
    description: "",
    amenities: [],
    catering: {
      available: false,
      pricePerPlate: "",
      description: "",
    },
    decoration: {
      available: false,
      basePrice: "",
      types: [],
    },
    location: {
      lat: null,
      lng: null,
      formattedAddress: "",
    }
  });
  const [createdLawnId, setCreatedLawnId] = useState(null); // set after lawn saved
  const [step, setStep] = useState(1); // step 1: details, step 2: photos
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
        capacity: Number(form.capacity),
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
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1
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
              <AddressAutocomplete
                value={form.address}
                onChange={(val) => setForm((p) => ({ ...p, address: val }))}
                onSelect={({ address, city, lat, lng }) => {
                  setForm((p) => ({
                    ...p,
                    address,
                    city: city || p.city,
                    location: {
                      lat,
                      lng,
                      formattedAddress: address,
                    }
                  }));
                }}
                placeholder="Start typing the lawn address..."
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Select from the dropdown for automatic map location detection.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">🗺️ Venue Location Pin (Leaflet Map)</label>
              <p className="text-xs text-gray-500 mb-2">
                Verify your location on the map below. You can also click anywhere on the map or drag the pin to set the exact coordinates.
              </p>
              <LocationPickerMap
                lat={form.location?.lat}
                lng={form.location?.lng}
                lawnName={form.name || "My Wedding Lawn"}
                onChange={({ lat, lng }) => {
                  setForm((p) => ({
                    ...p,
                    location: {
                      ...p.location,
                      lat,
                      lng,
                    }
                  }));
                }}
              />
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
            <div className="flex flex-wrap gap-2 mb-3">
              {form.amenities.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className="text-sm px-3 py-1.5 rounded-full border font-medium bg-primary text-white border-primary transition-all"
                >
                  {a}
                </button>
              ))}
              {AMENITY_OPTIONS.filter(o => !form.amenities.includes(o)).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className="text-sm px-3 py-1.5 rounded-full border font-medium bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary transition-all"
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Custom Amenities */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Custom Amenity</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Helipad, Valet Parking"
                  className="input-field max-w-xs"
                  id="custom-amenity-input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val && !form.amenities.includes(val)) {
                        setForm(p => ({ ...p, amenities: [...p.amenities, val] }));
                        e.target.value = "";
                        toast.success(`Amenity "${val}" added!`);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-outline px-4 py-2"
                  onClick={() => {
                    const input = document.getElementById("custom-amenity-input");
                    const val = input.value.trim();
                    if (val && !form.amenities.includes(val)) {
                      setForm(p => ({ ...p, amenities: [...p.amenities, val] }));
                      input.value = "";
                      toast.success(`Amenity "${val}" added!`);
                    }
                  }}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Catering Services (Optional) */}
          <div className="border-t border-purple-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-md font-semibold text-dark">🍽️ Catering Service (Optional)</h3>
                <p className="text-xs text-gray-400">Offer catering directly from your venue</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.catering.available}
                  onChange={(e) => setForm(p => ({
                    ...p,
                    catering: { ...p.catering, available: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {form.catering.available && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price Per Plate (₹) *</label>
                  <input
                    type="number"
                    value={form.catering.pricePerPlate}
                    onChange={(e) => setForm(p => ({
                      ...p,
                      catering: { ...p.catering, pricePerPlate: Number(e.target.value) || "" }
                    }))}
                    placeholder="e.g. 500"
                    className="input-field bg-white"
                    required={form.catering.available}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Catering Description / Menu Summary</label>
                  <textarea
                    value={form.catering.description}
                    onChange={(e) => setForm(p => ({
                      ...p,
                      catering: { ...p.catering, description: e.target.value }
                    }))}
                    placeholder="e.g. Includes Veg/Non-Veg buffets, starters, desserts..."
                    className="input-field bg-white resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Decoration Services (Optional) */}
          <div className="border-t border-purple-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-md font-semibold text-dark">🎊 Decoration Service (Optional)</h3>
                <p className="text-xs text-gray-400">Offer decoration packages and sub-decorations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.decoration.available}
                  onChange={(e) => setForm(p => ({
                    ...p,
                    decoration: { ...p.decoration, available: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {form.decoration.available && (
              <div className="space-y-4 mt-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Base Decoration Price (₹) *</label>
                  <input
                    type="number"
                    value={form.decoration.basePrice}
                    onChange={(e) => setForm(p => ({
                      ...p,
                      decoration: { ...p.decoration, basePrice: Number(e.target.value) || "" }
                    }))}
                    placeholder="e.g. 25000"
                    className="input-field bg-white"
                    required={form.decoration.available}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sub-Decorations (e.g. foams, fires, horses, etc.)</label>
                  
                  {/* Dynamic sub-decorations list */}
                  {form.decoration.types.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {form.decoration.types.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-purple-100 text-sm">
                          <span className="font-medium text-dark">{t.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-bold">₹{t.price}</span>
                            <button
                              type="button"
                              onClick={() => setForm(p => ({
                                ...p,
                                decoration: {
                                  ...p.decoration,
                                  types: p.decoration.types.filter((_, i) => i !== idx)
                                }
                              }))}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Sub-decoration Form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="sub-decor-name"
                      placeholder="e.g. foams / fires / horses"
                      className="input-field bg-white text-sm"
                    />
                    <input
                      type="number"
                      id="sub-decor-price"
                      placeholder="Price (₹)"
                      className="input-field bg-white text-sm w-28"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nameInput = document.getElementById("sub-decor-name");
                        const priceInput = document.getElementById("sub-decor-price");
                        const name = nameInput.value.trim();
                        const price = Number(priceInput.value) || 0;
                        if (name) {
                          setForm(p => ({
                            ...p,
                            decoration: {
                              ...p.decoration,
                              types: [...p.decoration.types, { name, price }]
                            }
                          }));
                          nameInput.value = "";
                          priceInput.value = "";
                        } else {
                          toast.error("Please enter a sub-decoration name");
                        }
                      }}
                      className="btn-primary text-xs px-4 py-2 whitespace-nowrap"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4">
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