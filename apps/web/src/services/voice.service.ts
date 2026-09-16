/**
 * Voice Navigation Service
 * Uses Web Speech API (speechSynthesis) for turn-by-turn audio guidance.
 * Gracefully degrades when unsupported.
 */
class VoiceNavigationService {
  private lang = 'en-US';
  private enabled = false;

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  setLanguage(lang: string) {
    // Map i18next keys to BCP-47 voice codes
    const map: Record<string, string> = { en: 'en-US', hi: 'hi-IN', gu: 'gu-IN' };
    this.lang = map[lang] || 'en-US';
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) this.stop();
  }

  speak(text: string) {
    if (!this.enabled || !this.isSupported()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.cancel(); // cancel any ongoing
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.isSupported()) window.speechSynthesis.cancel();
  }
}

export const voiceService = new VoiceNavigationService();
