import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteLawn } from "../../services/lawnService";
import toast from "react-hot-toast";

const OwnerLawnsList = ({ lawns, setLawns }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (lawnId, lawnName) => {
    if (!window.confirm(`Delete "${lawnName}"? This cannot be undone.`)) return;

    setDeletingId(lawnId);
    try {
      await deleteLawn(lawnId);
      setLawns((prev) => prev.filter((l) => l._id !== lawnId));
      toast.success("Lawn deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (lawns.length === 0) {
    return (
      <div className="text-center py-20 bg-purple-50 rounded-2xl">
        <div className="text-5xl mb-4">🏡</div>
        <h3 className="text-lg font-bold text-dark mb-2">No lawns listed yet</h3>
        <p className="text-gray-500 text-sm mb-6">
          List your first venue and start receiving bookings.
        </p>
        <Link to="/lawns/create" className="btn-primary">
          + List a Lawn
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{lawns.length} venue{lawns.length !== 1 ? "s" : ""} total</p>
        <Link to="/lawns/create" className="btn-primary text-sm px-5">
          + Add New
        </Link>
      </div>

      {lawns.map((lawn) => (
        <div key={lawn._id} className="card hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Thumbnail */}
            <div className="w-full sm:w-32 h-28 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
              {lawn.photos?.[0] ? (
                <img
                  src={lawn.photos[0]}
                  alt={lawn.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🏡</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-grow">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-dark">{lawn.name}</h3>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    lawn.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {lawn.isApproved ? "✅ Live" : "⏳ Pending Approval"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
                <Stat label="📍 City"      value={lawn.city} />
                <Stat label="👥 Capacity"  value={`${lawn.capacity?.toLocaleString()} guests`} />
                <Stat label="💰 Price"     value={`₹${lawn.pricePerDay?.toLocaleString()}/day`} />
                <Stat label="📸 Photos"    value={`${lawn.photos?.length || 0} / 10`} />
              </div>

              {/* Amenities */}
              {lawn.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {lawn.amenities.slice(0, 5).map((a) => (
                    <span key={a} className="text-xs bg-purple-50 text-primary px-2 py-0.5 rounded-full border border-purple-100">
                      {a}
                    </span>
                  ))}
                  {lawn.amenities.length > 5 && (
                    <span className="text-xs text-gray-400">+{lawn.amenities.length - 5} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/lawns/${lawn._id}`}
                  className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-primary hover:text-primary transition-all font-medium"
                >
                  👁️ View
                </Link>
                <Link
                  to={`/lawns/${lawn._id}/edit`}
                  className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-all font-medium"
                >
                  ✏️ Edit
                </Link>
                <Link
                  to={`/lawns/${lawn._id}/edit`}
                  state={{ tab: "photos" }}
                  className="text-xs border border-primary text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all font-medium"
                >
                  📸 Photos
                </Link>
                <button
                  onClick={() => handleDelete(lawn._id, lawn.name)}
                  disabled={deletingId === lawn._id}
                  className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all font-medium disabled:opacity-50"
                >
                  {deletingId === lawn._id ? "Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-medium text-dark">{value}</p>
  </div>
);

export default OwnerLawnsList;