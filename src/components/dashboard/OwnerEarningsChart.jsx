import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const OwnerEarningsChart = ({ payments }) => {
  const year = new Date().getFullYear();

  const monthlyData = MONTHS.map((month, idx) => {
    const total = payments
      .filter((p) => {
        const d = new Date(p.paidAt);
        return d.getFullYear() === year && d.getMonth() === idx;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return { month, total };
  });

  const totalEarnings = payments.reduce((s, p) => s + p.amount, 0);
  const maxMonth      = monthlyData.reduce((a, b) => (b.total > a.total ? b : a), { total: 0 });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-purple-100 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-bold text-dark">{label}</p>
          <p className="text-primary font-semibold">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SumCard label="Total Earned"           value={`₹${totalEarnings.toLocaleString()}`} color="text-primary" />
        <SumCard label="Transactions"           value={payments.length}                       color="text-blue-600" />
        <SumCard label={`Best Month (${year})`} value={maxMonth.total ? `${maxMonth.month} — ₹${maxMonth.total.toLocaleString()}` : "—"} color="text-green-600" />
      </div>

      <div className="card">
        <h3 className="font-bold text-dark mb-4">Monthly Earnings — {year}</h3>
        {totalEarnings === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-400 text-sm">No earnings recorded yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {monthlyData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.total === maxMonth.total && entry.total > 0 ? "#7B2D8B" : "#D4A843"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {payments.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-dark mb-4">All Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4">Lawn</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Event Date</th>
                  <th className="pb-2 pr-4">Paid On</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-purple-50">
                    <td className="py-2.5 pr-4 font-medium text-dark truncate max-w-[120px]">{p.bookingId?.lawnId?.name}</td>
                    <td className="py-2.5 pr-4 text-gray-600 truncate max-w-[120px]">{p.bookingId?.userId?.name}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{new Date(p.bookingId?.eventDate).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td className="py-2.5 text-right font-bold text-green-600">+₹{p.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-purple-100">
                  <td colSpan={4} className="pt-3 font-bold text-dark">Total</td>
                  <td className="pt-3 text-right font-bold text-primary text-base">₹{payments.reduce((s,p)=>s+p.amount,0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const SumCard = ({ label, value, color }) => (
  <div className="card">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);

export default OwnerEarningsChart;