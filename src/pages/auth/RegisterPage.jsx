import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate      = useNavigate();
  const [params]      = useSearchParams();

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    password: "",
    phone:    "",
    role:     params.get("role") === "owner" ? "owner" : "user",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      const data = await register(
        form.name, form.email, form.password, form.role, form.phone
      );
      toast.success(`Account created! Welcome, ${data.user.name} 🎉`);
      if (data.user.role === "owner") navigate("/dashboard/owner");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-dark bg-gray-50">
      {/* Form Section */}
      <div className="w-full lg:w-3/5 xl:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-purple-900/5 p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
            <p className="text-gray-500">Join WeddingLawn today to get started.</p>
          </div>

          {/* Elegant Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">How do you want to use WeddingLawn?</label>
            <div className="grid grid-cols-2 gap-4">
               {/* User Card */}
               <div 
                 onClick={() => setForm(p => ({...p, role: 'user'}))}
                 className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${form.role === 'user' ? 'border-primary bg-purple-50 shadow-md shadow-primary/10 scale-105' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
               >
                 <div className={`text-4xl mb-2 transition-transform duration-300 ${form.role === 'user' ? 'scale-110' : ''}`}>🎉</div>
                 <h3 className={`font-bold ${form.role === 'user' ? 'text-primary' : 'text-gray-700'}`}>Customer</h3>
                 <p className="text-xs text-gray-500 mt-1">Book venues for your event</p>
               </div>
               
               {/* Owner Card */}
               <div 
                 onClick={() => setForm(p => ({...p, role: 'owner'}))}
                 className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${form.role === 'owner' ? 'border-primary bg-purple-50 shadow-md shadow-primary/10 scale-105' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
               >
                 <div className={`text-4xl mb-2 transition-transform duration-300 ${form.role === 'owner' ? 'scale-110' : ''}`}>🏛️</div>
                 <h3 className={`font-bold ${form.role === 'owner' ? 'text-primary' : 'text-gray-700'}`}>Lawn Owner</h3>
                 <p className="text-xs text-gray-500 mt-1">List & manage your venues</p>
               </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">👤</div>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">📞</div>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">✉️</div>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔒</div>
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm" required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors text-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-300 mt-6 flex justify-center items-center gap-2">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Account...
                </>
              ) : "Register"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-primary hover:text-purple-700 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative bg-purple-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-primary/80 z-10"></div>
         <img 
           src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
           alt="Wedding Venue" 
           className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
         />
         <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full">
           <h2 className="text-5xl font-bold mb-6 font-serif leading-tight">Join the finest network of Venues</h2>
           <p className="text-lg text-purple-100 max-w-md">Whether you're celebrating a lifetime moment or hosting unforgettable events, you're in the right place.</p>
         </div>
      </div>
    </div>
  );
};
export default RegisterPage;
