import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLawnById, updateLawn } from "../../services/lawnService";
import PhotoUploader from "../../components/ui/PhotoUploader";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const AMENITY_OPTIONS = [
  "AC", "Parking", "Catering", "Generator",
  "Sound System", "Decoration", "Swimming", "Garden",
];

const EditLawnPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" | "photos"

  useEffect(() => {
    fetchLawnById(id)
      .then((data) => {
        const l = data.lawn;
        setForm({
          name:        l.name,
          city:        l.city,
          address:     l.address,
          capacity:    l.capacity,
          pricePerDay: l.pricePerDay,
          description: l.description || "",
          amenities:   l.amenities   || [],
          photos:      l.photos      || [],
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
        capacity:    Number(form.capacity),
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
  if (!form)   return null;

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
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-purple-50"
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
              <input name="address" value={form.address} onChange={handleChange}
                className="input-field" required />
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

          <div className="flex gap-3">
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