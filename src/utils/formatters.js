/**
 * Format a number as Indian Rupee currency.
 * e.g. 75000 → "₹75,000"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

/**
 * Format a date string or Date object as a readable date.
 * e.g. "2024-08-15" → "15 Aug 2024"
 */
export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
};

/**
 * Format a datetime as "15 Aug 2024, 3:30 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format a date as "YYYY-MM-DD" for API calls.
 */
export const toISODate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

/**
 * Truncate a string to maxLen characters, appending "…" if truncated.
 */
export const truncate = (str, maxLen = 60) => {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};