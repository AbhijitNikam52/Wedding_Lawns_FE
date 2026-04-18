import api from "./api";

// User: create a booking request
export const createBooking = (data) =>
  api.post("/bookings", data).then((r) => r.data);

// User: get my bookings
export const fetchMyBookings = () =>
  api.get("/bookings/my").then((r) => r.data);

// Owner: get bookings for my lawns (optional ?status=pending)
export const fetchOwnerBookings = (status = "") =>
  api
    .get("/bookings/owner", { params: status ? { status } : {} })
    .then((r) => r.data);

// Shared: get single booking
export const fetchBookingById = (id) =>
  api.get(`/bookings/${id}`).then((r) => r.data);

// Owner/User: update booking status
export const updateBookingStatus = (id, status, reason = "") =>
  api
    .put(`/bookings/${id}/status`, { status, reason })
    .then((r) => r.data);

// Admin: all bookings
export const fetchAllBookings = (params = {}) =>
  api.get("/bookings/admin/all", { params }).then((r) => r.data);