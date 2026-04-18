import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  fetchOwnerAvailability,
  markDatesAvailable,
  removeDates,
  toggleBlockDate,
} from "../../services/availabilityService";
import toast from "react-hot-toast";

const OwnerAvailabilityManager = ({ lawnId }) => {
  const [availability,  setAvailability]  = useState({});
  const [selectedDates, setSelectedDates] = useState([]); // multi-select
  const [mode,    setMode]    = useState("mark");    // "mark" | "unmark" | "block" | "unblock"
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const toKey = (date) => {
    const d  = new Date(date);
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOwnerAvailability(lawnId);
      setAvailability(data.availability);
    } catch {
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  }, [lawnId]);

  useEffect(() => { load(); }, [load]);

  // Toggle a date in selectedDates
  const handleClickDay = (date) => {
    const key   = toKey(date);
    const today = toKey(new Date());
    if (key < today) return; // can't select past dates

    setSelectedDates((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const key    = toKey(date);
    const today  = toKey(new Date());
    const record = availability[key];
    const picked = selectedDates.includes(key);

    if (key < today) return "cal-past";
    if (picked)      return "cal-selected";
    if (!record)     return "cal-unavailable";
    if (record.isBooked)  return "cal-booked";
    if (record.isBlocked) return "cal-blocked";
    return "cal-available";
  };

  // Apply the current mode action to all selectedDates
  const handleApply = async () => {
    if (selectedDates.length === 0) {
      return toast.error("Select at least one date on the calendar first");
    }
    setSaving(true);
    try {
      if (mode === "mark") {
        await markDatesAvailable(lawnId, selectedDates);
        toast.success(`${selectedDates.length} date(s) marked available`);
      } else if (mode === "unmark") {
        await removeDates(lawnId, selectedDates);
        toast.success(`${selectedDates.length} date(s) removed from availability`);
      } else if (mode === "block") {
        for (const d of selectedDates) await toggleBlockDate(lawnId, d, true);
        toast.success(`${selectedDates.length} date(s) blocked`);
      } else if (mode === "unblock") {
        for (const d of selectedDates) await toggleBlockDate(lawnId, d, false);
        toast.success(`${selectedDates.length} date(s) unblocked`);
      }
      setSelectedDates([]);
      await load(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const MODES = [
    { key: "mark",    label: "✅ Mark Available", color: "bg-green-500 text-white" },
    { key: "unmark",  label: "🗑️ Remove",          color: "bg-gray-200 text-gray-700" },
    { key: "block",   label: "🚫 Block",            color: "bg-orange-500 text-white" },
    { key: "unblock", label: "🔓 Unblock",          color: "bg-blue-500 text-white" },
  ];

  return (
    <div className="space-y-5">
      {/* Mode selector */}
      <div>
        <p className="text-sm font-semibold text-dark mb-2">
          Select action, then click dates on the calendar:
        </p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border-2 transition-all ${
                mode === m.key
                  ? `${m.color} border-transparent shadow`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs font-medium">
        {[
          { color: "bg-green-400",  label: "Available" },
          { color: "bg-red-400",    label: "Booked (locked)" },
          { color: "bg-orange-400", label: "Blocked by you" },
          { color: "bg-gray-200",   label: "Not marked" },
          { color: "bg-primary",    label: "Selected" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading calendar...</p>
      ) : (
        <Calendar
          onClickDay={handleClickDay}
          tileClassName={tileClassName}
          minDate={new Date()}
          showNeighboringMonth={false}
          className="w-full border-0 rounded-xl"
        />
      )}

      {/* Selected dates summary + apply */}
      {selectedDates.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-dark mb-2">
            {selectedDates.length} date(s) selected:
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedDates.slice(0, 10).map((d) => (
              <span
                key={d}
                className="text-xs bg-primary text-white px-2 py-0.5 rounded-full"
              >
                {d}
              </span>
            ))}
            {selectedDates.length > 10 && (
              <span className="text-xs text-gray-400">
                +{selectedDates.length - 10} more
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={saving}
              className="btn-primary text-sm px-6"
            >
              {saving ? "Saving..." : `Apply: ${MODES.find((m) => m.key === mode)?.label}`}
            </button>
            <button
              onClick={() => setSelectedDates([])}
              className="text-sm text-gray-500 hover:text-dark px-3"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Inline calendar styles */}
      <style>{`
        .react-calendar { width: 100%; border: none; font-family: inherit; }
        .react-calendar__tile { border-radius: 8px; padding: 10px 4px; font-size: 13px; }
        .react-calendar__navigation button { font-size: 14px; font-weight: 600; }
        .cal-available  { background: #bbf7d0 !important; color: #166534 !important; font-weight: 600; }
        .cal-booked     { background: #fecaca !important; color: #991b1b !important; cursor: not-allowed !important; }
        .cal-blocked    { background: #fed7aa !important; color: #9a3412 !important; }
        .cal-unavailable{ background: #f3f4f6 !important; color: #d1d5db !important; }
        .cal-past       { opacity: 0.3; }
        .cal-selected   { background: #7B2D8B !important; color: white !important; font-weight: 700; }
        .react-calendar__tile--now { border: 2px solid #7B2D8B !important; background: white !important; }
      `}</style>
    </div>
  );
};

export default OwnerAvailabilityManager;