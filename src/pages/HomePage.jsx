import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLawns } from "../services/lawnService";
import LawnCard from "../components/ui/LawnCard";
import Spinner  from "../components/ui/Spinner";

const slides = [
  {
    title: "Book Your Dream Wedding Lawn",
    subtitle: "Discover luxurious venues tailored for an unforgettable lifetime moment.",
    image: "/images/wedding.png"
  },
  {
    title: "Host Majestic Birthday Parties",
    subtitle: "Vibrant and spectacular outdoor lawns to celebrate with friends and family.",
    image: "/images/birthday.png"
  },
  {
    title: "Elegant Corporate Events",
    subtitle: "Professional setups and massive manicured lawns for your company gatherings.",
    image: "/images/corporate.png"
  }
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchLawns({ limit: 6 })
      .then((data) => setFeatured(data.lawns))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Dynamic Hero Slideshow ─────────────────────────────────────────── */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-gray-900 group">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            {/* Slide Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-sm font-semibold tracking-wider uppercase mb-6 shadow-lg border border-white/20">
                Premium Venues
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif max-w-4xl leading-tight drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl drop-shadow-md">
                {slide.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/lawns"
                  className="bg-primary text-white text-lg font-bold px-10 py-4 rounded-xl shadow-xl shadow-primary/40 hover:bg-white hover:text-primary transition-all duration-300 transform hover:-translate-y-1"
                >
                  Browse All Lawns
                </Link>
                <Link
                  to="/register?role=owner"
                  className="bg-white/10 backdrop-blur-md border border-white/30 hover:border-white text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/20"
                >
                  List Your Lawn
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-primary w-8 shadow-md" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Featured Lawns ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20 relative z-20 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-purple-50">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Discover</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-dark mt-1 font-serif">Featured Venues</h2>
            </div>
            <Link to="/lawns" className="text-sm font-bold text-primary hover:text-purple-800 transition-colors hidden sm:block">
              View All Locations →
            </Link>
          </div>

          {loading ? (
            <div className="py-20"><Spinner text="Loading premium venues..." /></div>
          ) : featured.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {featured.map((lawn) => (
                  <LawnCard key={lawn._id} lawn={lawn} />
                ))}
              </div>
              <div className="text-center sm:hidden mt-6">
                <Link to="/lawns" className="text-sm font-bold text-primary hover:underline">
                  View All Locations →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-purple-50 rounded-2xl border border-dashed border-primary/30">
              <div className="text-6xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-dark mb-2">
                No venues listed yet
              </h3>
              <p className="text-gray-500 text-sm mb-8">
                Be the first to list your amazing lawn on WeddingLawn!
              </p>
              <Link to="/register?role=owner" className="btn-primary py-3 px-8 text-lg hover:shadow-lg hover:shadow-primary/30">
                Register as Owner
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Benefits</span>
            <h2 className="text-4xl font-bold text-dark mt-2 font-serif">
              Why Choose WeddingLawn?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📸", title: "Immersive Previews",   desc: "Browse high-definition photos of every beautifully manicured venue." },
              { icon: "📅", title: "Live Availability",    desc: "Instantly see guaranteed open dates — completely bypass the waiting game." },
              { icon: "💬", title: "Direct Chat",          desc: "Connect seamlessly with verified lawn owners in real time." },
              { icon: "💳", title: "Secure Transactions",  desc: "100% encrypted & protected payments via UPI, Cards, or Net Banking." },
              { icon: "⚡", title: "Instant Booking",      desc: "Get digital confirmations the second your venue approves." },
              { icon: "⭐", title: "Curated Selection",    desc: "Every single lawn is handpicked, vetted, and verified by our experts." },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Elegant CTA Banner ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-dark to-purple-900 rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10 p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif leading-tight">
                Own a spectacular venue? <br />
                <span className="text-secondary">Maximize your bookings.</span>
              </h2>
              <p className="text-lg text-purple-100 mb-0">
                Join our exclusive network. List your beautiful lawn, manage your calendar effortlessly, and connect instantly with thousands of customers planning their special day.
              </p>
            </div>
            <Link
              to="/register?role=owner"
              className="whitespace-nowrap bg-secondary text-dark font-bold px-10 py-5 rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(194,219,30,0.6)] hover:bg-white transition-all duration-300 transform hover:-translate-y-1"
            >
              List Venue Today →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;