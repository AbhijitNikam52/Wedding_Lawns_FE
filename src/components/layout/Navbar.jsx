import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MobileMenu from "./MobileMenu";
import toast from "react-hot-toast";

const Navbar = () => {
  const { isAuthenticated, user, logout, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <nav className="bg-dark text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold flex-shrink-0">
              <span>💍</span>
              <span className="text-secondary">WeddingLawn</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="hover:text-secondary transition-colors">
                Home
              </Link>
              <Link to="/lawns" className="hover:text-secondary transition-colors">
                Browse Lawns
              </Link>
              <a href="https://t.me/weddinglawns" target="_blank" rel="noopener noreferrer" className="hover:text-[#0088cc] transition-colors flex items-center gap-1 font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z" /></svg>
                Telegram
              </a>

              {isAuthenticated ? (
                <>
                  {isOwner && (
                    <>
                      <Link to="/dashboard/owner" className="hover:text-secondary transition-colors">My Dashboard</Link>
                      <Link to="/bookings/owner" className="hover:text-secondary transition-colors">Bookings</Link>
                      <Link to="/chat" className="hover:text-secondary transition-colors">Messages</Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link to="/admin" className="hover:text-secondary transition-colors">Admin Panel</Link>
                  )}

                  {!isOwner && !isAdmin && (
                    <>
                      <Link to="/bookings/my" className="hover:text-secondary transition-colors">My Bookings</Link>
                      <Link to="/chat" className="hover:text-secondary transition-colors">Messages</Link>
                      <Link to="/payment/history" className="hover:text-secondary transition-colors">Payments</Link>
                    </>
                  )}

                  <div className="flex items-center gap-3">
                    <Link to="/profile" className="text-secondary hover:text-white transition-colors font-medium flex items-center gap-2">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-secondary" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary text-dark flex items-center justify-center font-bold text-sm">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span>{user?.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-primary hover:bg-opacity-80 text-white px-4 py-1.5 rounded-lg text-sm transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="hover:text-secondary transition-colors">Login</Link>
                  <Link to="/register" className="bg-primary hover:bg-opacity-80 text-white px-4 py-1.5 rounded-lg transition-all">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white hover:text-secondary transition-colors p-2"
              aria-label="Open menu"
            >
              <div className="space-y-1.5">
                <span className="block w-6 h-0.5 bg-current" />
                <span className="block w-6 h-0.5 bg-current" />
                <span className="block w-6 h-0.5 bg-current" />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;