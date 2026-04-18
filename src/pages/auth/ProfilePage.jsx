import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    name:  user?.name  || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/auth/update-profile", form);
      // Refresh user in context by re-fetching /me
      toast.success("Profile updated!");
      setEditing(false);
      // Reload page to sync AuthContext with new name
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = {
    user:  { label: "Customer",  color: "bg-blue-100 text-blue-700" },
    owner: { label: "Lawn Owner", color: "bg-purple-100 text-purple-700" },
    admin: { label: "Admin",      color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Profile Card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${roleLabel[user?.role]?.color}`}>
                {roleLabel[user?.role]?.label}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <InfoRow label="Email"  value={user?.email} />
              <InfoRow label="Phone"  value={user?.phone || "Not set"} />
              <InfoRow label="Member since" value={new Date(user?.createdAt).toLocaleDateString()} />
              <button
                onClick={() => setEditing(true)}
                className="btn-primary mt-2"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Security Card */}
        <div className="card">
          <h3 className="text-lg font-bold text-dark mb-4">🔐 Security</h3>
          <Link to="/change-password" className="btn-outline text-sm">
            Change Password
          </Link>
        </div>

      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-dark">{value}</span>
  </div>
);

export default ProfilePage;