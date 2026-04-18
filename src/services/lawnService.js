import api from "./api";

// Get all lawns with optional filters
export const fetchLawns = (params = {}) =>
  api.get("/lawns", { params }).then((r) => r.data);

// Get single lawn by ID
export const fetchLawnById = (id) =>
  api.get(`/lawns/${id}`).then((r) => r.data);

// Owner: get my lawns
export const fetchMyLawns = () =>
  api.get("/lawns/owner/my-lawns").then((r) => r.data);

// Owner: create lawn
export const createLawn = (data) =>
  api.post("/lawns", data).then((r) => r.data);

// Owner: update lawn
export const updateLawn = (id, data) =>
  api.put(`/lawns/${id}`, data).then((r) => r.data);

// Owner: delete lawn
export const deleteLawn = (id) =>
  api.delete(`/lawns/${id}`).then((r) => r.data);

// Admin: get pending lawns
export const fetchPendingLawns = () =>
  api.get("/lawns/admin/pending").then((r) => r.data);

// Admin: approve lawn
export const approveLawn = (id) =>
  api.put(`/lawns/admin/${id}/approve`).then((r) => r.data);