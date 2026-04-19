import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchPendingLawns,
  fetchRejectedLawns,
  approveLawnAdmin,
  unapproveLawnAdmin,
  rejectLawnAdmin,
} from "../../services/adminService";
import { fetchLawns } from "../../services/lawnService";
import Spinner from "../ui/Spinner";
import ConfirmModal from "../ui/ConfirmModal";
import toast from "react-hot-toast";

const AdminLawnsTab = () => {
  const [pending,   setPending]   = useState([]);
  const [approved,  setApproved]  = useState([]);
  const [rejected,  setRejected]  = useState([]);
  const [view,      setView]      = useState("pending"); // "pending" | "approved" | "rejected"
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false });

  const loadPending = async () => {
    const data = await fetchPendingLawns();
    setPending(data.lawns);
  };

  const loadApproved = async () => {
    const data = await fetchLawns({ limit: 50 });
    setApproved(data.lawns);
  };

  const loadRejected = async () => {
    const data = await fetchRejectedLawns();
    setRejected(data.lawns);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadPending(), loadApproved(), loadRejected()]).catch(console.error);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleApprove = (lawnId, lawnName) => {
    setConfirmState({
      isOpen: true,
      title: "Approve Venue?",
      message: `Are you sure you want to approve "${lawnName}" and make it live?`,
      confirmLabel: "Approve",
      confirmClass: "bg-green-500 text-white hover:bg-green-600",
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        setActionId(lawnId);
        try {
          await approveLawnAdmin(lawnId);
          toast.success(`"${lawnName}" is now live!`);
          await loadAll();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed");
        } finally {
          setActionId(null);
        }
      }
    });
  };

  const handleUnapprove = (lawnId, lawnName) => {
    setConfirmState({
      isOpen: true,
      title: "Change Status to Pending?",
      message: `Are you sure you want to move "${lawnName}" to pending status?`,
      confirmLabel: "Set Pending",
      confirmClass: "bg-yellow-500 text-white hover:bg-yellow-600",
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        setActionId(lawnId);
        try {
          await unapproveLawnAdmin(lawnId);
          toast.success(`"${lawnName}" moved to pending.`);
          await loadAll();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed");
        } finally {
          setActionId(null);
        }
      }
    });
  };

  const handleReject = (lawnId, lawnName) => {
    setConfirmState({
      isOpen: true,
      title: "Reject Venue?",
      message: `Are you sure you want to reject "${lawnName}"?`,
      confirmLabel: "Reject",
      confirmClass: "bg-red-500 text-white hover:bg-red-600",
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        setActionId(lawnId);
        try {
          await rejectLawnAdmin(lawnId);
          toast.success(`"${lawnName}" has been rejected.`);
          await loadAll();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed");
        } finally {
          setActionId(null);
        }
      }
    });
  };

  if (loading) return <Spinner text="Loading venues..." />;

  const lawns = view === "pending" ? pending : view === "approved" ? approved : rejected;

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2 items-center">
        {[
          { key: "pending",  label: `⏳ Pending (${pending.length})` },
          { key: "approved", label: `✅ Approved (${approved.length})` },
          { key: "rejected", label: `❌ Rejected (${rejected.length})` },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`text-sm px-4 py-1.5 rounded-full font-semibold border transition-all ${
              view === v.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Alert for pending */}
      {view === "pending" && pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-yellow-700 text-sm font-medium">
            ⚠️ {pending.length} venue{pending.length !== 1 ? "s" : ""} waiting for your review.
          </p>
        </div>
      )}

      {/* Empty */}
      {lawns.length === 0 && (
        <div className="text-center py-16 bg-purple-50 rounded-2xl">
          <p className="text-4xl mb-3">🏡</p>
          <p className="text-gray-400 text-sm">
            {view === "pending" ? "No venues pending approval." : view === "approved" ? "No approved venues yet." : "No rejected venues."}
          </p>
        </div>
      )}

      {/* Lawn cards */}
      <div className="space-y-4">
        {lawns.map((lawn) => {
          const busy = actionId === lawn._id;
          return (
            <div key={lawn._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Photo */}
                <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
                  {lawn.photos?.[0] ? (
                    <img src={lawn.photos[0]} alt={lawn.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🏡</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-dark">{lawn.name}</h3>
                      <p className="text-gray-500 text-xs">
                        📍 {lawn.city} · 👤 {lawn.ownerId?.name} ({lawn.ownerId?.email})
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      lawn.isApproved
                        ? "bg-green-100 text-green-700"
                        : lawn.isRejected
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {lawn.isApproved ? "✅ Live" : lawn.isRejected ? "❌ Rejected" : "⏳ Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500 mb-3">
                    <span>👥 {lawn.capacity?.toLocaleString()} guests</span>
                    <span>💰 ₹{lawn.pricePerDay?.toLocaleString()}/day</span>
                    <span>📸 {lawn.photos?.length || 0} photos</span>
                    <span>🏷️ {lawn.amenities?.length || 0} amenities</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/lawns/${lawn._id}`}
                      target="_blank"
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-primary hover:text-primary transition-all font-medium"
                    >
                      👁️ Preview
                    </Link>
                    {!lawn.isApproved && (
                      <button
                        onClick={() => handleApprove(lawn._id, lawn.name)}
                        disabled={busy}
                        className="text-xs bg-green-500 text-white px-4 py-1.5 rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50"
                      >
                        {busy ? "..." : "✅ Approve"}
                      </button>
                    )}
                    {(lawn.isApproved || lawn.isRejected) && (
                      <button
                        onClick={() => handleUnapprove(lawn._id, lawn.name)}
                        disabled={busy}
                        className="text-xs bg-yellow-500 text-white px-4 py-1.5 rounded-lg hover:bg-yellow-600 transition-all font-semibold disabled:opacity-50"
                      >
                        {busy ? "..." : "⏳ Set Pending"}
                      </button>
                    )}
                    {!lawn.isRejected && (
                      <button
                        onClick={() => handleReject(lawn._id, lawn.name)}
                        disabled={busy}
                        className="text-xs bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50"
                      >
                        {busy ? "..." : "❌ Reject"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        {...confirmState}
        onCancel={() => setConfirmState({ isOpen: false })}
      />
    </div>
  );
};

export default AdminLawnsTab;