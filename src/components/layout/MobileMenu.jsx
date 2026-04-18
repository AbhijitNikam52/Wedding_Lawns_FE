import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const MobileMenu = ({ open, onClose }) => {
  const { isAuthenticated, user, logout, isOwner, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  const linkCls = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive(path)
        ? "bg-primary text-white"
        : "text-dark hover:bg-purple-50 hover:text-primary"
    }`;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col lg:hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-purple-100 bg-dark">
          <div className="flex items-center gap-2">
            <span>💍</span>
            <span className="text-secondary font-bold text-lg">WeddingLawn</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-secondary transition-colors text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 px-5 py-4 bg-purple-50 border-b border-purple-100">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-dark text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          <Link to="/"      className={linkCls("/")}      onClick={onClose}>🏠 Home</Link>
          <Link to="/lawns" className={linkCls("/lawns")} onClick={onClose}>🏡 Browse Lawns</Link>

          {isAuthenticated ? (
            <>
              <div className="border-t border-gray-100 my-2" />

              {/* User links */}
              {!isOwner && !isAdmin && (
                <>
                  <Link to="/bookings/my"     className={linkCls("/bookings/my")}     onClick={onClose}>📅 My Bookings</Link>
                  <Link to="/chat"            className={linkCls("/chat")}            onClick={onClose}>💬 Messages</Link>
                  <Link to="/payment/history" className={linkCls("/payment/history")} onClick={onClose}>💳 Payments</Link>
                </>
              )}

              {/* Owner links */}
              {isOwner && (
                <>
                  <Link to="/dashboard/owner" className={linkCls("/dashboard/owner")} onClick={onClose}>📊 My Dashboard</Link>
                  <Link to="/bookings/owner"  className={linkCls("/bookings/owner")}  onClick={onClose}>📋 Bookings</Link>
                  <Link to="/chat"            className={linkCls("/chat")}            onClick={onClose}>💬 Messages</Link>
                  <Link to="/lawns/create"    className={linkCls("/lawns/create")}    onClick={onClose}>➕ List a Lawn</Link>
                </>
              )}

              {/* Admin links */}
              {isAdmin && (
                <>
                  <Link to="/admin" className={linkCls("/admin")} onClick={onClose}>⚙️ Admin Panel</Link>
                </>
              )}

              <div className="border-t border-gray-100 my-2" />
              <Link to="/profile"         className={linkCls("/profile")}         onClick={onClose}>👤 My Profile</Link>
              <Link to="/change-password" className={linkCls("/change-password")} onClick={onClose}>🔐 Change Password</Link>
            </>
          ) : (
            <>
              <div className="border-t border-gray-100 my-2" />
              <Link to="/login"    className={linkCls("/login")}    onClick={onClose}>🔑 Login</Link>
              <Link to="/register" className={linkCls("/register")} onClick={onClose}>📝 Register</Link>
            </>
          )}
        </nav>

        {/* Bottom actions */}
        {isAuthenticated && (
          <div className="px-4 py-4 border-t border-purple-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileMenu;