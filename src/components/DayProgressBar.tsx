import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, ChevronRight, Calendar } from "lucide-react";
import { timetableEngine } from "../utils/timetable";
import { format } from "date-fns";

export function DayProgressBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todaySchedule = timetableEngine.getTodaySchedule();

  if (todaySchedule.length === 0) {
    return null;
  }

  // Calculate progress based on time
  const getProgress = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Find first and last class times
    const firstClass = todaySchedule[0];
    const lastClass = todaySchedule[todaySchedule.length - 1];

    if (!firstClass?.startTime || !lastClass?.endTime) return 0;

    const [startH, startM] = firstClass.startTime.split(':').map(Number);
    const [endH, endM] = lastClass.endTime.split(':').map(Number);

    const dayStart = startH * 60 + startM;
    const dayEnd = endH * 60 + endM;

    if (now < dayStart) return 0;
    if (now > dayEnd) return 100;

    return ((now - dayStart) / (dayEnd - dayStart)) * 100;
  };

  const getCurrentPeriod = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (const period of todaySchedule) {
      if (!period.startTime || !period.endTime) continue;

      const [sh, sm] = period.startTime.split(':').map(Number);
      const [eh, em] = period.endTime.split(':').map(Number);
      const s = sh * 60 + sm;
      const e = eh * 60 + em;

      if (now >= s && now < e) {
        return { ...period, status: 'current' };
      }
    }
    return null;
  };

  const getNextPeriod = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (const period of todaySchedule) {
      if (!period.startTime) continue;

      const [sh, sm] = period.startTime.split(':').map(Number);
      const s = sh * 60 + sm;

      if (now < s) {
        const remaining = s - now;
        return { ...period, remainingMinutes: remaining };
      }
    }
    return null;
  };

  const getPastPeriods = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return todaySchedule.filter(period => {
      if (!period.endTime) return false;
      const [eh, em] = period.endTime.split(':').map(Number);
      const e = eh * 60 + em;
      return now > e;
    });
  };

  const progress = getProgress();
  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextPeriod();
  const pastPeriods = getPastPeriods();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-2xl p-6 cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="text-white/70" size={18} />
            <h3 className="text-lg font-semibold text-white">Day Progress</h3>
          </div>
          <span className="text-white/50 text-sm">{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          {/* Background track */}
          <div className="absolute inset-0">
            {todaySchedule.map((period, index) => {
              if (!period.startTime || !period.endTime) return null;

              const firstClass = todaySchedule[0];
              const lastClass = todaySchedule[todaySchedule.length - 1];
              const [dayStartH, dayStartM] = firstClass.startTime.split(':').map(Number);
              const [dayEndH, dayEndM] = lastClass.endTime.split(':').map(Number);
              const dayStart = dayStartH * 60 + dayStartM;
              const dayEnd = dayEndH * 60 + dayEndM;

              const [sh, sm] = period.startTime.split(':').map(Number);
              const [eh, em] = period.endTime.split(':').map(Number);
              const s = sh * 60 + sm;
              const e = eh * 60 + em;

              const left = ((s - dayStart) / (dayEnd - dayStart)) * 100;
              const width = ((e - s) / (dayEnd - dayStart)) * 100;

              return (
                <div
                  key={period.id}
                  className="absolute h-full bg-white/5"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                />
              );
            })}
          </div>

          {/* Animated progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%]"
            style={{
              animation: 'gradientShift 3s ease infinite',
            }}
          />

          {/* Glowing current position indicator */}
          {progress > 0 && progress < 100 && (
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-full w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ left: `${progress}%` }}
            />
          )}
        </div>

        {/* Period indicators */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="text-white/60">
            {todaySchedule[0]?.startTime || '—'}
          </div>
          {currentPeriod && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">{currentPeriod.periodNumber}</span>
            </div>
          )}
          <div className="text-white/60">
            {todaySchedule[todaySchedule.length - 1]?.endTime || '—'}
          </div>
        </div>

        {/* Tap to view details hint */}
        <div className="flex items-center justify-center gap-1 mt-3 text-white/40 text-xs">
          <span>Tap for details</span>
          <ChevronRight size={12} />
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="text-purple-400" size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Today's Progress</h2>
                    <p className="text-white/50 text-xs">{format(currentTime, 'EEE, MMM d')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="glass p-2 rounded-xl text-white hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Current Time */}
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Current Time</span>
                  <span className="text-white font-mono text-xl font-bold">
                    {format(currentTime, 'HH:mm:ss')}
                  </span>
                </div>
              </div>

              {/* Current Period */}
              {currentPeriod && (
                <div className="mb-4">
                  <h3 className="text-white/70 text-sm mb-2 uppercase tracking-wider">Current Period</h3>
                  <div className="glass-strong rounded-2xl p-4 border-2 border-green-500/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-bold text-lg">{currentPeriod.subjectName}</p>
                        <p className="text-white/60 text-sm">{currentPeriod.subjectCode}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-500/20 rounded-full">
                        <span className="text-green-400 text-xs font-medium">{currentPeriod.periodNumber}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>Faculty:</span>
                        <span className="text-white">{currentPeriod.facultyName} {currentPeriod.facultyGender}</span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Time:</span>
                        <span className="text-white">{currentPeriod.startTime} - {currentPeriod.endTime}</span>
                      </div>
                      {currentPeriod.classroom && (
                        <div className="flex justify-between text-white/70">
                          <span>Room:</span>
                          <span className="text-white">{currentPeriod.classroom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Period */}
              {nextPeriod && (
                <div className="mb-4">
                  <h3 className="text-white/70 text-sm mb-2 uppercase tracking-wider">Next Period</h3>
                  <div className="glass rounded-2xl p-4 border border-orange-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-bold">{nextPeriod.subjectName}</p>
                        <p className="text-white/60 text-sm">{nextPeriod.subjectCode}</p>
                      </div>
                      <div className="px-3 py-1 bg-orange-500/20 rounded-full">
                        <span className="text-orange-400 text-xs font-medium">{nextPeriod.periodNumber}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>Starts in:</span>
                        <span className="text-orange-400 font-medium">
                          {Math.floor((nextPeriod.remainingMinutes || 0) / 60)}h {(nextPeriod.remainingMinutes || 0) % 60}m
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Faculty:</span>
                        <span className="text-white">{nextPeriod.facultyName} {nextPeriod.facultyGender}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Periods */}
              {pastPeriods.length > 0 && (
                <div>
                  <h3 className="text-white/70 text-sm mb-2 uppercase tracking-wider">
                    Completed ({pastPeriods.length})
                  </h3>
                  <div className="space-y-2">
                    {pastPeriods.map((period) => (
                      <div
                        key={period.id}
                        className="glass rounded-xl p-3 flex items-center gap-3 opacity-60"
                        style={{ borderLeft: `3px solid ${period.color || '#8b5cf6'}` }}
                      >
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white/70 text-xs font-medium">{period.periodNumber}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{period.subjectName}</p>
                          <p className="text-white/50 text-xs">{period.startTime} - {period.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!currentPeriod && !nextPeriod && pastPeriods.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No periods scheduled</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
