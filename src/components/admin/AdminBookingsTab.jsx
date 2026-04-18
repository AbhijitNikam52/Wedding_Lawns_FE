import { useState, useEffect } from "react";
import { fetchAllBookingsAdmin } from "../../services/adminService";
import BookingStatusBadge from "../ui/BookingStatusBadge";
import Spinner from "../ui/Spinner";

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

const AdminBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);

  const load = async (status = filter, pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (status !== "all") params.status = status;
      const data = await fetchAllBookingsAdmin(params);
      setBookings(data.bookings);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, page]);

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`text-xs px-4 py-1.5 rounded-full font-semibold capitalize border transition-all ${
              filter === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-auto">{total} total</span>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner text="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-purple-50 rounded-2xl">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400 text-sm">No {filter !== "all" ? filter : ""} bookings found.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-50 text-left text-xs text-gray-500 border-b border-purple-100">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Lawn</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Event Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-gray-50 last:border-0 hover:bg-purple-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark">{b.userId?.name}</p>
                        <p className="text-xs text-gray-400">{b.userId?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-dark">{b.lawnId?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.lawnId?.city}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(b.eventDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        ₹{b.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                    p === page
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBookingsTab;