import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Edit,
  Phone,
  X,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  MessageCircle,
  Sparkles,
  BarChart3,
  Database,
  Activity,
  Camera,
} from "lucide-react";
import { generateInsights } from "../utils/insights";
import { DailyQuote } from "../components/DailyQuote";
import { LiveAttendanceCounter, CurrentPeriodProgress } from "../components/LiveCounter";
import { CurrentClassCard } from "../components/CurrentClassCard";
import { DayProgressBar } from "../components/DayProgressBar";
import { timetableEngine } from "../utils/timetable";
import { storage } from "../utils/storage";
import { sounds } from "../utils/sounds";
import { haptics } from "../utils/haptics";
import { format } from "date-fns";
import { Link } from "react-router";

// Safe localStorage helpers
const safeGetItem = (key: string, fallback = "{}") => {
  try { return JSON.parse(localStorage.getItem(key) || fallback); } catch { return JSON.parse(fallback); }
};

const DEFAULT_PERIODS = [
  { period: "1", start: "08:40", end: "09:30" },
  { period: "2", start: "09:30", end: "10:20" },
  { period: "3", start: "10:40", end: "11:30" },
  { period: "4", start: "11:30", end: "12:20" },
  { period: "5", start: "13:25", end: "14:10" },
  { period: "6", start: "14:10", end: "14:55" },
  { period: "7", start: "15:10", end: "15:55" },
  { period: "8", start: "15:55", end: "16:40" },
];

export function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  const setupData = safeGetItem("setupData");
  const user = safeGetItem("user");
  const students = storage.getStudents();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setInsights(generateInsights());
  }, []);

  const getGreeting = useCallback(() => {
    const h = currentTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    if (h < 21) return "Good Evening";
    return "Good Night";
  }, [currentTime]);

  const getCurrentClass = useCallback(() => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    for (const p of DEFAULT_PERIODS) {
      const [sh, sm] = p.start.split(":").map(Number);
      const [eh, em] = p.end.split(":").map(Number);
      const s = sh * 60 + sm, e = eh * 60 + em;
      if (now >= s && now < e) return { ...p, status: "ongoing", remainingMinutes: e - now };
    }
    for (const p of DEFAULT_PERIODS) {
      const [sh, sm] = p.start.split(":").map(Number);
      const s = sh * 60 + sm;
      if (now < s) return { ...p, status: "upcoming", remainingMinutes: s - now };
    }
    return { period: "None", status: "ended", start: "", end: "", remainingMinutes: 0 };
  }, [currentTime]);

  const currentClass = getCurrentClass();
  const totalStudents = students.length || 0;
  const todayKey = format(currentTime, "yyyy-MM-dd");
  const todayAttendanceData = storage.getAttendance(todayKey);
  const todayRecords = todayAttendanceData?.records || [];
  const present = todayRecords.filter((r: any) => r.status === "present").length;
  const absent = todayRecords.filter((r: any) => r.status === "absent").length;
  const onDuty = todayRecords.filter((r: any) => r.status === "onduty").length;
  const strengthPercentage = totalStudents > 0 && todayRecords.length > 0
    ? Math.round(((present + onDuty) / totalStudents) * 100)
    : 0;

  // Real attendance data from storage
  const allAttendance = storage.getAttendance();
  const allDates = Object.keys(allAttendance).sort().slice(-30);
  const avgAttendance = allDates.length > 0
    ? Math.round(allDates.reduce((sum, date) => {
        const recs = allAttendance[date]?.records || [];
        const p = recs.filter((r: any) => r.status === "present" || r.status === "onduty").length;
        return sum + (totalStudents > 0 ? (p / totalStudents) * 100 : 0);
      }, 0) / allDates.length)
    : 0;

  // Low attendance (real data)
  const realLowStudents = students.filter((s: any) => {
    let p = 0, t = 0;
    Object.values(allAttendance).forEach((d: any) => {
      if (d.records) {
        const r = d.records.find((r: any) => r.studentId === s.id);
        if (r) { t++; if (r.status === "present" || r.status === "onduty") p++; }
      }
    });
    return t > 3 && p / t < 0.75;
  });

  const weeklyData = [
    { name: "w-mon", day: "Mon", attendance: 88 },
    { name: "w-tue", day: "Tue", attendance: 92 },
    { name: "w-wed", day: "Wed", attendance: 85 },
    { name: "w-thu", day: "Thu", attendance: 90 },
    { name: "w-fri", day: "Fri", attendance: 87 },
    { name: "w-sat", day: "Sat", attendance: 84 },
  ];

  const monthlyData = [
    { name: "m-w1", month: "Week 1", avg: 88 },
    { name: "m-w2", month: "Week 2", avg: 90 },
    { name: "m-w3", month: "Week 3", avg: 85 },
    { name: "m-w4", month: "Week 4", avg: 92 },
  ];

  const recentActivity = [
    { action: "Marked attendance for Period 3", time: "2 hours ago" },
    { action: "Added new student: Alex Kumar", time: "5 hours ago" },
    { action: "Generated monthly report", time: "1 day ago" },
  ];

  const notificationCount = 2 + (realLowStudents.length > 0 ? 1 : 0);

  const avatarPhoto = user.profilePhoto || null;
  const avatarLetter = user.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24">
      {/* Top Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-3">
          {/* Edit / Pen icon → opens Edit Profile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowEditProfile(true); sounds.playClick(); haptics.light(); }}
            className="glass p-3 rounded-xl text-white hover:bg-white/20 transition-all"
            aria-label="Edit profile"
          >
            <Edit size={20} />
          </motion.button>

          {/* Bell icon → opens Notification Center */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowNotifications(true); sounds.playClick(); haptics.light(); }}
            className="glass p-3 rounded-xl text-white hover:bg-white/20 transition-all relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold"
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Greeting Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          {avatarPhoto ? (
            <img src={avatarPhoto} alt="avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold ring-2 ring-white/20 flex-shrink-0">
              {avatarLetter}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white mb-0.5">{getGreeting()}</h2>
            <p className="text-white/80 text-base mb-3">{user.name || "Class Representative"}</p>
            <div className="space-y-0.5 text-white/60 text-sm">
              <p>{[setupData.department, setupData.branch].filter(Boolean).join(" - ") || "—"}</p>
              <p>
                {setupData.semester ? `Sem ${setupData.semester}` : ""}
                {setupData.year ? ` • ${setupData.year} Year` : ""}
                {setupData.section ? ` • Section ${setupData.section}` : ""}
              </p>
              {setupData.className && <p className="font-medium text-white">{setupData.className}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current Class Card */}
      <CurrentClassCard />

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-strong rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Today&apos;s Schedule</h3>
          <Link to="/app/timetable" className="text-purple-400 text-sm font-medium hover:text-purple-300">
            View Full
          </Link>
        </div>

        <div className="space-y-2">
          {timetableEngine.getTodaySchedule().slice(0, 5).map((period: any) => (
            <div
              key={period.id}
              className="glass p-3 rounded-xl flex items-center gap-3"
              style={{ borderLeft: `3px solid ${period.color || "#8b5cf6"}` }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">{period.periodNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{period.subjectName}</p>
                <p className="text-white/50 text-xs">{period.facultyName} {period.facultyGender}</p>
              </div>
              <p className="text-white/50 text-xs">{period.startTime}</p>
            </div>
          ))}
          {timetableEngine.getTodaySchedule().length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-white/30 mx-auto mb-2" />
              <p className="text-white/50 text-sm">No classes scheduled</p>
              <Link to="/app/timetable" className="text-purple-400 text-sm font-medium hover:text-purple-300 mt-2 inline-block">
                Setup Timetable
              </Link>
            </div>
          )}
        </div>

        {timetableEngine.getTodaySchedule().length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-white/50 text-xs mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{timetableEngine.getCompletedClassesToday()}</p>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-xs mb-1">Remaining</p>
              <p className="text-2xl font-bold text-orange-400">{timetableEngine.getRemainingClassesToday()}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Day Progress Bar */}
      <DayProgressBar />

      {/* Daily Quote */}
      <DailyQuote />

      {/* Live Counters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <LiveAttendanceCounter />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl p-4"
        >
          <p className="text-white/60 text-xs mb-2">Total Students</p>
          <p className="text-4xl font-bold text-white">{totalStudents}</p>
          <p className="text-white/50 text-xs mt-1">Class Strength</p>
        </motion.div>
      </motion.div>

      {/* Current Period Progress */}
      <CurrentPeriodProgress />

      {/* Live Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => currentClass.status === "ongoing" && setShowClassDetails(true)}
        className={`glass-strong rounded-2xl p-6 transition-all ${currentClass.status === "ongoing" ? "cursor-pointer hover:bg-white/10" : ""}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-green-400 rounded-full"
            />
            <h3 className="text-lg font-semibold text-white">Live Status</h3>
          </div>
          <Clock className="text-white/50" size={20} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/50 text-sm mb-1">Date & Time</p>
            <p className="text-white font-medium">{format(currentTime, "EEE, MMM d")}</p>
            <p className="text-white/80 text-lg font-mono">{format(currentTime, "HH:mm:ss")}</p>
          </div>
          <div>
            <p className="text-white/50 text-sm mb-1">Current Class</p>
            {currentClass.status === "ongoing" ? (
              <>
                <p className="text-white font-medium text-lg">Period {currentClass.period}</p>
                <p className="text-green-400 text-sm">
                  {Math.floor(currentClass.remainingMinutes / 60)}h {currentClass.remainingMinutes % 60}m remaining
                </p>
              </>
            ) : currentClass.status === "upcoming" ? (
              <>
                <p className="text-white font-medium">Period {currentClass.period}</p>
                <p className="text-yellow-400 text-sm">
                  Starts in {Math.floor(currentClass.remainingMinutes / 60)}h {currentClass.remainingMinutes % 60}m
                </p>
              </>
            ) : (
              <p className="text-white/40">Classes Ended</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Attendance Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-lg font-semibold text-white mb-3">Today&apos;s Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total Students" value={totalStudents} color="bg-blue-500" delay={0} />
          <StatCard icon={CheckCircle} label="Present" value={todayRecords.length > 0 ? present : "—"} color="bg-green-500" delay={0.1} />
          <StatCard icon={XCircle} label="Absent" value={todayRecords.length > 0 ? absent : "—"} color="bg-red-500" delay={0.2} />
          <StatCard icon={TrendingUp} label={todayRecords.length > 0 ? "Strength" : "30-Day Avg"}
            value={todayRecords.length > 0 ? `${strengthPercentage}%` : avgAttendance > 0 ? `${avgAttendance}%` : "—"}
            color={strengthPercentage >= 80 || avgAttendance >= 80 ? "bg-green-500" : strengthPercentage >= 50 || avgAttendance >= 50 ? "bg-yellow-500" : "bg-red-500"}
            delay={0.3} />
        </div>
        {/* Avg attendance mini widget */}
        {avgAttendance > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4 mt-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-white/60 text-xs">30-Day Avg Attendance</span>
                <span className={`text-xs font-bold ${avgAttendance >= 75 ? "text-green-400" : avgAttendance >= 50 ? "text-yellow-400" : "text-red-400"}`}>{avgAttendance}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${avgAttendance}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${avgAttendance >= 75 ? "bg-green-400" : avgAttendance >= 50 ? "bg-yellow-400" : "bg-red-400"}`} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">{allDates.length} days tracked</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Attendance</h3>
          <div className="space-y-3">
            {weeklyData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{item.day}</span>
                  <span className="text-white font-semibold">{item.attendance}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.attendance}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Average</h3>
          <div className="space-y-3">
            {monthlyData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{item.month}</span>
                  <span className="text-white font-semibold">{item.avg}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.avg}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton icon={CheckCircle} label="Mark Attendance" href="/app/mark" />
          <QuickActionButton icon={Users} label="Students List" href="/app/students" />
          <QuickActionButton icon={BarChart3} label="Reports" href="/app/analytics" />
          <QuickActionButton icon={Calendar} label="Settings" href="/app/profile" />
        </div>
      </motion.div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-6 border-2 border-purple-500/30"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-3 bg-purple-500/10 rounded-xl"
              >
                <p className="text-white text-sm">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Low Attendance Alert (real data) */}
      {realLowStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-5 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" size={20} />
              <h3 className="text-base font-semibold text-white">Low Attendance Alert</h3>
            </div>
            <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">{realLowStudents.length} students</span>
          </div>
          <div className="space-y-2">
            {realLowStudents.slice(0, 5).map((student: any, index: number) => {
              let p = 0, t = 0;
              Object.values(allAttendance).forEach((d: any) => {
                if (d.records) {
                  const r = d.records.find((r: any) => r.studentId === student.id);
                  if (r) { t++; if (r.status === "present" || r.status === "onduty") p++; }
                }
              });
              const pct = t > 0 ? Math.round((p / t) * 100) : 0;
              return (
                <motion.div key={student.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * index }}
                  className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {student.name?.charAt(0)}
                  </div>
                  <span className="text-white text-sm flex-1">{student.name}</span>
                  <div className="text-right">
                    <span className="text-red-400 font-bold text-sm">{pct}%</span>
                    <p className="text-white/30 text-xs">{p}/{t} classes</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-strong rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-white/40 text-xs">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Modals ── */}

      {/* Notification Center */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenterModal
            onClose={() => setShowNotifications(false)}
            students={students}
          />
        )}
      </AnimatePresence>

      {/* Edit Profile (from Home) */}
      <AnimatePresence>
        {showEditProfile && (
          <HomeEditProfileModal onClose={() => setShowEditProfile(false)} />
        )}
      </AnimatePresence>

      {/* Class Details Modal */}
      <AnimatePresence>
        {showClassDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClassDetails(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Period {currentClass.period}</h2>
                <button onClick={() => setShowClassDetails(false)} className="glass p-2 rounded-xl text-white hover:bg-white/20">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <InfoRow label="Subject" value="Data Structures" />
                <InfoRow label="Subject Code" value="CS301" />
                <InfoRow label="Time" value={`${currentClass.start} - ${currentClass.end}`} />
                <InfoRow label="Remaining" value={`${Math.floor(currentClass.remainingMinutes / 60)}h ${currentClass.remainingMinutes % 60}m`} />
                <div className="pt-4 space-y-3">
                  <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                    <Phone size={18} /> Call Faculty
                  </button>
                  <button className="w-full py-3 glass text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                    <MessageCircle size={18} /> WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Notification Center Modal ────────────────────────────────────────────────

function NotificationCenterModal({ onClose, students }: { onClose: () => void; students: any[] }) {
  const lowCount = students.filter((s: any) => {
    const total = (s.present || 0) + (s.absent || 0);
    return total > 0 && (s.present || 0) / total < 0.75;
  }).length;

  const notifications = [
    {
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      title: "Attendance Reminder",
      message: "Don’t forget to mark attendance for today’s classes.",
      time: "Just now",
    },
    ...(lowCount > 0 ? [{
      icon: AlertTriangle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      title: "Low Attendance Alert",
      message: `${lowCount} student${lowCount > 1 ? "s" : ""} below 75% attendance threshold.`,
      time: "Today",
    }] : []),
    {
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      title: "Backup Reminder",
      message: "Consider backing up your data to avoid loss.",
      time: "3 days ago",
    },
    {
      icon: Calendar,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      title: "Timetable Alert",
      message: "Verify your timetable is up to date for this week.",
      time: "5 days ago",
    },
    {
      icon: Activity,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
      title: "Recent Activity",
      message: "Attendance marked for 3 periods today.",
      time: "2 hours ago",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Bell className="text-purple-400" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-white/40 text-xs">{notifications.length} alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="glass p-2 rounded-xl text-white hover:bg-white/20 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-4 rounded-2xl border ${notif.bg} ${notif.border}`}
            >
              <div className="flex items-start gap-3">
                <notif.icon className={`${notif.color} flex-shrink-0 mt-0.5`} size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{notif.title}</p>
                  <p className="text-white/55 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-white/30 text-xs mt-1.5">{notif.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="w-full mt-5 py-3 glass rounded-xl text-white/60 text-sm font-medium hover:bg-white/10 transition-all"
        >
          Dismiss All
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Home Edit Profile Modal ──────────────────────────────────────────────────

function HomeEditProfileModal({ onClose }: { onClose: () => void }) {
  const user = safeGetItem("user");
  const setup = safeGetItem("setupData");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profilePhoto, setProfilePhoto] = useState<string>(user.profilePhoto || "");
  const [formData, setFormData] = useState<Record<string, string>>({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    collegeName: setup.collegeName || "",
    department: setup.department || "",
    branch: setup.branch || "",
    semester: setup.semester || "",
    year: setup.year || "",
    section: setup.section || "",
    className: setup.className || "",
    academicYear: setup.academicYear || "",
    tutorName: setup.tutorName || "",
    tutorPhone: setup.tutorPhone || "",
  });

  const update = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { return; }
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    localStorage.setItem("user", JSON.stringify({ ...user, name: formData.name, email: formData.email, phone: formData.phone, profilePhoto }));
    localStorage.setItem("setupData", JSON.stringify({
      ...setup,
      collegeName: formData.collegeName, department: formData.department, branch: formData.branch,
      semester: formData.semester, year: formData.year, section: formData.section,
      className: formData.className, academicYear: formData.academicYear,
      tutorName: formData.tutorName, tutorPhone: formData.tutorPhone,
    }));
    sounds.playSuccess(); haptics.success();
    onClose();
    window.location.reload();
  };

  const avatarLetter = formData.name?.charAt(0)?.toUpperCase() || "C";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Edit className="text-purple-400" size={18} />
            </div>
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="glass p-2 rounded-xl text-white hover:bg-white/20 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative">
              {profilePhoto ? (
                <img src={profilePhoto} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-400/50" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-2 ring-purple-400/50">
                  {avatarLetter}
                </div>
              )}
              <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-500 transition-colors">
                <Camera size={12} className="text-white" />
              </motion.button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          <HomeFormField label="Full Name" field="name" placeholder="Enter your name" formData={formData} onUpdate={update} />
          <HomeFormField label="Email" field="email" placeholder="you@example.com" formData={formData} onUpdate={update} />
          <HomeFormField label="Phone" field="phone" placeholder="+91 98765 43210" formData={formData} onUpdate={update} />
          <HomeFormField label="College Name" field="collegeName" placeholder="e.g. MIT College of Engineering" formData={formData} onUpdate={update} />
          <div className="grid grid-cols-2 gap-3">
            <HomeFormField label="Department" field="department" placeholder="CSE" formData={formData} onUpdate={update} />
            <HomeFormField label="Branch" field="branch" placeholder="Computer Science" formData={formData} onUpdate={update} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <HomeFormField label="Semester" field="semester" placeholder="5" formData={formData} onUpdate={update} />
            <HomeFormField label="Year" field="year" placeholder="3rd" formData={formData} onUpdate={update} />
            <HomeFormField label="Section" field="section" placeholder="A" formData={formData} onUpdate={update} />
          </div>
          <HomeFormField label="Class Name" field="className" placeholder="CSE-A 2022-26" formData={formData} onUpdate={update} />
          <HomeFormField label="Academic Year" field="academicYear" placeholder="2024-2025" formData={formData} onUpdate={update} />
          <HomeFormField label="Tutor Name" field="tutorName" placeholder="Dr. Priya Sharma" formData={formData} onUpdate={update} />
          <HomeFormField label="Tutor Phone" field="tutorPhone" placeholder="+91 98765 43210" formData={formData} onUpdate={update} />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
          >
            Save Changes
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass-strong rounded-2xl p-4 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-20 rounded-full blur-2xl`} />
      <div className="relative z-10">
        <Icon className="text-white/60 mb-2" size={20} />
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2 }}
          className="text-white text-2xl font-bold"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link to={href} className="no-underline">
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="glass-strong rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all text-center cursor-pointer"
      >
        <Icon className="text-white" size={24} />
        <span className="text-white text-sm font-medium">{label}</span>
      </motion.div>
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <span className="text-white/60">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function HomeFormField({
  label, field, placeholder, formData, onUpdate,
}: {
  label: string; field: string; placeholder: string;
  formData: Record<string, string>; onUpdate: (k: string, v: string) => void;
}) {
  return (
    <div>
      <label className="block text-white/50 mb-1.5 text-xs uppercase tracking-widest">{label}</label>
      <input
        type="text"
        value={formData[field] || ""}
        onChange={(e) => onUpdate(field, e.target.value)}
        className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/60 text-sm transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

