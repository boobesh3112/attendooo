import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, Search, Filter, X, Phone, Mail,
  MessageCircle, Trash2, QrCode, Copy, Share2, BarcodeIcon,
  AlertTriangle, User, Hash, BookOpen, Home, Building2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { toast } from "sonner";
import { storage } from "../utils/storage";
import { sounds } from "../utils/sounds";
import { haptics } from "../utils/haptics";

export function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rollNo">("rollNo");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    setStudents(storage.getStudents());
  };

  const handleAddStudent = (student: any) => {
    storage.addStudent(student);
    loadStudents();
    setShowAddForm(false);
    sounds.playSuccess();
    haptics.success();
    toast.success("Student added successfully!");
  };

  const handleDeleteStudent = (id: string) => {
    storage.deleteStudent(id);
    loadStudents();
    setShowDetails(null);
    sounds.playSuccess();
    haptics.medium();
    toast.success("Student deleted successfully!");
  };

  const filteredStudents = students
    .filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "name"
        ? (a.name || "").localeCompare(b.name || "")
        : (a.rollNo || "").localeCompare(b.rollNo || "")
    );

  return (
    <div className="min-h-screen p-4 space-y-6 pb-24">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Students</h1>
            <p className="text-white/60 text-sm">Total: {students.length} students enrolled</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or roll no..."
            className="w-full pl-10 pr-4 py-3 rounded-xl glass text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSortBy(sortBy === "name" ? "rollNo" : "name")}
          className="glass px-4 py-3 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 transition-all"
        >
          <Filter size={18} />
          <span className="text-sm">{sortBy === "name" ? "Name" : "Roll No"}</span>
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 font-medium">
              {searchQuery ? "No students found" : "No students added yet"}
            </p>
            {!searchQuery && (
              <p className="text-white/30 text-sm mt-2">Tap + to add your first student</p>
            )}
          </div>
        ) : (
          filteredStudents.map((student, index) => (
            <StudentCard key={student.id} student={student} index={index} onClick={() => setShowDetails(student)} />
          ))
        )}
      </motion.div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setShowAddForm(true); sounds.playClick(); haptics.light(); }}
        className="fixed bottom-24 right-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl shadow-purple-500/40 flex items-center justify-center text-white z-40"
      >
        <UserPlus size={26} />
      </motion.button>

      <AnimatePresence>
        {showAddForm && <AddStudentModal onClose={() => setShowAddForm(false)} onAdd={handleAddStudent} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDetails && (
          <StudentDetailsModal
            student={showDetails}
            onClose={() => setShowDetails(null)}
            onDelete={handleDeleteStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentCard({ student, index, onClick }: any) {
  const records = storage.getAttendance();
  let present = 0, total = 0;
  Object.values(records).forEach((d: any) => {
    if (d.records) {
      const r = d.records.find((r: any) => r.studentId === student.id);
      if (r) { total++; if (r.status === "present") present++; }
    }
  });
  const pct = total > 0 ? Math.round((present / total) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="glass-strong rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {student.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{student.name}</h3>
          <p className="text-white/50 text-xs">Roll {student.rollNo} • {student.hostelStatus || "Day Scholar"}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {pct !== null ? (
            <span className={`text-sm font-bold ${pct >= 75 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400"}`}>
              {pct}%
            </span>
          ) : (
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          )}
          <p className="text-white/30 text-[10px] mt-0.5">{pct !== null ? "attendance" : "active"}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AddStudentModal({ onClose, onAdd }: any) {
  const [formData, setFormData] = useState({
    name: "", rollNo: "", regNo: "", phone: "", email: "",
    hostelStatus: "Day Scholar", gender: "Male", semester: "",
  });
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const e: any = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.rollNo.trim()) e.rollNo = "Roll number is required";
    if (!formData.regNo.trim()) e.regNo = "Registration number is required";
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) e.phone = "Invalid phone number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) { onAdd(formData); }
    else { haptics.error(); sounds.playError(); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Student</h2>
          <button onClick={onClose} className="glass p-2 rounded-xl text-white hover:bg-white/20"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StudentFormField label="Full Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Enter student name" error={errors.name} required />
          <div className="grid grid-cols-2 gap-3">
            <StudentFormField label="Roll No" value={formData.rollNo} onChange={v => setFormData({ ...formData, rollNo: v })} placeholder="123" error={errors.rollNo} required />
            <StudentFormField label="Reg No" value={formData.regNo} onChange={v => setFormData({ ...formData, regNo: v })} placeholder="ABC123" error={errors.regNo} required />
          </div>
          <StudentFormField label="Phone" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} placeholder="9876543210" type="tel" error={errors.phone} />
          <StudentFormField label="Email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="student@college.edu" type="email" error={errors.email} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 mb-1.5 text-xs font-semibold uppercase tracking-widest">Status</label>
              <select value={formData.hostelStatus} onChange={e => setFormData({ ...formData, hostelStatus: e.target.value })}
                className="w-full px-3 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-sm">
                <option value="Day Scholar" className="bg-gray-900">Day Scholar</option>
                <option value="Hosteller" className="bg-gray-900">Hosteller</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 mb-1.5 text-xs font-semibold uppercase tracking-widest">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-sm">
                <option value="Male" className="bg-gray-900">Male</option>
                <option value="Female" className="bg-gray-900">Female</option>
                <option value="Other" className="bg-gray-900">Other</option>
              </select>
            </div>
          </div>
          <StudentFormField label="Semester" value={formData.semester} onChange={v => setFormData({ ...formData, semester: v })} placeholder="e.g. 5" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30">
            Add Student
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function StudentDetailsModal({ student, onClose, onDelete }: any) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "qr" | "barcode">("info");

  const attendanceRecords = storage.getAttendance();
  let present = 0, total = 0;
  Object.values(attendanceRecords).forEach((dayData: any) => {
    if (dayData.records) {
      const record = dayData.records.find((r: any) => r.studentId === student.id);
      if (record) { total++; if (record.status === "present") present++; }
    }
  });
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const setup = (() => { try { return JSON.parse(localStorage.getItem("setupData") || "{}"); } catch { return {}; } })();

  const qrData = JSON.stringify({
    name: student.name, rollNo: student.rollNo, regNo: student.regNo,
    phone: student.phone, email: student.email, college: setup.collegeName,
    department: setup.department, semester: setup.semester || student.semester,
  });

  const handleShare = async () => {
    const text = `Student: ${student.name}\nRoll No: ${student.rollNo}\nReg No: ${student.regNo}\nPhone: ${student.phone || "N/A"}\nEmail: ${student.email || "N/A"}\nSemester: ${student.semester || setup.semester || "N/A"}\nStatus: ${student.hostelStatus || "Day Scholar"}`;
    if (navigator.share) {
      await navigator.share({ title: student.name, text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Details copied to clipboard!");
    }
    haptics.light();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.92, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Student Profile</h2>
            <button onClick={onClose} className="glass p-2 rounded-xl text-white hover:bg-white/20"><X size={18} /></button>
          </div>

          {/* Avatar + Basic Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/30 flex-shrink-0">
                {student.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 ${percentage >= 75 ? "bg-green-400" : percentage >= 50 ? "bg-yellow-400" : "bg-red-400"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate">{student.name}</h3>
              <p className="text-white/50 text-sm">Roll No: {student.rollNo}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full glass text-white/60">
                  {student.hostelStatus || "Day Scholar"}
                </span>
                {student.gender && (
                  <span className="text-xs px-2 py-0.5 rounded-full glass text-white/60">
                    {student.gender}
                  </span>
                )}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
              className="glass p-2.5 rounded-xl text-white/60 hover:text-white transition-colors">
              <Share2 size={16} />
            </motion.button>
          </div>

          {/* Attendance bar */}
          <div className="glass rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs font-medium">Attendance</span>
              <span className={`text-lg font-bold ${percentage >= 75 ? "text-green-400" : percentage >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${percentage >= 75 ? "bg-gradient-to-r from-green-500 to-green-400" : percentage >= 50 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-red-500 to-orange-400"}`}
              />
            </div>
            <p className="text-white/30 text-xs mt-1.5">{present}/{total} classes attended</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 glass rounded-xl p-1 mb-4">
            {[
              { key: "info", label: "Details", icon: User },
              { key: "qr", label: "QR Code", icon: QrCode },
              { key: "barcode", label: "Barcode", icon: BarcodeIcon },
            ].map(({ key, label, icon: Icon }) => (
              <motion.button key={key} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === key ? "bg-purple-600 text-white shadow-md" : "text-white/50 hover:text-white/80"
                }`}>
                <Icon size={12} />
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-2">
                <InfoDetailRow icon={Hash} label="Registration No" value={student.regNo || "N/A"} />
                <InfoDetailRow icon={Hash} label="Roll Number" value={student.rollNo || "N/A"} />
                {student.semester && <InfoDetailRow icon={BookOpen} label="Semester" value={`Semester ${student.semester}`} />}
                <InfoDetailRow icon={Phone} label="Phone" value={student.phone || "Not provided"} />
                <InfoDetailRow icon={Mail} label="Email" value={student.email || "Not provided"} />
                {student.gender && <InfoDetailRow icon={User} label="Gender" value={student.gender} />}
                <InfoDetailRow
                  icon={student.hostelStatus === "Hosteller" ? Building2 : Home}
                  label="Accommodation"
                  value={student.hostelStatus || "Day Scholar"}
                />
                {setup.collegeName && <InfoDetailRow icon={BookOpen} label="College" value={setup.collegeName} />}
                {setup.department && <InfoDetailRow icon={BookOpen} label="Department" value={setup.department} />}
              </motion.div>
            )}

            {activeTab === "qr" && (
              <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center">
                <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-xl">
                  <QRCodeSVG value={qrData} size={180} />
                </div>
                <p className="text-white/50 text-xs mb-4">Scan QR to get student details</p>

                {/* Structured student card below QR */}
                <div className="glass rounded-2xl p-4 text-left space-y-2 mb-4">
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-3">Student Card</p>
                  {[
                    ["Name", student.name],
                    ["Roll No", student.rollNo],
                    ["Reg No", student.regNo],
                    ["Semester", student.semester || setup.semester || "—"],
                    ["Phone", student.phone || "—"],
                    ["Email", student.email || "—"],
                    ["Gender", student.gender || "—"],
                    ["Type", student.hostelStatus || "Day Scholar"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-start gap-2">
                      <span className="text-white/40 text-xs flex-shrink-0">{label}</span>
                      <span className="text-white text-xs font-medium text-right break-all">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button whileTap={{ scale: 0.95 }}
                    onClick={() => { navigator.clipboard.writeText(qrData); toast.success("Copied!"); haptics.light(); }}
                    className="py-2.5 glass rounded-xl text-white text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    <Copy size={14} /> Copy Data
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleShare}
                    className="py-2.5 glass rounded-xl text-white text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    <Share2 size={14} /> Share
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === "barcode" && (
              <motion.div key="barcode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center">
                <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-xl w-full overflow-hidden">
                  <Barcode
                    value={student.regNo || student.rollNo || "000000"}
                    format="CODE128"
                    width={1.8}
                    height={60}
                    fontSize={11}
                    margin={4}
                    displayValue={true}
                  />
                </div>
                <p className="text-white/50 text-xs mb-4">Barcode for Registration Number: <span className="text-white/70 font-mono">{student.regNo || "N/A"}</span></p>
                <div className="glass rounded-xl p-3 text-left">
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Reg No Barcode</p>
                  <p className="text-white/60 text-xs">Scan this barcode to retrieve the student&apos;s registration number. Compatible with standard barcode scanners.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => student.phone ? (window.location.href = `tel:${student.phone}`) : toast.error("No phone")}
              className="py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl flex flex-col items-center gap-1 hover:bg-green-500/30 transition-all">
              <Phone size={18} />
              <span className="text-xs">Call</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => student.email ? (window.location.href = `mailto:${student.email}`) : toast.error("No email")}
              className="py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl flex flex-col items-center gap-1 hover:bg-blue-500/30 transition-all">
              <Mail size={18} />
              <span className="text-xs">Email</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!student.phone) { toast.error("No phone"); return; }
                const phone = student.phone.replace(/\D/g, "");
                window.open(`https://wa.me/${phone}`, "_blank");
              }}
              className="py-3 bg-green-600/20 border border-green-600/30 text-green-300 rounded-xl flex flex-col items-center gap-1 hover:bg-green-600/30 transition-all">
              <MessageCircle size={18} />
              <span className="text-xs">WhatsApp</span>
            </motion.button>
          </div>

          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setShowDeleteConfirm(true); haptics.light(); }}
            className="w-full mt-3 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
            <Trash2 size={16} />
            Delete Student
          </motion.button>

          <AnimatePresence>
            {showDeleteConfirm && (
              <DeleteConfirmModal
                studentName={student.name}
                onConfirm={() => { setShowDeleteConfirm(false); onDelete(student.id); }}
                onCancel={() => { setShowDeleteConfirm(false); haptics.light(); }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Module-level components (avoid re-creation on re-render)
function StudentFormField({
  label, value, onChange, placeholder, type = "text", error, required = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; error?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-white/60 mb-1.5 text-xs font-semibold uppercase tracking-widest">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30 focus:outline-none focus:ring-2 text-sm transition-all ${
          error ? "ring-2 ring-red-500/60" : "focus:ring-purple-400/50"
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function InfoDetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
      <Icon size={14} className="text-white/40 flex-shrink-0" />
      <span className="text-white/50 text-xs flex-shrink-0 w-24">{label}</span>
      <span className="text-white text-sm font-medium flex-1 text-right truncate">{value}</span>
    </div>
  );
}

function DeleteConfirmModal({ studentName, onConfirm, onCancel }: {
  studentName: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-strong rounded-3xl p-8 w-full max-w-sm relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none rounded-3xl" />
        <div className="relative z-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 15 }}
            className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-white" size={32} />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">Delete Student?</h2>
          <p className="text-white/60 text-sm mb-2">Are you sure you want to delete</p>
          <p className="text-white font-semibold mb-6">{studentName}?</p>
          <div className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.96 }} onClick={onCancel}
              className="py-3.5 glass text-white rounded-2xl font-semibold border border-white/20">
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { haptics.medium(); onConfirm(); }}
              className="py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-semibold">
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}
