import { Link } from "react-router-dom";

/**
 * Reusable empty state component.
 *
 * Props:
 *   icon    — emoji to show (default: 📭)
 *   title   — heading text
 *   message — description text
 *   action  — { label, to } for a CTA button (optional)
 */
const EmptyState = ({
  icon    = "📭",
  title   = "Nothing here yet",
  message = "",
  action  = null,
  className = "",
}) => (
  <div className={`text-center py-20 bg-purple-50 rounded-2xl ${className}`}>
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-dark mb-2">{title}</h3>
    {message && (
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">{message}</p>
    )}
    {action && (
      <Link to={action.to} className="btn-primary inline-block">
        {action.label}
      </Link>
    )}
  </div>
);

export default EmptyState;