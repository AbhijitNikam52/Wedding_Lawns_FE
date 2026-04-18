const CONFIG = {
  pending:   { label: "⏳ Pending",   classes: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  confirmed: { label: "✅ Confirmed",  classes: "bg-green-100  text-green-700  border-green-200"  },
  cancelled: { label: "❌ Cancelled",  classes: "bg-red-100    text-red-700    border-red-200"    },
  completed: { label: "🎊 Completed",  classes: "bg-blue-100   text-blue-700   border-blue-200"   },
};

const BookingStatusBadge = ({ status, size = "sm" }) => {
  const cfg  = CONFIG[status] || { label: status, classes: "bg-gray-100 text-gray-600 border-gray-200" };
  const text = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`inline-block font-semibold px-3 py-1 rounded-full border ${text} ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
};

export default BookingStatusBadge;