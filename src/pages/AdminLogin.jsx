import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "../data/supabase";

// Fallback credentials if Supabase is unreachable
const FALLBACK_USER = "admin";
const FALLBACK_PASS = "greeno2024";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [shake,     setShake]     = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Try to get credentials from Supabase settings
      const { data, error: dbErr } = await supabase
        .from("settings")
        .select("admin_username, admin_password")
        .eq("id", 1)
        .single();

      let validUser, validPass;

      if (dbErr || !data?.admin_username) {
        // Fallback to hardcoded defaults
        validUser = FALLBACK_USER;
        validPass = FALLBACK_PASS;
      } else {
        validUser = data.admin_username;
        validPass = data.admin_password;
      }

      if (username.trim() === validUser && password === validPass) {
        // Store session in sessionStorage (cleared when tab closes)
        sessionStorage.setItem("greeno_admin", "1");
        navigate("/owner");
      } else {
        setError("Incorrect username or password.");
        triggerShake();
      }
    } catch (_) {
      // Network error — fallback
      if (username.trim() === FALLBACK_USER && password === FALLBACK_PASS) {
        sessionStorage.setItem("greeno_admin", "1");
        navigate("/owner");
      } else {
        setError("Incorrect username or password.");
        triggerShake();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E0D4",
    color: "#1F2A1E",
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center"
      style={{ backgroundColor: "#EFEBE1", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-sm min-h-screen flex flex-col justify-center px-8"
        style={{ backgroundColor: "#FAF7F0" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#1F2A1E" }}
          >
            <Leaf className="w-9 h-9 text-white" strokeWidth={2} />
          </div>
          <h1
            className="text-4xl font-bold mb-1"
            style={{ color: "#1F2A1E", fontFamily: "'Fraunces', serif", letterSpacing: "-0.01em" }}
          >
            greenó
          </h1>
          <p className="text-xs font-bold tracking-[0.2em]" style={{ color: "#A39B86" }}>
            OWNER ACCESS
          </p>
        </div>

        {/* Card */}
        <div
          className={`rounded-3xl p-6 flex flex-col gap-4 transition-all ${shake ? "animate-shake" : ""}`}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E0D4",
            transform: shake ? "translateX(0)" : undefined,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4" style={{ color: "#A39B86" }} strokeWidth={2.5} />
            <p className="text-xs font-bold tracking-[0.15em]" style={{ color: "#A39B86" }}>
              SIGN IN
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: "#6B6557" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              placeholder="Enter username"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{
                ...inputStyle,
                border: error ? "1px solid #D98B5F" : "1px solid #E4E0D4",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: "#6B6557" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKey}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11 transition-colors"
                style={{
                  ...inputStyle,
                  border: error ? "1px solid #D98B5F" : "1px solid #E4E0D4",
                }}
              />
              <button
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center"
                tabIndex={-1}
              >
                {showPass
                  ? <EyeOff className="w-4 h-4" style={{ color: "#A39B86" }} strokeWidth={2} />
                  : <Eye    className="w-4 h-4" style={{ color: "#A39B86" }} strokeWidth={2} />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs font-bold text-center py-2 px-3 rounded-xl"
              style={{ backgroundColor: "#FFF3EE", color: "#D98B5F" }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white mt-1 transition-opacity"
            style={{
              backgroundColor: "#1F2A1E",
              fontFamily: "'Fraunces', serif",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#C9C4B8" }}>
          greenó · Owner Dashboard
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
}
