import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLawnById, updateLawn } from "../../services/lawnService";
import PhotoUploader from "../../components/ui/PhotoUploader";
import AddressAutocomplete from "../../components/ui/AddressAutocomplete";
import LocationPickerMap from "../../components/ui/LocationPickerMap";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const AMENITY_OPTIONS = [
  "AC", "Parking", "Catering", "Generator",
  "Sound System", "Decoration", "Swimming", "Garden",
];

const EditLawnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" | "photos"

  useEffect(() => {
    fetchLawnById(id)
      .then((data) => {
        const l = data.lawn;
        setForm({
          name: l.name,
          city: l.city,
          address: l.address,
          capacity: l.capacity,
          pricePerDay: l.pricePerDay,
          description: l.description || "",
          amenities: l.amenities || [],
          photos: l.photos || [],
          catering: l.catering || { available: false, pricePerPlate: "", description: "" },
          decoration: l.decoration || { available: false, basePrice: "", types: [] },
          location: l.location || { lat: null, lng: null, formattedAddress: "" },
        });
      })
      .catch(() => toast.error("Failed to load lawn"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleAmenity = (a) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLawn(id, {
        ...form,
        capacity: Number(form.capacity),
        pricePerDay: Number(form.pricePerDay),
      });
      toast.success("Lawn updated successfully!");
      navigate("/dashboard/owner");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner text="Loading lawn details..." />;
  if (!form) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">✏️ Edit Lawn</h1>
        <p className="text-gray-500 text-sm mt-1">Update your venue details or manage photos.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-6">
        {["details", "photos"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-all ${activeTab === tab ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-purple-50"
              }`}>
            {tab === "details" ? "📋 Venue Details" : "📸 Photos"}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === "details" && (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lawn Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input name="city" value={form.city} onChange={handleChange}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input name="capacity" type="number" min="50" value={form.capacity}
                onChange={handleChange} className="input-field" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
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
                  onChange={handleChange} className="input-field pl-8" required />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} className="input-field resize-none" />
            </div>
          </div>

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
                  checked={form.catering?.available || false}
                  onChange={(e) => setForm(p => ({
                    ...p,
                    catering: { ...p.catering, available: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {form.catering?.available && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price Per Plate (₹) *</label>
                  <input
                    type="number"
                    value={form.catering?.pricePerPlate || ""}
                    onChange={(e) => setForm(p => ({
                      ...p,
                      catering: { ...p.catering, pricePerPlate: Number(e.target.value) || "" }
                    }))}
                    placeholder="e.g. 500"
                    className="input-field bg-white"
                    required={form.catering?.available}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Catering Description / Menu Summary</label>
                  <textarea
                    value={form.catering?.description || ""}
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
                  checked={form.decoration?.available || false}
                  onChange={(e) => setForm(p => ({
                    ...p,
                    decoration: { ...p.decoration, available: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {form.decoration?.available && (
              <div className="space-y-4 mt-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Base Decoration Price (₹) *</label>
                  <input
                    type="number"
                    value={form.decoration?.basePrice || ""}
                    onChange={(e) => setForm(p => ({
                      ...p,
                      decoration: { ...p.decoration, basePrice: Number(e.target.value) || "" }
                    }))}
                    placeholder="e.g. 25000"
                    className="input-field bg-white"
                    required={form.decoration?.available}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sub-Decorations (e.g. foams, fires, horses, etc.)</label>
                  
                  {/* Dynamic sub-decorations list */}
                  {(form.decoration?.types || []).length > 0 && (
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
                              types: [...(p.decoration?.types || []), { name, price }]
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

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard/owner")}
              className="btn-outline px-6">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Photos tab */}
      {activeTab === "photos" && (
        <div className="card">
          <PhotoUploader
            lawnId={id}
            initialPhotos={form.photos}
            onPhotosChange={(photos) => setForm((p) => ({ ...p, photos }))}
          />
        </div>
      )}
    </div>
  );
};

export default EditLawnPage;