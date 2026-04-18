import { useSearchParams, Link } from "react-router-dom";

const PaymentFailurePage = () => {
  const [params]  = useSearchParams();
  const bookingId = params.get("bookingId");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">❌</span>
        </div>

        <h1 className="text-2xl font-bold text-dark mb-1">Payment Failed</h1>
        <p className="text-gray-500 text-sm mb-2">
          Your payment could not be processed. No amount has been deducted.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          This may happen due to a cancelled transaction, bank decline, or network issue.
          Your booking is still confirmed — you can retry payment anytime.
        </p>

        {/* Common reasons */}
        <div className="bg-red-50 rounded-xl p-4 text-left mb-6">
          <p className="text-sm font-semibold text-red-700 mb-2">Common reasons:</p>
          <ul className="text-xs text-red-600 space-y-1">
            <li>• Insufficient balance or card limit exceeded</li>
            <li>• Payment cancelled by user</li>
            <li>• Bank server timeout — try again in a few minutes</li>
            <li>• UPI PIN entered incorrectly</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {bookingId && (
            <Link
              to={`/bookings/${bookingId}/pay`}
              className="btn-primary py-2.5"
            >
              🔄 Retry Payment
            </Link>
          )}
          <Link to="/bookings/my" className="btn-outline py-2.5">
            View My Bookings
          </Link>
          <Link to="/lawns" className="text-sm text-gray-400 hover:text-primary py-2 transition-colors">
            Browse Lawns
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;