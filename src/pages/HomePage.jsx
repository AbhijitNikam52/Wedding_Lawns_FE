import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLawns } from "../services/lawnService";
import LawnCard from "../components/ui/LawnCard";
import Spinner  from "../components/ui/Spinner";

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetchLawns({ limit: 6 })
      .then((data) => setFeatured(data.lawns))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-dark via-primary to-purple-900 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          💍 Book Your Dream{" "}
          <span className="text-secondary">Wedding Lawn</span>
        </h1>
        <p className="text-lg text-purple-200 mb-8 max-w-xl mx-auto">
          Discover beautiful venues, check real-time availability, chat with
          owners, and book securely — all in one place.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/lawns" className="btn-primary text-lg px-8 py-3">
            Browse All Lawns
          </Link>
          <Link
            to="/register?role=owner"
            className="border-2 border-white text-white font-semibold text-lg px-8 py-3 rounded-lg hover:bg-white hover:text-dark transition-all"
          >
            List Your Lawn
          </Link>
        </div>
      </section>

      {/* ── Featured Lawns ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-dark">Featured Venues</h2>
            <p className="text-gray-500 text-sm mt-1">
              Top-rated wedding lawns available for booking
            </p>
          </div>
          <Link to="/lawns" className="btn-outline text-sm">
            View All →
          </Link>
        </div>

        {loading ? (
          <Spinner text="Loading venues..." />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((lawn) => (
              <LawnCard key={lawn._id} lawn={lawn} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-purple-50 rounded-2xl">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="text-lg font-bold text-dark mb-2">
              No venues listed yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Be the first to list your lawn on WeddingLawn!
            </p>
            <Link to="/register?role=owner" className="btn-primary">
              Register as Owner
            </Link>
          </div>
        )}
      </section>

      {/* ── Why Us ───────────────────────────────────────── */}
      <section className="bg-purple-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-dark mb-10">
            Why Choose WeddingLawn?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "📸", title: "Real Photos",          desc: "Browse high-quality photos of every venue before you visit." },
              { icon: "📅", title: "Live Availability",    desc: "See exactly which dates are free — no more calling to check." },
              { icon: "💬", title: "Chat with Owners",     desc: "Ask questions directly via real-time chat before booking." },
              { icon: "💳", title: "Secure Payments",      desc: "Pay safely via UPI, cards, or net banking with Razorpay." },
              { icon: "🔔", title: "Instant Confirmation", desc: "Get email confirmation as soon as your booking is accepted." },
              { icon: "⭐", title: "Verified Venues",      desc: "All lawns are reviewed and approved by our team." },
            ].map((f) => (
              <div key={f.title} className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-dark mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="bg-dark text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-3">
          Own a Lawn? <span className="text-secondary">Start Earning Today</span>
        </h2>
        <p className="text-purple-200 mb-8 max-w-md mx-auto">
          List your venue, set your price, manage bookings — all from one dashboard.
        </p>
        <Link
          to="/register?role=owner"
          className="bg-secondary text-dark font-bold px-10 py-3 rounded-lg text-lg hover:opacity-90 transition-all inline-block"
        >
          Register as Owner →
        </Link>
      </section>
    </div>
  );
};

export default HomePage;