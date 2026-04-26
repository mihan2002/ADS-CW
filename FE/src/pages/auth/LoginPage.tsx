import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/Input";
import {
  GraduationCap,
  Eye,
  EyeOff,
  BarChart3,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Lock,
} from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, devLogin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    if (!password.trim()) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email, password);
      navigate("/");
    } catch {
      // error handled by store toast
    }
  };

  const handleDevLogin = () => {
    devLogin();
    navigate("/");
  };

  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      desc: "Real-time dashboards & data insights",
    },
    {
      icon: Users,
      title: "Alumni Network",
      desc: "Explore & connect with graduates",
    },
    {
      icon: TrendingUp,
      title: "Bidding System",
      desc: "Competitive slot-based auctions",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      desc: "Enterprise-grade data protection",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex" id="login-page">
      {/* ────────────────── Left Panel: Brand Showcase ────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #4338ca 75%, #4f46e5 100%)",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute w-72 h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #818cf8, transparent 70%)",
            top: "10%",
            left: "15%",
            animation: "floatOrb 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #c084fc, transparent 70%)",
            bottom: "5%",
            right: "10%",
            animation: "floatOrb 10s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f472b6, transparent 70%)",
            top: "50%",
            left: "50%",
            animation: "floatOrb 6s ease-in-out infinite",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: Logo & Branding */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="text-white/90 text-xl font-bold tracking-tight">
                UniAnalytics
              </span>
            </div>
            <p className="text-indigo-200/60 text-sm ml-1">
              University Alumni Intelligence Platform
            </p>
          </div>

          {/* Center: Hero Text & Features */}
          <div className="space-y-10">
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                Unlock Alumni
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #a5b4fc, #c084fc, #f9a8d4)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Intelligence
                </span>
              </h2>
              <p className="text-indigo-200/70 text-lg leading-relaxed max-w-md">
                Transform raw alumni data into actionable insights with powerful
                analytics, interactive visualizations, and real-time bidding
                capabilities.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feat, i) => (
                <div
                  key={feat.title}
                  className="animate-fade-in-up rounded-xl p-4 transition-all duration-300 hover:scale-[1.03]"
                  style={{
                    animationDelay: `${0.3 + i * 0.1}s`,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <feat.icon size={20} className="text-indigo-300 mb-2" />
                  <p className="text-white/90 text-sm font-semibold">
                    {feat.title}
                  </p>
                  <p className="text-indigo-200/50 text-xs mt-1">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Testimonial / Trust indicator */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "bg-indigo-400",
                  "bg-violet-400",
                  "bg-fuchsia-400",
                  "bg-pink-400",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${bg} border-2 border-indigo-900 flex items-center justify-center`}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {["JD", "AK", "ML", "SR"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">
                  Trusted by 2,400+ alumni
                </p>
                <p className="text-indigo-200/40 text-xs">
                  Across 15 departments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── Right Panel: Login Form ────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Layered background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Base gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 1) 0%, rgba(2, 6, 23, 1) 100%)",
            }}
          />
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(148, 163, 184, 0.8) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Animated accent glow */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.07), transparent 70%)",
              top: "-15%",
              right: "-10%",
              animation: "floatOrb 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.05), transparent 70%)",
              bottom: "-10%",
              left: "-5%",
              animation: "floatOrb 15s ease-in-out infinite reverse",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="text-center mb-10 lg:hidden animate-fade-in-up">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow:
                  "0 8px 32px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(255,255,255,0.1) inset",
              }}
            >
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-100">
              UniAnalytics
            </h1>
            <p className="text-surface-500 text-sm mt-1">
              University Alumni Intelligence Platform
            </p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8 animate-fade-in-up">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.1)",
              }}
            >
              <Lock size={20} className="text-primary-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1.5 tracking-tight">
              Welcome back
            </h1>
            <p className="text-surface-400 text-[15px] leading-relaxed">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form Card */}
          <div
            className="animate-fade-in-up rounded-2xl p-10 relative"
            style={{
              animationDelay: "0.1s",
              background:
                "linear-gradient(160deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              boxShadow:
                "0 32px 64px -16px rgba(0, 0, 0, 0.5), 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            }}
          >
            {/* Top glow accent on card */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4), transparent)",
              }}
            />

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              id="login-form"
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-surface-300"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl text-[15px] text-white placeholder-surface-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                  }}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-2">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-surface-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 rounded-2xl text-[15px] text-white placeholder-surface-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors cursor-pointer p-1.5"
                    id="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-400 mt-2">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500/30 focus:ring-2 cursor-pointer"
                    id="remember-me"
                  />
                  <span className="text-sm text-surface-400 group-hover:text-surface-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/reset-password"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
                  id="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[15px] font-semibold text-white transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                  boxShadow:
                    "0 8px 24px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow =
                      "0 12px 32px rgba(99, 102, 241, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                id="login-submit-btn"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <>
                    <Lock size={16} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent)",
                  }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-4 text-xs font-medium uppercase tracking-widest"
                  style={{
                    color: "rgba(148, 163, 184, 0.4)",
                    background:
                      "linear-gradient(160deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
                  }}
                >
                  or
                </span>
              </div>
            </div>

            {/* Dev Login Button */}
            <button
              type="button"
              onClick={handleDevLogin}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.06))",
                border: "1px solid rgba(16, 185, 129, 0.18)",
                color: "#6ee7b7",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.12))";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(16, 185, 129, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.06))";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.18)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              id="dev-login-btn"
            >
              <Zap size={15} />
              Quick Dev Access
              <span
                className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.15))",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                }}
              >
                DEV
              </span>
            </button>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-surface-500">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  id="register-link"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom trust indicators */}
          <div
            className="mt-8 animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {[
                { icon: Shield, text: "SSL Encrypted" },
                { icon: Lock, text: "Secure Auth" },
                { icon: Zap, text: "99.9% Uptime" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(30, 41, 59, 0.4)",
                    border: "1px solid rgba(148, 163, 184, 0.06)",
                  }}
                >
                  <item.icon size={12} className="text-surface-500" />
                  <span className="text-[11px] text-surface-500 font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── Keyframe Animations ────────────────── */}
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
