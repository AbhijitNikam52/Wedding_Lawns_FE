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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-10">
      <div className="card w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💍</div>
          <h1 className="text-2xl font-bold text-dark">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join WeddingLawn today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
          {["user", "owner"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: r }))}
              className={`flex-1 py-2 text-sm font-semibold transition-all ${
                form.role === r
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-purple-50"
              }`}
            >
              {r === "user" ? "👤 I want to Book" : "🏡 I own a Lawn"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="Your full name" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+91 9876543210" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Min 6 characters" className="input-field" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
