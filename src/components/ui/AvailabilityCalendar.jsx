import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { fetchAvailability } from "../../services/availabilityService";

/**
 * AvailabilityCalendar
 *
 * Props:
 *  lawnId       — required
 *  onDateSelect — called with (dateString) when user clicks an available date
 *  selectedDate — currently selected date string (YYYY-MM-DD)
 *  readOnly     — if true, clicking does nothing (for owner preview)
 */
const AvailabilityCalendar = ({ lawnId, onDateSelect, selectedDate, readOnly = false }) => {
  const [availability, setAvailability] = useState({});
  const [activeMonth,  setActiveMonth]  = useState(null); // "YYYY-MM"
  const [loading,      setLoading]      = useState(true);

  const toKey = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const loadMonth = useCallback(
    async (monthStr) => {
      setLoading(true);
      try {
        const data = await fetchAvailability(lawnId, monthStr);
        // Merge with existing so navigating back keeps data
        setAvailability((prev) => ({ ...prev, ...data.availability }));
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setLoading(false);
      }
    },
    [lawnId]
  );

  // Load current month on mount
  useEffect(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setActiveMonth(month);
    loadMonth(month);
  }, [loadMonth]);

  // When user navigates to different month
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    const y = activeStartDate.getFullYear();
    const m = String(activeStartDate.getMonth() + 1).padStart(2, "0");
    const month = `${y}-${m}`;
    setActiveMonth(month);
    loadMonth(month);
  };

  // Color-code each tile
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const key    = toKey(date);
    const record = availability[key];
    const today  = toKey(new Date());

    // Past dates
    if (key < today) return "cal-past";

    if (!record) return "cal-unavailable"; // no record = not marked

    if (record.isBooked)  return "cal-booked";
    if (record.isBlocked) return "cal-blocked";
    if (key === selectedDate) return "cal-selected";

    return "cal-available";
  };

  // Disable past and unavailable dates
  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    if (readOnly) return true;

    const key    = toKey(date);
    const today  = toKey(new Date());
    const record = availability[key];

    if (key < today) return true;
    if (!record)           return true; // not marked available
    if (record.isBooked)   return true;
    if (record.isBlocked)  return true;

    return false;
  };

  const handleClick = (date) => {
    if (readOnly) return;
    const key    = toKey(date);
    const record = availability[key];
    const today  = toKey(new Date());

    if (key < today || !record || record.isBooked || record.isBlocked) return;
    onDateSelect?.(key);
  };

  return (
    <div className="availability-calendar-wrapper">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs font-medium">
        {[
          { color: "bg-green-400",  label: "Available" },
          { color: "bg-red-400",    label: "Booked" },
          { color: "bg-gray-400",   label: "Blocked / Unavailable" },
          { color: "bg-primary",    label: "Your Selection" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-xs text-gray-400 mb-2 animate-pulse">Loading availability...</div>
      )}

      <Calendar
        onClickDay={handleClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        onActiveStartDateChange={handleActiveStartDateChange}
        minDate={new Date()}
        showNeighboringMonth={false}
        className="w-full border-0 rounded-xl"
      />

      {/* Custom calendar styles */}
      <style>{`
        .availability-calendar-wrapper .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .availability-calendar-wrapper .react-calendar__tile {
          border-radius: 8px;
          padding: 10px 4px;
          font-size: 13px;
        }
        .availability-calendar-wrapper .react-calendar__navigation button {
          font-size: 14px;
          font-weight: 600;
        }
        .availability-calendar-wrapper .cal-available {
          background: #bbf7d0 !important;
          color: #166534 !important;
          font-weight: 600;
        }
        .availability-calendar-wrapper .cal-available:hover {
          background: #4ade80 !important;
        }
        .availability-calendar-wrapper .cal-booked {
          background: #fecaca !important;
          color: #991b1b !important;
          cursor: not-allowed !important;
        }
        .availability-calendar-wrapper .cal-blocked {
          background: #e5e7eb !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
        }
        .availability-calendar-wrapper .cal-unavailable {
          background: #f3f4f6 !important;
          color: #d1d5db !important;
        }
        .availability-calendar-wrapper .cal-past {
          opacity: 0.35;
        }
        .availability-calendar-wrapper .cal-selected {
          background: #7B2D8B !important;
          color: white !important;
          font-weight: 700;
        }
        .availability-calendar-wrapper .react-calendar__tile--now {
          border: 2px solid #7B2D8B !important;
          background: white !important;
        }
      `}</style>
    </div>
  );
};

export default AvailabilityCalendar;