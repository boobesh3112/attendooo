import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wifi, WifiOff, RefreshCw, SignalLow } from "lucide-react";
import { haptics } from "../utils/haptics";

type ConnectionStatus = "online" | "offline" | "poor" | "syncing";

function getConnectionQuality(): "online" | "poor" {
  const conn = (navigator as any).connection;
  if (!conn) return "online";
  const { effectiveType, downlink, rtt } = conn;
  if (effectiveType === "slow-2g" || effectiveType === "2g" || downlink < 0.5 || rtt > 600) {
    return "poor";
  }
  return "online";
}

export function NetworkStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(navigator.onLine ? getConnectionQuality() : "offline");
  const [showBanner, setShowBanner] = useState(false);
  const [showChip, setShowChip] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOnline = useCallback(() => {
    const quality = getConnectionQuality();
    setStatus(quality);
    setShowBanner(true);
    setShowChip(true);
    haptics.success();
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2500);
    setTimeout(() => setShowBanner(false), 4000);
    setTimeout(() => setShowChip(false), 8000);
  }, []);

  const handleOffline = useCallback(() => {
    setStatus("offline");
    setShowBanner(true);
    setShowChip(true);
    haptics.error();
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const conn = (navigator as any).connection;
    const checkQuality = () => {
      if (navigator.onLine) {
        const q = getConnectionQuality();
        setStatus(prev => (prev === "offline" ? prev : q));
      }
    };
    if (conn) conn.addEventListener("change", checkQuality);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (conn) conn.removeEventListener("change", checkQuality);
    };
  }, [handleOnline, handleOffline]);

  const displayStatus = isSyncing ? "syncing" : status;

  const configs = {
    online: { bg: "from-green-500 to-emerald-600", chipBg: "bg-green-500/20 border-green-500/30 text-green-400", Icon: Wifi, label: "Back Online", chipLabel: "Online" },
    offline: { bg: "from-red-500 to-rose-600", chipBg: "bg-red-500/20 border-red-500/30 text-red-400", Icon: WifiOff, label: "No Internet Connection", chipLabel: "Offline" },
    poor: { bg: "from-orange-500 to-amber-600", chipBg: "bg-orange-500/20 border-orange-500/30 text-orange-400", Icon: SignalLow, label: "Poor Connection", chipLabel: "Weak Signal" },
    syncing: { bg: "from-blue-500 to-indigo-600", chipBg: "bg-blue-500/20 border-blue-500/30 text-blue-400", Icon: RefreshCw, label: "Syncing Data...", chipLabel: "Syncing" },
  };

  const cfg = configs[displayStatus];
  const Icon = cfg.Icon;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className={`fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r ${cfg.bg} text-white py-3 px-4 flex items-center justify-center gap-2 shadow-2xl`}
          >
            {isSyncing
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw size={16} /></motion.div>
              : <Icon size={16} />
            }
            <span className="text-sm font-semibold">{cfg.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "offline" && !showBanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-red-700/95 backdrop-blur-sm text-white py-2 px-4 flex items-center justify-center gap-2">
            <WifiOff size={13} />
            <span className="text-xs font-semibold">You are offline — data will sync when reconnected</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChip && (displayStatus !== "online") && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 20 }}
            className={`fixed top-14 right-4 z-[199] flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-sm ${cfg.chipBg}`}
          >
            {isSyncing
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw size={11} /></motion.div>
              : <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-current" />
            }
            {cfg.chipLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
