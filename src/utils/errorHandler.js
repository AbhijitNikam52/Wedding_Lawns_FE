/**
 * Extracts a human-readable message from an Axios error response.
 * @param {Error} err   — Axios error object
 * @param {string} fallback — fallback message
 * @returns {string}
 */
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
};

/**
 * Returns true if the error is a network/connectivity issue.
 */
export const isNetworkError = (err) =>
  !err.response && err.request !== undefined;

/**
 * Returns true if the error is a 401 Unauthorized (token expired etc.)
 */
export const isAuthError = (err) => err.response?.status === 401;

/**
 * Returns true if the error is a 403 Forbidden (suspended, wrong role etc.)
 */
export const isForbiddenError = (err) => err.response?.status === 403;