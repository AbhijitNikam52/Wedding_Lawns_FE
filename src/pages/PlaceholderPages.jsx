// ─── Placeholder pages — will be fully built on their sprint days ───

export const LawnListPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center">
      <div className="text-5xl mb-4">🏡</div>
      <h2 className="text-2xl font-bold text-dark mb-2">Lawn Listings</h2>
      <p className="text-gray-500">Coming on <span className="text-primary font-semibold">Day 6</span> — Lawn Listing Frontend</p>
    </div>
  </div>
);

export const LawnDetailPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-2xl font-bold text-dark mb-2">Lawn Detail</h2>
      <p className="text-gray-500">Coming on <span className="text-primary font-semibold">Day 6</span> — Lawn Listing Frontend</p>
    </div>
  </div>
);

export const MyBookingsPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center">
      <div className="text-5xl mb-4">📅</div>
      <h2 className="text-2xl font-bold text-dark mb-2">My Bookings</h2>
      <p className="text-gray-500">Coming on <span className="text-primary font-semibold">Day 11</span> — Booking System Frontend</p>
    </div>
  </div>
);

export const ChatPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center">
      <div className="text-5xl mb-4">💬</div>
      <h2 className="text-2xl font-bold text-dark mb-2">Chat</h2>
      <p className="text-gray-500">Coming on <span className="text-primary font-semibold">Day 13</span> — Chat Frontend</p>
    </div>
  </div>
);

export const OwnerDashboardPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center">
      <div className="text-5xl mb-4">📊</div>
      <h2 className="text-2xl font-bold text-dark mb-2">Owner Dashboard</h2>
      <p className="text-gray-500">Coming on <span className="text-primary font-semibold">Day 16</span> — Owner Dashboard</p>
    </div>
  </div>
);

export const AdminPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center">
      <div className="text-5xl mb-4">⚙️</div>
      <h2 className="text-2xl font-bold text-dark mb-2">Admin Panel</h2>
      <p className="text-gray-500">Coming on <span className="text-primary font-semibold">Day 20</span> — Admin Panel</p>
    </div>
  </div>
);

import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
    <div className="max-w-md w-full text-center">
      <div className="text-8xl font-bold text-primary opacity-20 mb-4">404</div>
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-dark mb-2">Page Not Found</h2>
      <p className="text-gray-500 text-sm mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-primary px-8">
          Go Home
        </Link>
        <Link to="/lawns" className="btn-outline px-8">
          Browse Lawns
        </Link>
      </div>
    </div>
  </div>
);