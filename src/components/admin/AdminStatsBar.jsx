const AdminStatsBar = ({ stats }) => {
  const cards = [
    {
      icon:  "👥",
      label: "Total Users",
      value: (stats.users.total + stats.users.owners).toLocaleString(),
      sub:   `${stats.users.total} customers · ${stats.users.owners} owners`,
      color: "bg-purple-50 border-purple-100",
      val:   "text-primary",
    },
    {
      icon:  "🏡",
      label: "Total Venues",
      value: stats.lawns.total.toLocaleString(),
      sub:   `${stats.lawns.approved} live · ${stats.lawns.pending} pending`,
      color: "bg-blue-50 border-blue-100",
      val:   "text-blue-600",
    },
    {
      icon:  "📋",
      label: "Total Bookings",
      value: stats.bookings.total.toLocaleString(),
      sub:   `${stats.bookings.pending} pending · ${stats.bookings.confirmed} confirmed`,
      color: "bg-green-50 border-green-100",
      val:   "text-green-600",
    },
    {
      icon:  "💰",
      label: "Platform Revenue",
      value: `₹${stats.payments.revenue.toLocaleString()}`,
      sub:   `${stats.payments.total} successful payment${stats.payments.total !== 1 ? "s" : ""}`,
      color: "bg-yellow-50 border-yellow-100",
      val:   "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl border p-5 ${c.color}`}>
          <div className="text-2xl mb-2">{c.icon}</div>
          <p className={`text-2xl font-bold ${c.val}`}>{c.value}</p>
          <p className="text-sm font-semibold text-dark mt-0.5">{c.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsBar;