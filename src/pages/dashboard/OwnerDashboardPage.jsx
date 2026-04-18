import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchMyLawns } from "../../services/lawnService";
import { fetchOwnerBookings } from "../../services/bookingService";
import { fetchPaymentHistory } from "../../services/paymentService";
import OwnerStatsBar        from "../../components/dashboard/OwnerStatsBar";
import OwnerLawnsList       from "../../components/dashboard/OwnerLawnsList";
import OwnerEarningsChart   from "../../components/dashboard/OwnerEarningsChart";
import OwnerAvailabilityManager from "../../components/ui/OwnerAvailabilityManager";
import OwnerBookingsPage    from "../booking/OwnerBookingsPage";
import Spinner from "../../components/ui/Spinner";

const TABS = [
  { key: "overview",     label: "📊 Overview"     },
  { key: "lawns",        label: "🏡 My Lawns"     },
  { key: "bookings",     label: "📋 Bookings"     },
  { key: "availability", label: "📅 Availability" },
  { key: "earnings",     label: "💰 Earnings"     },
];

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [lawns,    setLawns]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selectedLawnId, setSelectedLawnId] = useState(null);

  useEffect(() => {
    Promise.all([fetchMyLawns(), fetchOwnerBookings(), fetchPaymentHistory()])
      .then(([l, b, p]) => {
        setLawns(l.lawns);
        setBookings(b.bookings);
        setPayments(p.payments);
        if (l.lawns.length > 0) setSelectedLawnId(l.lawns[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  const totalEarnings  = payments.reduce((s, p) => s + p.amount, 0);
  const pendingCount   = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const approvedLawns  = lawns.filter((l) => l.isApproved).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">👋 Welcome back, {user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your venues today.</p>
        </div>
        <Link to="/lawns/create" className="btn-primary px-6">+ List New Lawn</Link>
      </div>

      <OwnerStatsBar
        totalLawns={lawns.length}
        approvedLawns={approvedLawns}
        pendingBookings={pendingCount}
        confirmedBookings={confirmedCount}
        totalEarnings={totalEarnings}
        totalPayments={payments.length}
      />

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto mt-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview"     && <OverviewTab lawns={lawns} bookings={bookings} payments={payments} onTabChange={setActiveTab} />}
      {activeTab === "lawns"        && <OwnerLawnsList lawns={lawns} setLawns={setLawns} />}
      {activeTab === "bookings"     && <OwnerBookingsPage embedded />}
      {activeTab === "availability" && <AvailabilityTab lawns={lawns} selectedLawnId={selectedLawnId} onSelectLawn={setSelectedLawnId} />}
      {activeTab === "earnings"     && <OwnerEarningsChart payments={payments} />}
    </div>
  );
};

const OverviewTab = ({ lawns, bookings, payments, onTabChange }) => {
  const recentBookings = bookings.slice(0, 5);
  const recentPayments = payments.slice(0, 5);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-dark">Recent Bookings</h3>
          <button onClick={() => onTabChange("bookings")} className="text-xs text-primary hover:underline">View all →</button>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-dark">{b.userId?.name}</p>
                  <p className="text-xs text-gray-400">{b.lawnId?.name} · {new Date(b.eventDate).toLocaleDateString()}</p>
                </div>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-dark">Recent Earnings</h3>
          <button onClick={() => onTabChange("earnings")} className="text-xs text-primary hover:underline">View all →</button>
        </div>
        {recentPayments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-dark">{p.bookingId?.lawnId?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(p.paidAt).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-green-600">+₹{p.amount?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-dark">My Venues</h3>
          <button onClick={() => onTabChange("lawns")} className="text-xs text-primary hover:underline">Manage →</button>
        </div>
        {lawns.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-4">You haven't listed any lawns yet.</p>
            <Link to="/lawns/create" className="btn-primary text-sm">+ List Your First Lawn</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lawns.map((lawn) => (
              <div key={lawn._id} className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-dark text-sm truncate pr-2">{lawn.name}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${lawn.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {lawn.isApproved ? "Live" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">📍 {lawn.city}</p>
                <p className="text-xs text-gray-500">💰 ₹{lawn.pricePerDay?.toLocaleString()}/day</p>
                <p className="text-xs text-gray-500">👥 {lawn.capacity?.toLocaleString()} guests</p>
                <Link to={`/lawns/${lawn._id}/edit`} className="text-xs text-primary hover:underline mt-2 inline-block">Edit →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AvailabilityTab = ({ lawns, selectedLawnId, onSelectLawn }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="card">
      <h3 className="font-bold text-dark mb-4">Select Venue</h3>
      {lawns.length === 0 ? (
        <p className="text-gray-400 text-sm">No lawns yet.</p>
      ) : (
        <div className="space-y-2">
          {lawns.map((lawn) => (
            <button
              key={lawn._id}
              onClick={() => onSelectLawn(lawn._id)}
              className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                selectedLawnId === lawn._id
                  ? "border-primary bg-purple-50 text-primary font-semibold"
                  : "border-gray-100 hover:border-primary hover:bg-purple-50 text-dark"
              }`}
            >
              <p className="font-medium truncate">{lawn.name}</p>
              <p className="text-xs text-gray-400">{lawn.city}</p>
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="lg:col-span-2 card">
      {selectedLawnId ? (
        <>
          <h3 className="font-bold text-dark mb-4">Manage Availability</h3>
          <OwnerAvailabilityManager lawnId={selectedLawnId} />
        </>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Select a lawn to manage availability</div>
      )}
    </div>
  </div>
);

const StatusPill = ({ status }) => {
  const cfg = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cfg[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

export default OwnerDashboardPage;