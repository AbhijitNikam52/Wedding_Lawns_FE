import api from "./api";

// ─── Stats ────────────────────────────────────────────────
export const fetchAdminStats = () =>
  api.get("/admin/stats").then((r) => r.data);

// ─── Users ────────────────────────────────────────────────
export const fetchAllUsers = (params = {}) =>
  api.get("/admin/users", { params }).then((r) => r.data);

export const updateUserRole = (userId, role) =>
  api.put(`/admin/users/${userId}/role`, { role }).then((r) => r.data);

export const toggleUserSuspend = (userId, isSuspended) =>
  api.put(`/admin/users/${userId}/suspend`, { isSuspended }).then((r) => r.data);

export const deleteUser = (userId) =>
  api.delete(`/admin/users/${userId}`).then((r) => r.data);

// ─── Lawns ────────────────────────────────────────────────
export const fetchPendingLawns = () =>
  api.get("/lawns/admin/pending").then((r) => r.data);

export const approveLawnAdmin = (lawnId) =>
  api.put(`/lawns/admin/${lawnId}/approve`).then((r) => r.data);

export const rejectLawnAdmin = (lawnId) =>
  api.delete(`/lawns/${lawnId}`).then((r) => r.data);

// ─── Bookings ─────────────────────────────────────────────
export const fetchAllBookingsAdmin = (params = {}) =>
  api.get("/bookings/admin/all", { params }).then((r) => r.data);