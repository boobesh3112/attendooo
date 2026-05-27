// Text-to-Speech Manager for Voice Alerts

class TTSManager {
  private synth: SpeechSynthesis | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private voiceType: 'male' | 'female' = 'female';
  private lastSpokenTime: { [key: string]: number } = {};
  private cooldownMs: number = 60000; // 1 minute cooldown for same message

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.enabled = this.getEnabledState();
      this.volume = this.getVolume();
      this.rate = this.getRate();
      this.voiceType = this.getVoiceType();
    }
  }

  private getEnabledState(): boolean {
    try {
      const saved = localStorage.getItem('ttsEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  }

  private getVolume(): number {
    try {
      const saved = localStorage.getItem('ttsVolume');
      return saved !== null ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  }

  private getRate(): number {
    try {
      const saved = localStorage.getItem('ttsRate');
      return saved !== null ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  }

  private getVoiceType(): 'male' | 'female' {
    try {
      const saved = localStorage.getItem('ttsVoiceType');
      return (saved as 'male' | 'female') || 'female';
    } catch {
      return 'female';
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('ttsEnabled', JSON.stringify(enabled));
    } catch {}
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('ttsVolume', this.volume.toString());
    } catch {}
  }

  getVolumeValue(): number {
    return this.volume;
  }

  setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2, rate));
    try {
      localStorage.setItem('ttsRate', this.rate.toString());
    } catch {}
  }

  getRateValue(): number {
    return this.rate;
  }

  setVoiceType(type: 'male' | 'female') {
    this.voiceType = type;
    try {
      localStorage.setItem('ttsVoiceType', type);
    } catch {}
  }

  getVoiceTypeValue(): 'male' | 'female' {
    return this.voiceType;
  }

  private getVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;

    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    // Try to find a voice matching the preference
    const preferred = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      const isFemale = name.includes('female') || name.includes('samantha') || name.includes('victoria');
      const isMale = name.includes('male') || name.includes('daniel') || name.includes('alex');

      if (this.voiceType === 'female' && isFemale) return true;
      if (this.voiceType === 'male' && isMale) return true;
      return false;
    });

    // Fallback to any English voice
    return preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  private canSpeak(messageKey: string): boolean {
    const now = Date.now();
    const lastTime = this.lastSpokenTime[messageKey];

    if (!lastTime) return true;

    return (now - lastTime) > this.cooldownMs;
  }

  speak(text: string, messageKey?: string) {
    if (!this.enabled || !this.synth) return;

    // Check cooldown
    const key = messageKey || text;
    if (!this.canSpeak(key)) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    const voice = this.getVoice();
    if (voice) {
      utterance.voice = voice;
    }

    this.synth.speak(utterance);
    this.lastSpokenTime[key] = Date.now();
  }

  // Predefined alert messages
  classStarted(subjectName: string, facultyName: string) {
    this.speak(
      `Attention! ${subjectName} class has started with ${facultyName}.`,
      'class-started'
    );
  }

  breakStarted() {
    this.speak('Break time has started. Enjoy your break!', 'break-started');
  }

  lunchStarted() {
    this.speak('Lunch break has started.', 'lunch-started');
  }

  attendancePending() {
    this.speak(
      'Reminder: Please mark attendance for the current period.',
      'attendance-pending'
    );
  }

  lowAttendanceWarning(studentName: string, percentage: number) {
    this.speak(
      `Alert! ${studentName} has low attendance at ${percentage} percent. Please take necessary action.`,
      `low-attendance-${studentName}`
    );
  }

  backupCompleted() {
    this.speak('Data backup completed successfully.', 'backup-completed');
  }

  collegeEnded() {
    this.speak('College hours have ended for today. Have a great day!', 'college-ended');
  }

  nextClassReminder(subjectName: string, minutesLeft: number) {
    this.speak(
      `Next class is ${subjectName} in ${minutesLeft} minutes.`,
      'next-class-reminder'
    );
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const tts = new TTSManager();
