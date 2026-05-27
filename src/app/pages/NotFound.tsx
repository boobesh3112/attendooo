import { motion } from "motion/react";
import { Link } from "react-router";
import { Home, AlertTriangle } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="glass-strong rounded-3xl p-10 max-w-sm w-full"
      >
        <motion.div
          animate={{ rotate: [-5, 5, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30"
        >
          <AlertTriangle className="text-yellow-400" size={40} />
        </motion.div>
        <h1 className="text-5xl font-bold text-white mb-2">404</h1>
        <p className="text-white/60 mb-8">Page not found. This route doesn&apos;t exist.</p>
        <Link to="/app">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
          >
            <Home size={18} />
            Back to Dashboard
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
