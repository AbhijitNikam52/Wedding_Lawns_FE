import { useState, useEffect, useCallback } from "react";
import {
  fetchAllUsers,
  updateUserRole,
  toggleUserSuspend,
  deleteUser,
} from "../../services/adminService";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";

const ROLES = ["all", "user", "owner", "admin"];

const AdminUsersTab = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionId, setActionId] = useState(null);
  const [total,    setTotal]    = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)                    params.search = search;
      if (roleFilter !== "all")      params.role   = roleFilter;
      const data = await fetchAllUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
    setActionId(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (userId, isSuspended) => {
    setActionId(userId);
    try {
      await toggleUserSuspend(userId, isSuspended);
      toast.success(isSuspended ? "User suspended" : "User reactivated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setActionId(userId);
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionId(null);
    }
  };

  const roleBadge = (role) => {
    const cfg = {
      user:  "bg-blue-100 text-blue-700",
      owner: "bg-purple-100 text-purple-700",
      admin: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${cfg[role] || "bg-gray-100 text-gray-600"}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs text-sm"
        />
        <div className="flex gap-1">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize border transition-all ${
                roleFilter === r
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">{total} user{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner text="Loading users..." />
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-purple-50 rounded-2xl">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50 text-left text-xs text-gray-500 border-b border-purple-100">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const busy = actionId === u._id;
                  return (
                    <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-dark">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          u.isSuspended
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {u.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {/* Role change */}
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={busy}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>

                          {/* Suspend / Activate */}
                          <button
                            onClick={() => handleSuspend(u._id, !u.isSuspended)}
                            disabled={busy}
                            className={`text-xs px-2 py-1 rounded-lg font-medium disabled:opacity-50 ${
                              u.isSuspended
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}
                          >
                            {busy ? "..." : u.isSuspended ? "Activate" : "Suspend"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            disabled={busy}
                            className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-lg font-medium disabled:opacity-50"
                          >
                            {busy ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;