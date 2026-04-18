import api from "./api";

// Public: get availability map for a lawn (optional ?month=YYYY-MM)
export const fetchAvailability = (lawnId, month = null) =>
  api
    .get(`/availability/${lawnId}`, { params: month ? { month } : {} })
    .then((r) => r.data);

// Public: check a specific date
export const checkDate = (lawnId, date) =>
  api
    .get(`/availability/${lawnId}/check`, { params: { date } })
    .then((r) => r.data);

// Owner: get full map including blocked dates
export const fetchOwnerAvailability = (lawnId) =>
  api.get(`/availability/${lawnId}/owner`).then((r) => r.data);

// Owner: mark array of dates as available
export const markDatesAvailable = (lawnId, dates) =>
  api.post(`/availability/${lawnId}/mark`, { dates }).then((r) => r.data);

// Owner: remove dates from available
export const removeDates = (lawnId, dates) =>
  api.delete(`/availability/${lawnId}/mark`, { data: { dates } }).then((r) => r.data);

// Owner: block / unblock a single date
export const toggleBlockDate = (lawnId, date, isBlocked) =>
  api
    .put(`/availability/${lawnId}/block`, { date, isBlocked })
    .then((r) => r.data);