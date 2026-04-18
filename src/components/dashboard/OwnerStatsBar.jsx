const OwnerStatsBar = ({
  totalLawns,
  approvedLawns,
  pendingBookings,
  confirmedBookings,
  totalEarnings,
  totalPayments,
}) => {
  const stats = [
    {
      icon:    "🏡",
      label:   "Total Venues",
      value:   totalLawns,
      sub:     `${approvedLawns} live`,
      color:   "bg-purple-50 border-purple-100",
      valColor:"text-primary",
    },
    {
      icon:    "⏳",
      label:   "Pending Requests",
      value:   pendingBookings,
      sub:     "Awaiting your response",
      color:   "bg-yellow-50 border-yellow-100",
      valColor:"text-yellow-600",
    },
    {
      icon:    "✅",
      label:   "Confirmed Bookings",
      value:   confirmedBookings,
      sub:     "Upcoming events",
      color:   "bg-green-50 border-green-100",
      valColor:"text-green-600",
    },
    {
      icon:    "💰",
      label:   "Total Earnings",
      value:   `₹${totalEarnings.toLocaleString()}`,
      sub:     `${totalPayments} payment${totalPayments !== 1 ? "s" : ""}`,
      color:   "bg-blue-50 border-blue-100",
      valColor:"text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-2xl border p-5 ${s.color}`}
        >
          <div className="text-2xl mb-2">{s.icon}</div>
          <p className={`text-2xl font-bold ${s.valColor}`}>{s.value}</p>
          <p className="text-sm font-semibold text-dark mt-0.5">{s.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default OwnerStatsBar;