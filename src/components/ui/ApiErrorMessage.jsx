/**
 * Displays a friendly error message from an Axios error.
 * Usage: <ApiErrorMessage error={err} onRetry={load} />
 */
const ApiErrorMessage = ({ error, onRetry, className = "" }) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

  const status = error?.response?.status;

  const icon =
    status === 404 ? "🔍"
    : status === 403 ? "🔒"
    : status === 401 ? "🔑"
    : status >= 500  ? "🛠️"
    : "⚠️";

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 ${className}`}
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-grow">
        <p className="text-red-700 font-semibold text-sm">{message}</p>
        {status && (
          <p className="text-red-400 text-xs mt-0.5">Error {status}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiErrorMessage;