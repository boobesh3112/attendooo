import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Lock, Fingerprint, Hash, Scan } from "lucide-react";
import { toast } from "sonner";
import { faceAuth } from "../utils/faceAuth";
import { sounds } from "../utils/sounds";
import { haptics } from "../utils/haptics";

type LoginMethod = "password" | "pin" | "fingerprint" | "face";

export function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [faceAuthAvailable, setFaceAuthAvailable] = useState(false);
  const [faceAuthLoading, setFaceAuthLoading] = useState(false);

  useEffect(() => {
    checkFaceAuthAvailability();
  }, []);

  const checkFaceAuthAvailability = async () => {
    const supported = await faceAuth.isSupported();
    setFaceAuthAvailable(supported);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.password === password) {
      toast.success("Login successful!");
      const hasSetup = localStorage.getItem("setupComplete");
      navigate(hasSetup ? "/app" : "/setup");
    } else {
      toast.error("Invalid password");
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPin = localStorage.getItem("userPin");

    if (savedPin === pin) {
      toast.success("Login successful!");
      const hasSetup = localStorage.getItem("setupComplete");
      navigate(hasSetup ? "/app" : "/setup");
    } else {
      toast.error("Invalid PIN");
    }
  };

  const handleFingerprintLogin = async () => {
    toast.info("Fingerprint authentication not available in web browsers. Use password or PIN.");
  };

  const handleFaceLogin = async () => {
    setFaceAuthLoading(true);
    sounds.playClick();
    haptics.medium();

    try {
      const result = await faceAuth.authenticate();

      if (result.success) {
        toast.success("Face authentication successful!");
        sounds.playSuccess();
        haptics.success();
        const hasSetup = localStorage.getItem("setupComplete");
        navigate(hasSetup ? "/app" : "/setup");
      } else {
        toast.error(result.error || "Face authentication failed");
        sounds.playError();
        haptics.error();
      }
    } catch (error: any) {
      toast.error("Face authentication error: " + (error.message || "Unknown error"));
      sounds.playError();
      haptics.error();
    } finally {
      setFaceAuthLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Background particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2 text-center"
        >
          Welcome Back
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/70 text-center mb-8"
        >
          Login to your account
        </motion.p>

        {/* Login method selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`grid gap-3 mb-8 ${faceAuthAvailable ? "grid-cols-2" : "grid-cols-2"}`}
        >
          <button
            onClick={() => setLoginMethod("password")}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ripple ${
              loginMethod === "password" ? "bg-white text-purple-600" : "glass text-white/70"
            }`}
          >
            <Lock size={18} />
            <span className="text-sm font-medium">Password</span>
          </button>

          <button
            onClick={() => setLoginMethod("pin")}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ripple ${
              loginMethod === "pin" ? "bg-white text-purple-600" : "glass text-white/70"
            }`}
          >
            <Hash size={18} />
            <span className="text-sm font-medium">PIN</span>
          </button>

          <button
            onClick={() => setLoginMethod("face")}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ripple ${
              loginMethod === "face" ? "bg-white text-purple-600" : "glass text-white/70"
            }`}
          >
            <Scan size={18} />
            <span className="text-sm font-medium">Face ID</span>
          </button>

          <button
            onClick={() => {
              setLoginMethod("fingerprint");
              handleFingerprintLogin();
            }}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ripple ${
              loginMethod === "fingerprint" ? "bg-white text-purple-600" : "glass text-white/70"
            }`}
          >
            <Fingerprint size={18} />
            <span className="text-sm font-medium">Touch ID</span>
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {loginMethod === "password" && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePasswordLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-white/90 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all ripple"
              >
                Login
              </motion.button>
            </motion.form>
          )}

          {loginMethod === "pin" && (
            <motion.form
              key="pin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePinLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-white/90 mb-2 text-center">Enter 4-Digit PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass text-white text-center text-2xl tracking-widest placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="••••"
                />
                <p className="text-white/60 text-xs text-center mt-2">
                  {!localStorage.getItem("userPin")
                    ? "Set up your PIN in Profile settings"
                    : `${pin.length}/4 digits`}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={pin.length !== 4}
                className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all ripple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login with PIN
              </motion.button>
            </motion.form>
          )}

          {loginMethod === "fingerprint" && (
            <motion.div
              key="fingerprint"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center"
              >
                <Fingerprint size={64} className="text-white" />
              </motion.div>
              <p className="text-white/80">
                Fingerprint authentication is not available in web browsers
              </p>
              <p className="text-white/60 text-sm mt-2">
                Please use Password or PIN to login
              </p>
            </motion.div>
          )}

          {loginMethod === "face" && (
            <motion.div
              key="face"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                animate={faceAuthLoading ? { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] } : { scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 mx-auto mb-6 relative"
              >
                {/* Animated scan ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{ borderTopColor: "rgba(139,92,246,0.8)", borderRightColor: "rgba(236,72,153,0.4)" }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent"
                  style={{ borderTopColor: "rgba(236,72,153,0.6)" }}
                />
                <div className="absolute inset-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <Scan size={48} className="text-white" />
                </div>
              </motion.div>

              {faceAuthLoading ? (
                <div>
                  <p className="text-white font-semibold mb-2 text-lg">Scanning Face...</p>
                  <p className="text-white/60 text-sm">Hold still, looking at camera</p>
                  <div className="flex justify-center gap-1 mt-4">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div key={i} animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                        className="w-2 h-2 bg-purple-400 rounded-full" />
                    ))}
                  </div>
                </div>
              ) : !faceAuth.isEnabled() ? (
                <div>
                  <p className="text-white font-semibold mb-2">Face ID Not Set Up</p>
                  <p className="text-white/60 text-sm mb-6">Register your face from Profile &rarr; Security settings first</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleFaceLogin}
                    className="px-6 py-3 glass text-white/70 rounded-xl font-medium text-sm border border-white/20">
                    Try Anyway (Register Face)
                  </motion.button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-semibold mb-2 text-lg">Face ID Authentication</p>
                  <p className="text-white/60 text-sm mb-6">Position your face in front of the camera</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleFaceLogin}
                    className="px-8 py-3.5 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg">
                    Start Face Scan
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/70 mt-6"
        >
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-white font-semibold hover:underline"
          >
            Sign Up
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
