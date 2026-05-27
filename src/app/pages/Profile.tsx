import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Moon, Sun, Lock, Smartphone, LogOut, Calendar, Download,
  Upload, Volume2, VolumeX, Vibrate, Edit, Eye, EyeOff, X,
  CheckCircle, Archive, Clock, Camera, AlertTriangle, User,
  Phone, GraduationCap, BookOpen, Scan, Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { storage } from "../utils/storage";
import { sounds } from "../utils/sounds";
import { haptics } from "../utils/haptics";
import { tts } from "../utils/tts";
import { faceAuth } from "../utils/faceAuth";
import { format } from "date-fns";

// Safe localStorage helpers
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
};
const getSetup = () => {
  try { return JSON.parse(localStorage.getItem("setupData") || "{}"); } catch { return {}; }
};

export function Profile() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(sounds.isEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(storage.getSetting("hapticsEnabled", true));
  const [ttsEnabled, setTtsEnabled] = useState(tts.isEnabled());
  const [isAmoled, setIsAmoled] = useState(() => document.documentElement.classList.contains("amoled"));
  const [faceEnabled, setFaceEnabled] = useState(faceAuth.isEnabled());

  const handleAmoledToggle = () => {
    const next = !isAmoled;
    setIsAmoled(next);
    if (next) {
      document.documentElement.classList.add("amoled");
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("amoled");
    }
    storage.setSetting("amoledMode", next);
    haptics.light();
    toast.success(`AMOLED mode ${next ? "enabled" : "disabled"}`);
  };

  const handleFaceAuthToggle = async () => {
    if (faceEnabled) {
      faceAuth.disable();
      setFaceEnabled(false);
      toast.success("Face ID disabled");
      haptics.light();
    } else {
      try {
        const u = getUser();
        const result = await faceAuth.register(u.id || "user", u.name || "User");
        if (result.success) {
          setFaceEnabled(true);
          toast.success("Face ID registered successfully!");
          haptics.success();
        } else {
          toast.error(result.error || "Face ID registration failed");
          haptics.error();
        }
      } catch (e: any) {
        toast.error("Face ID not supported on this device/browser");
        haptics.error();
      }
    }
  };

  const user = getUser();
  const setupData = getSetup();

  const doLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSoundsToggle = () => {
    const next = !soundsEnabled;
    setSoundsEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playClick();
    toast.success(`Sounds ${next ? "enabled" : "disabled"}`);
  };

  const handleHapticsToggle = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    storage.setSetting("hapticsEnabled", next);
    if (next) haptics.light();
    toast.success(`Haptics ${next ? "enabled" : "disabled"}`);
  };

  const handleTTSToggle = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    tts.setEnabled(next);
    if (next) {
      haptics.light();
      tts.speak("Voice alerts enabled");
    }
    toast.success(`Voice Alerts ${next ? "enabled" : "disabled"}`);
  };

  const avatarLetter = user.name?.charAt(0)?.toUpperCase() || "C";
  const avatarPhoto = user.profilePhoto || null;

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-white/60 text-sm">Manage your account and settings</p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className="relative flex-shrink-0">
            {avatarPhoto ? (
              <img src={avatarPhoto} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-2 ring-white/20">
                {avatarLetter}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white truncate">{user.name || "Class Representative"}</h2>
            <p className="text-white/50 text-sm">Class Representative</p>
            {user.email && <p className="text-white/50 text-xs mt-0.5 truncate">{user.email}</p>}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowModal("editProfile"); sounds.playClick(); haptics.light(); }}
              className="text-purple-400 text-sm mt-2 flex items-center gap-1.5 hover:text-purple-300 transition-colors"
            >
              <Edit size={14} />
              Edit Profile
            </motion.button>
          </div>
        </div>

        <div className="space-y-2 text-sm glass rounded-xl p-4 relative z-10">
          <div className="flex justify-between">
            <span className="text-white/60">College</span>
            <span className="text-white font-medium text-right max-w-[60%] truncate">{setupData.collegeName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Department</span>
            <span className="text-white font-medium">{[setupData.department, setupData.branch].filter(Boolean).join(" - ") || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Semester</span>
            <span className="text-white font-medium">
              {setupData.semester ? `Sem ${setupData.semester}` : "—"}{setupData.year ? ` • ${setupData.year} Year` : ""}{setupData.section ? ` • Sec ${setupData.section}` : ""}
            </span>
          </div>
          {setupData.className && (
            <div className="flex justify-between">
              <span className="text-white/60">Class</span>
              <span className="text-white font-medium">{setupData.className}</span>
            </div>
          )}
          {setupData.tutorName && (
            <div className="flex justify-between">
              <span className="text-white/60">Tutor</span>
              <span className="text-white font-medium">{setupData.tutorName}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <SectionLabel>Security</SectionLabel>
        <SettingCard icon={Lock} title="Change Password" description="Update your account password" onClick={() => setShowModal("changePassword")} />
        <SettingCard icon={Smartphone} title="Change PIN" description="Update your 4-digit login PIN" onClick={() => setShowModal("changePIN")} />
        <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scan className="text-white" size={20} />
            <div>
              <p className="text-white font-medium">Face ID</p>
              <p className="text-white/50 text-xs">{faceEnabled ? "Registered — tap to disable" : "Register face for quick login"}</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleFaceAuthToggle}
            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${faceEnabled ? "bg-purple-500" : "bg-white/20"}`}>
            <motion.div animate={{ x: faceEnabled ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" />
          </motion.button>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <SectionLabel>Appearance & Feedback</SectionLabel>

        <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="text-white" size={20} /> : <Sun className="text-white" size={20} />}
            <div>
              <p className="text-white font-medium">Theme</p>
              <p className="text-white/50 text-xs">Switch between light and dark mode</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); sounds.playClick(); haptics.light(); }}
            className="px-4 py-2 bg-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-all"
          >
            {theme === "dark" ? "Dark" : "Light"}
          </motion.button>
        </div>

        <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="text-white" size={20} />
            <div>
              <p className="text-white font-medium">AMOLED Mode</p>
              <p className="text-white/50 text-xs">True black for OLED displays — saves battery</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleAmoledToggle}
            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${isAmoled ? "bg-purple-500" : "bg-white/20"}`}>
            <motion.div animate={{ x: isAmoled ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" />
          </motion.button>
        </div>

        <ToggleCard
          icon={soundsEnabled ? Volume2 : VolumeX}
          title="Sound Effects"
          description="Enable or disable app sounds"
          enabled={soundsEnabled}
          onToggle={handleSoundsToggle}
        />

        <ToggleCard
          icon={Vibrate}
          title="Haptic Feedback"
          description="Enable vibration feedback"
          enabled={hapticsEnabled}
          onToggle={handleHapticsToggle}
        />

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {ttsEnabled ? <Volume2 className="text-white" size={20} /> : <VolumeX className="text-white" size={20} />}
              <div>
                <p className="text-white font-medium">Voice Alerts</p>
                <p className="text-white/50 text-xs">Enable text-to-speech announcements</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleTTSToggle}
              className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${ttsEnabled ? "bg-green-500" : "bg-white/20"}`}
            >
              <motion.div
                animate={{ x: ttsEnabled ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>
          {ttsEnabled && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal("ttsSettings")}
              className="w-full mt-3 py-2 glass rounded-xl text-white/70 text-sm hover:bg-white/10 transition-all"
            >
              Configure Voice Settings
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <SectionLabel>Data Management</SectionLabel>
        <SettingCard icon={Calendar} title="Edit Timetable" description="Modify your class schedule" onClick={() => setShowModal("editTimetable")} />
        <SettingCard icon={Download} title="Backup Data" description="Create a backup of all your data" onClick={() => setShowModal("backup")} />
        <SettingCard icon={Upload} title="Restore Data" description="Restore from a previous backup" onClick={() => setShowModal("restore")} />
        <SettingCard icon={Archive} title="End Semester" description="Archive current semester data" onClick={() => setShowModal("endSemester")} danger />
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setShowLogoutConfirm(true); sounds.playClick(); haptics.medium(); }}
          className="w-full glass-strong rounded-2xl p-4 flex items-center justify-center gap-3 text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <LogoutConfirmModal
            onConfirm={doLogout}
            onClose={() => setShowLogoutConfirm(false)}
          />
        )}
        {showModal === "changePassword" && <ChangePasswordModal onClose={() => setShowModal(null)} />}
        {showModal === "changePIN" && <ChangePINModal onClose={() => setShowModal(null)} />}
        {showModal === "editProfile" && <EditProfileModal onClose={() => setShowModal(null)} />}
        {showModal === "backup" && <BackupModal onClose={() => setShowModal(null)} />}
        {showModal === "restore" && <RestoreModal onClose={() => setShowModal(null)} />}
        {showModal === "endSemester" && <EndSemesterModal onClose={() => setShowModal(null)} />}
        {showModal === "editTimetable" && <EditTimetableModal onClose={() => setShowModal(null)} />}
        {showModal === "ttsSettings" && <TTSSettingsModal onClose={() => setShowModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest px-1">{children}</h3>;
}

function SettingCard({ icon: Icon, title, description, onClick, danger = false }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => { onClick(); sounds.playClick(); haptics.light(); }}
      className={`w-full glass-strong rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-white/10 transition-all ${danger ? "border border-red-500/30" : ""}`}
    >
      <Icon className={danger ? "text-red-400" : "text-white"} size={20} />
      <div className="flex-1">
        <p className={`font-medium ${danger ? "text-red-400" : "text-white"}`}>{title}</p>
        <p className="text-white/50 text-xs">{description}</p>
      </div>
    </motion.button>
  );
}

function ToggleCard({ icon: Icon, title, description, enabled, onToggle }: any) {
  return (
    <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="text-white" size={20} />
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-white/50 text-xs">{description}</p>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${enabled ? "bg-green-500" : "bg-white/20"}`}
      >
        <motion.div
          animate={{ x: enabled ? 26 : 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
        />
      </motion.button>
    </div>
  );
}

function ModalWrapper({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="glass p-2 rounded-xl text-white hover:bg-white/20 transition-all">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Logout Confirmation Modal ────────────────────────────────────────────────

function LogoutConfirmModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-8 w-full max-w-sm relative overflow-hidden"
      >
        {/* Glow blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none rounded-3xl" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Animated logout icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", damping: 14, stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40"
          >
            <motion.div
              animate={{ x: [0, 3, 0, -3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <LogOut className="text-white" size={36} />
            </motion.div>
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">Log Out?</h2>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            Are you sure you want to log out?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { haptics.light(); onClose(); }}
              className="py-4 glass hover:bg-white/15 text-white rounded-2xl font-semibold transition-all border border-white/20"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(239,68,68,0.5)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { haptics.medium(); sounds.playClick(); onConfirm(); }}
              className="py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-semibold shadow-lg shadow-red-500/40 transition-all border border-red-400/30"
            >
              Log Out
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Module-level Field component (prevents re-mount on each keystroke) ────────

function ProfileFormField({
  label, field, placeholder, type = "text", required = false,
  formData, onUpdate, errors,
}: {
  label: string; field: string; placeholder: string; type?: string; required?: boolean;
  formData: Record<string, string>; onUpdate: (k: string, v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-white/60 mb-1.5 text-xs font-semibold uppercase tracking-widest">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={formData[field] || ""}
        onChange={(e) => onUpdate(field, e.target.value)}
        className={`w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all text-sm ${
          errors[field] ? "ring-2 ring-red-500/60" : "focus:ring-purple-400/60"
        }`}
        placeholder={placeholder}
      />
      {errors[field] && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <AlertTriangle size={10} /> {errors[field]}
        </p>
      )}
    </div>
  );
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const user = getUser();
  const setup = getSetup();
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
    tutorEmail: setup.tutorEmail || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<"personal" | "academic" | "tutor">("personal");

  const update = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
    if (formData.phone && !/^\+?[\d\s\-]{7,15}$/.test(formData.phone)) e.phone = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { haptics.error(); sounds.playError(); return; }

    const updatedUser = { ...user, name: formData.name, email: formData.email, phone: formData.phone, profilePhoto };
    const updatedSetup = { ...setup, ...formData };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("setupData", JSON.stringify(updatedSetup));

    toast.success("Profile updated!");
    haptics.success();
    sounds.playSuccess();
    onClose();
    window.location.reload();
  };

  const tabs = [
    { key: "personal" as const, label: "Personal", icon: User },
    { key: "academic" as const, label: "Academic", icon: GraduationCap },
    { key: "tutor" as const, label: "Tutor", icon: BookOpen },
  ];

  const fieldProps = { formData, onUpdate: update, errors };

  return (
    <ModalWrapper onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit}>
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {profilePhoto ? (
              <img src={profilePhoto} alt="avatar" className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-400/50" />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold ring-2 ring-purple-400/50">
                {formData.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-500 transition-colors"
            >
              <Camera size={14} className="text-white" />
            </motion.button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <p className="text-white/40 text-xs mt-2">Tap camera to change photo</p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 glass rounded-xl p-1 mb-6">
          {tabs.map(tab => (
            <motion.button
              key={tab.key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSection === tab.key
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSection === "personal" && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4"
            >
              <ProfileFormField label="Full Name" field="name" placeholder="Enter your name" required {...fieldProps} />
              <ProfileFormField label="Email Address" field="email" placeholder="you@example.com" type="email" {...fieldProps} />
              <ProfileFormField label="Phone Number" field="phone" placeholder="+91 98765 43210" type="tel" {...fieldProps} />
            </motion.div>
          )}

          {activeSection === "academic" && (
            <motion.div
              key="academic"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4"
            >
              <ProfileFormField label="College Name" field="collegeName" placeholder="e.g. MIT College of Engineering" {...fieldProps} />
              <div className="grid grid-cols-2 gap-3">
                <ProfileFormField label="Department" field="department" placeholder="e.g. CSE" {...fieldProps} />
                <ProfileFormField label="Branch" field="branch" placeholder="e.g. Computer Science" {...fieldProps} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ProfileFormField label="Semester" field="semester" placeholder="5" {...fieldProps} />
                <ProfileFormField label="Year" field="year" placeholder="3rd" {...fieldProps} />
                <ProfileFormField label="Section" field="section" placeholder="A" {...fieldProps} />
              </div>
              <ProfileFormField label="Class Name" field="className" placeholder="e.g. CSE-A 2022-26" {...fieldProps} />
              <ProfileFormField label="Academic Year" field="academicYear" placeholder="e.g. 2024-2025" {...fieldProps} />
            </motion.div>
          )}

          {activeSection === "tutor" && (
            <motion.div
              key="tutor"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-4"
            >
              <ProfileFormField label="Tutor Name" field="tutorName" placeholder="e.g. Dr. Priya Sharma" {...fieldProps} />
              <ProfileFormField label="Tutor Phone" field="tutorPhone" placeholder="+91 98765 43210" type="tel" {...fieldProps} />
              <ProfileFormField label="Tutor Email" field="tutorEmail" placeholder="tutor@college.edu" type="email" {...fieldProps} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
        >
          Save Changes
        </motion.button>
      </form>
    </ModalWrapper>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser();
    if (formData.currentPassword !== user.password) {
      toast.error("Current password is incorrect"); haptics.error(); sounds.playError(); return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match"); haptics.error(); sounds.playError(); return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters"); haptics.error(); sounds.playError(); return;
    }
    localStorage.setItem("user", JSON.stringify({ ...user, password: formData.newPassword }));
    toast.success("Password changed successfully!"); haptics.success(); sounds.playSuccess(); onClose();
  };

  const PwField = ({ field, label, showKey }: { field: "currentPassword" | "newPassword" | "confirmPassword"; label: string; showKey: "current" | "new" | "confirm" }) => (
    <div>
      <label className="block text-white/70 mb-1.5 text-xs uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          value={formData[field]}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          required
          className="w-full px-4 py-3 pr-11 rounded-xl glass text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow({ ...show, [showKey]: !show[showKey] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
          {show[showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <ModalWrapper onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PwField field="currentPassword" label="Current Password" showKey="current" />
        <PwField field="newPassword" label="New Password" showKey="new" />
        <PwField field="confirmPassword" label="Confirm New Password" showKey="confirm" />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
          className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold">
          Change Password
        </motion.button>
      </form>
    </ModalWrapper>
  );
}

// ─── Change PIN Modal ─────────────────────────────────────────────────────────

function ChangePINModal({ onClose }: { onClose: () => void }) {
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPIN.length !== 4 || confirmPIN.length !== 4) {
      toast.error("PIN must be 4 digits"); haptics.error(); sounds.playError(); return;
    }
    if (newPIN !== confirmPIN) {
      toast.error("PINs do not match"); haptics.error(); sounds.playError(); return;
    }
    localStorage.setItem("userPin", newPIN);
    toast.success("PIN changed successfully!"); haptics.success(); sounds.playSuccess(); onClose();
  };

  return (
    <ModalWrapper onClose={onClose} title="Change PIN">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 mb-1.5 text-xs uppercase tracking-wide text-center">New 4-Digit PIN</label>
          <input type="password" maxLength={4} value={newPIN} onChange={(e) => /^\d*$/.test(e.target.value) && setNewPIN(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl glass text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60" placeholder="••••" />
        </div>
        <div>
          <label className="block text-white/70 mb-1.5 text-xs uppercase tracking-wide text-center">Confirm PIN</label>
          <input type="password" maxLength={4} value={confirmPIN} onChange={(e) => /^\d*$/.test(e.target.value) && setConfirmPIN(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl glass text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60" placeholder="••••" />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
          disabled={newPIN.length !== 4 || confirmPIN.length !== 4}
          className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold disabled:opacity-50">
          Change PIN
        </motion.button>
      </form>
    </ModalWrapper>
  );
}

// ─── Backup Modal ─────────────────────────────────────────────────────────────

function BackupModal({ onClose }: { onClose: () => void }) {
  const handleBackup = () => {
    const backup = storage.createBackup();
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_backup_${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup created!"); haptics.success(); sounds.playSuccess();
    tts.backupCompleted();
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose} title="Backup Data">
      <div className="text-center py-6">
        <Download className="w-16 h-16 text-white/50 mx-auto mb-4" />
        <p className="text-white/60 mb-6 text-sm leading-relaxed">
          Create a backup of all your students, attendance records, and settings.
        </p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBackup}
          className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold">
          Download Backup
        </motion.button>
      </div>
    </ModalWrapper>
  );
}

// ─── Restore Modal ────────────────────────────────────────────────────────────

function RestoreModal({ onClose }: { onClose: () => void }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.restoreBackup(content)) {
        toast.success("Backup restored!"); haptics.success(); sounds.playSuccess(); onClose();
        window.location.reload();
      } else {
        toast.error("Failed to restore backup"); haptics.error(); sounds.playError();
      }
    };
    reader.readAsText(file);
  };

  return (
    <ModalWrapper onClose={onClose} title="Restore Data">
      <div className="text-center py-6">
        <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
        <p className="text-white/60 mb-6 text-sm leading-relaxed">Restore your data from a previous backup file.</p>
        <label className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2">
          <Upload size={20} /> Select Backup File
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
    </ModalWrapper>
  );
}

// ─── End Semester Modal ───────────────────────────────────────────────────────

function EndSemesterModal({ onClose }: { onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const setupData = getSetup();
  const students = storage.getStudents();

  const handleEndSemester = () => {
    const backup = storage.createBackup();
    const timestamp = format(new Date(), "yyyy-MM-dd_HHmmss");
    localStorage.setItem(`semester_archive_${timestamp}`, backup);
    localStorage.setItem("students", JSON.stringify([]));
    localStorage.setItem("attendanceRecords", JSON.stringify({}));
    toast.success("Semester ended! Data archived."); haptics.success(); sounds.playSuccess();
    onClose(); window.location.reload();
  };

  return (
    <ModalWrapper onClose={onClose} title="End Semester">
      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-4">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-500/30 rounded-full" />
              <div className="absolute inset-0 bg-red-500/15 rounded-full flex items-center justify-center border border-red-500/30">
                <Archive className="w-9 h-9 text-red-400" />
              </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">End This Semester?</h3>
            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              This action will archive attendance records and cannot be undone easily.
            </p>
            <div className="glass rounded-xl p-4 text-left space-y-2 mb-6 border border-red-500/20">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-3">Semester Details</p>
              {[
                ["Semester", setupData.semester || "—"],
                ["Department", setupData.department || "—"],
                ["Total Students", String(students.length)],
                ["Archive Date", format(new Date(), "dd MMM yyyy")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/60">{label}</span>
                  <span className="text-white font-medium">{val}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                className="py-3 glass rounded-xl text-white font-medium border border-white/20 hover:bg-white/10 transition-all">
                Cancel
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmed(true)}
                className="py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-medium hover:bg-red-500/30 transition-all">
                Continue →
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-4">
            <motion.div animate={{ rotate: [-3, 3, -3, 3, 0] }} transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/40">
              <CheckCircle className="w-8 h-8 text-red-400" />
            </motion.div>
            <h3 className="text-white font-bold text-lg mb-2">Final Confirmation</h3>
            <p className="text-white/60 text-sm mb-1">Are you sure you want to end this semester?</p>
            <p className="text-red-400/80 text-xs mb-6">This action will archive attendance records and cannot be undone easily.</p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmed(false)}
                className="py-3 glass rounded-xl text-white font-medium border border-white/20 hover:bg-white/10 transition-all">
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(239,68,68,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEndSemester}
                className="py-3 bg-red-600 text-white rounded-xl font-semibold border border-red-400/30 transition-all"
                style={{ boxShadow: "0 0 16px rgba(239,68,68,0.35)" }}
              >
                End Semester
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalWrapper>
  );
}

// ─── Edit Timetable Modal ─────────────────────────────────────────────────────

function EditTimetableModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    sounds.playClick();
    haptics.light();
    navigate("/app/timetable");
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose} title="Edit Timetable">
      <div className="text-center py-6">
        <Clock className="w-16 h-16 text-white/50 mx-auto mb-4" />
        <p className="text-white/60 mb-6 text-sm leading-relaxed">
          Navigate to the Timetable page to set up and customize your class schedule.
        </p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNavigate}
          className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold">
          Go to Timetable
        </motion.button>
      </div>
    </ModalWrapper>
  );
}

// ─── TTS Settings Modal ───────────────────────────────────────────────────────

function TTSSettingsModal({ onClose }: { onClose: () => void }) {
  const [volume, setVolume] = useState(tts.getVolumeValue() * 100);
  const [rate, setRate] = useState(tts.getRateValue());
  const [voiceType, setVoiceType] = useState<'male' | 'female'>(tts.getVoiceTypeValue());

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    tts.setVolume(value / 100);
  };

  const handleRateChange = (value: number) => {
    setRate(value);
    tts.setRate(value);
  };

  const handleVoiceTypeChange = (type: 'male' | 'female') => {
    setVoiceType(type);
    tts.setVoiceType(type);
  };

  const handleTest = () => {
    tts.speak("This is a test of the voice alert system.");
    haptics.light();
  };

  return (
    <ModalWrapper onClose={onClose} title="Voice Alert Settings">
      <div className="space-y-6">
        {/* Volume Control */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/70 text-sm font-medium">Volume</label>
            <span className="text-white font-bold">{Math.round(volume)}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${volume}%, rgba(255, 255, 255, 0.1) ${volume}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />
          </div>
        </div>

        {/* Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/70 text-sm font-medium">Speech Speed</label>
            <span className="text-white font-bold">{rate.toFixed(1)}x</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${((rate - 0.5) / 1.5) * 100}%, rgba(255, 255, 255, 0.1) ${((rate - 0.5) / 1.5) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        {/* Voice Type Selection */}
        <div>
          <label className="text-white/70 text-sm font-medium mb-3 block">Voice Type</label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleVoiceTypeChange('female')}
              className={`py-3 rounded-xl font-medium transition-all ${
                voiceType === 'female'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              Female
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleVoiceTypeChange('male')}
              className={`py-3 rounded-xl font-medium transition-all ${
                voiceType === 'male'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'glass text-white/70 hover:bg-white/10'
              }`}
            >
              Male
            </motion.button>
          </div>
        </div>

        {/* Test Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTest}
          className="w-full py-3 glass rounded-xl text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <Volume2 size={18} />
          Test Voice
        </motion.button>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            toast.success("Voice settings saved!");
            haptics.success();
            sounds.playSuccess();
            onClose();
          }}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
        >
          Save Settings
        </motion.button>
      </div>
    </ModalWrapper>
  );
}
