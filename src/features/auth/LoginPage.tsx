import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(
        error.message || "Failed to sign in. Please verify your credentials.",
      );
      setLoading(false);
    } else {
      toast.success("Successfully logged in!");
      // Apply scale fade-out transition by introducing a tiny delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 400);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Brand & Story Panel (Left) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-primary via-[#2b8a3e] to-[#1c7ed6] text-white p-12 flex-col justify-between relative overflow-hidden select-none">
        {/* Background elements for abstract layout */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#6741d9]/10 rounded-full blur-3xl"></div>

        {/* Logo / Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg transform rotate-6">
            <span className="text-primary font-black text-xl">🌱</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">EcoSphere</span>
        </div>

        {/* Hero Content */}
        <div className="my-auto max-w-lg z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white m-0 text-left">
            ESG data, employee action and gamified engagement — in one system of
            record.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed text-left font-light">
            EcoSphere turns carbon accounting and corporate social
            responsibility into a real-time, explainable workspace employees
            participate in every day.
          </p>
        </div>

        {/* Live Stat Strip */}
        <div className="z-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-xl">
          <div className="grid grid-cols-3 gap-6 text-center divide-x divide-white/15">
            <div>
              <p className="text-2xl font-black text-white">482.6t</p>
              <p className="text-xs text-white/70 font-medium uppercase tracking-wider mt-1">
                CO₂e Tracked
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">78/100</p>
              <p className="text-xs text-white/70 font-medium uppercase tracking-wider mt-1">
                ESG Score
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">340+</p>
              <p className="text-xs text-white/70 font-medium uppercase tracking-wider mt-1">
                Engaged Team
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-base">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo mobile-only */}
          <div className="flex lg:hidden items-center justify-center space-x-2 mb-8">
            <span className="text-3xl">🌱</span>
            <span className="text-2xl font-bold text-text-primary">
              EcoSphere
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
              Sign In
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Access your department ESG scoreboard and rewards catalog
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2"
                >
                  Work Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot"
                    className="text-xs font-semibold text-governance hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-primary hover:bg-[#2b8a3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] shadow-md shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-8 pt-6 border-t border-border bg-surface/50 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
              Quick demo accounts:
            </h4>
            <div className="space-y-2 text-xs text-text-secondary">
              <p>
                🌱 <strong>Admin:</strong>{" "}
                <code className="bg-base border border-border px-1 py-0.5 rounded">
                  priya@ecosphere.com
                </code>{" "}
                (pass:{" "}
                <code className="bg-base border border-border px-1 py-0.5 rounded">
                  password123
                </code>
                )
              </p>
              <p>
                👥 <strong>Dept Head:</strong>{" "}
                <code className="bg-base border border-border px-1 py-0.5 rounded">
                  meera@ecosphere.com
                </code>{" "}
                (pass:{" "}
                <code className="bg-base border border-border px-1 py-0.5 rounded">
                  password123
                </code>
                )
              </p>
              <p>
                🏆 <strong>Employee:</strong>{" "}
                <code className="bg-base border border-border px-1 py-0.5 rounded">
                  raj@ecosphere.com
                </code>{" "}
                (pass:{" "}
                <code className="bg-base border border-border px-1 py-0.5 rounded">
                  password123
                </code>
                )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
