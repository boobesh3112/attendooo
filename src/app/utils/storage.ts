// Safe localStorage access (guards against SSR / build-time access)
const isBrowser = typeof window !== "undefined";

const ls = {
  get: (key: string): string | null => {
    if (!isBrowser) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key: string, value: string): void => {
    if (!isBrowser) return;
    try { localStorage.setItem(key, value); } catch { /* quota exceeded, ignore */ }
  },
  remove: (key: string): void => {
    if (!isBrowser) return;
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

const parse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

export const storage = {
  // ── Students ──────────────────────────────────────────────────────────────
  getStudents: (): any[] => {
    return parse<any[]>(ls.get("students"), []);
  },

  saveStudents: (students: any[]): void => {
    ls.set("students", JSON.stringify(students));
  },

  addStudent: (student: any): any[] => {
    const students = storage.getStudents();
    students.push({ ...student, id: Date.now().toString() });
    storage.saveStudents(students);
    return students;
  },

  updateStudent: (id: string, updates: any): any[] => {
    const students = storage.getStudents();
    const idx = students.findIndex((s: any) => s.id === id);
    if (idx !== -1) students[idx] = { ...students[idx], ...updates };
    storage.saveStudents(students);
    return students;
  },

  deleteStudent: (id: string): any[] => {
    const filtered = storage.getStudents().filter((s: any) => s.id !== id);
    storage.saveStudents(filtered);
    return filtered;
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  getAttendance: (date?: string): any => {
    const records = parse<Record<string, any>>(ls.get("attendanceRecords"), {});
    return date ? (records[date] ?? {}) : records;
  },

  saveAttendance: (date: string, data: any): void => {
    const records = storage.getAttendance();
    records[date] = { ...data, locked: true, savedAt: new Date().toISOString() };
    ls.set("attendanceRecords", JSON.stringify(records));
  },

  unlockAttendance: (date: string): void => {
    const records = storage.getAttendance();
    if (records[date]) {
      records[date].locked = false;
      ls.set("attendanceRecords", JSON.stringify(records));
    }
  },

  // ── Backup / Restore ──────────────────────────────────────────────────────
  createBackup: (): string => {
    const backup = {
      students: storage.getStudents(),
      attendance: storage.getAttendance(),
      setup: parse(ls.get("setupData"), {}),
      user: parse(ls.get("user"), {}),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(backup);
  },

  restoreBackup: (backupString: string): boolean => {
    try {
      const backup = JSON.parse(backupString);
      ls.set("students", JSON.stringify(backup.students ?? []));
      ls.set("attendanceRecords", JSON.stringify(backup.attendance ?? {}));
      ls.set("setupData", JSON.stringify(backup.setup ?? {}));
      if (backup.user) ls.set("user", JSON.stringify(backup.user));
      return true;
    } catch (err) {
      console.error("Restore failed:", err);
      return false;
    }
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  getSetting: <T>(key: string, defaultValue: T): T => {
    const raw = ls.get(key);
    if (raw === null) return defaultValue;
    try { return JSON.parse(raw) as T; } catch { return defaultValue; }
  },

  setSetting: (key: string, value: any): void => {
    ls.set(key, JSON.stringify(value));
  },
};
