import { useState, useEffect } from "react";
import { fetchAdminStats } from "../../services/adminService";
import AdminStatsBar    from "../../components/admin/AdminStatsBar";
import AdminUsersTab    from "../../components/admin/AdminUsersTab";
import AdminLawnsTab    from "../../components/admin/AdminLawnsTab";
import AdminBookingsTab from "../../components/admin/AdminBookingsTab";
import Spinner from "../../components/ui/Spinner";

const TABS = [
  { key: "overview",  label: "📊 Overview"  },
  { key: "users",     label: "👥 Users"     },
  { key: "lawns",     label: "🏡 Lawns"     },
  { key: "bookings",  label: "📋 Bookings"  },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then((d) => setStats(d.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading admin panel..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">⚙️ Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">
          Platform management — users, lawns, bookings and revenue.
        </p>
      </div>

      {/* Stats bar */}
      {stats && <AdminStatsBar stats={stats} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 mt-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview"  && <OverviewTab stats={stats} onTabChange={setActiveTab} />}
      {activeTab === "users"     && <AdminUsersTab />}
      {activeTab === "lawns"     && <AdminLawnsTab />}
      {activeTab === "bookings"  && <AdminBookingsTab />}
    </div>
  );
};

// ── Overview Tab ─────────────────────────────────────────
const OverviewTab = ({ stats, onTabChange }) => {
  const recentBookings = stats?.recentBookings || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Booking breakdown */}
      <div className="card">
        <h3 className="font-bold text-dark mb-4">Booking Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: "Pending",   value: stats?.bookings.pending,   color: "bg-yellow-400" },
            { label: "Confirmed", value: stats?.bookings.confirmed, color: "bg-green-400" },
            { label: "Completed", value: stats?.bookings.completed, color: "bg-blue-400" },
            { label: "Cancelled", value: stats?.bookings.cancelled, color: "bg-red-400" },
          ].map((item) => {
            const pct = stats?.bookings.total
              ? Math.round((item.value / stats.bookings.total) * 100)
              : 0;
            return (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-dark">{item.value} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lawn breakdown */}
      <div className="card">
        <h3 className="font-bold text-dark mb-4">Venue Status</h3>
        <div className="flex items-center justify-center gap-8 py-4">
          <DonutStat
            value={stats?.lawns.approved}
            total={stats?.lawns.total}
            label="Approved"
            color="text-green-600"
            bg="bg-green-100"
          />
          <DonutStat
            value={stats?.lawns.pending}
            total={stats?.lawns.total}
            label="Pending"
            color="text-yellow-600"
            bg="bg-yellow-100"
          />
        </div>
        {stats?.lawns.pending > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
            <p className="text-yellow-700 text-sm font-medium">
              ⚠️ {stats.lawns.pending} venue{stats.lawns.pending !== 1 ? "s" : ""} awaiting approval.{" "}
              <button
                onClick={() => onTabChange("lawns")}
                className="underline font-semibold"
              >
                Review now →
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div className="card lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-dark">Recent Bookings</h3>
          <button
            onClick={() => onTabChange("bookings")}
            className="text-xs text-primary hover:underline"
          >
            View all →
          </button>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Lawn</th>
                  <th className="pb-2 pr-4">Event Date</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id} className="border-b border-gray-50 last:border-0 hover:bg-purple-50">
                    <td className="py-2.5 pr-4 font-medium text-dark">{b.userId?.name}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{b.lawnId?.name}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{new Date(b.eventDate).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-4 font-semibold text-green-600">₹{b.totalAmount?.toLocaleString()}</td>
                    <td className="py-2.5"><StatusPill status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const DonutStat = ({ value, total, label, color, bg }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="text-center">
      <div className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center mx-auto mb-2`}>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-sm font-semibold text-dark">{label}</p>
      <p className="text-xs text-gray-400">{pct}% of total</p>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const cfg = {
    pending:   "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cfg[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default AdminPage;