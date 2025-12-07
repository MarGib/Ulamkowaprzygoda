
// services/soundUtils.ts

// Singleton AudioContext
let audioCtx: AudioContext | null = null;

const getContext = (): AudioContext => {
  if (!audioCtx) {
    // Wsparcie dla różnych przeglądarek
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Funkcja pomocnicza do generowania pojedynczego tonu
const playTone = (
  freq: number, 
  type: 'sine' | 'triangle' | 'square' | 'sawtooth', 
  duration: number, 
  startTimeOffset: number = 0,
  vol: number = 0.1
) => {
  try {
    const ctx = getContext();
    // Przeglądarki blokują AudioContext do momentu pierwszej interakcji użytkownika
    if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.error("Audio resume error:", e));
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    const start = now + startTimeOffset;
    
    // Obwiednia głośności (fade out) zapobiega "kliknięciom" na końcu dźwięku
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    
    osc.start(start);
    osc.stop(start + duration);
  } catch (e) {
    // Ignorujemy błędy audio (np. jeśli użytkownik zablokował dźwięk)
    console.error("Audio playback error", e);
  }
};

// Dźwięk kliknięcia (krótki, wysoki "pop")
export const playClick = () => {
  playTone(800, 'sine', 0.05, 0, 0.05);
};

// Dźwięk poprawnej odpowiedzi (rosnący trójdźwięk C-dur)
export const playCorrect = () => {
  playTone(523.25, 'sine', 0.15, 0, 0.1);    // C5
  playTone(659.25, 'sine', 0.15, 0.1, 0.1);  // E5
  playTone(783.99, 'sine', 0.3, 0.2, 0.1);   // G5
};

// Dźwięk błędnej odpowiedzi (opadający, brzęczący ton)
export const playIncorrect = () => {
  playTone(200, 'sawtooth', 0.2, 0, 0.08);
  playTone(150, 'sawtooth', 0.4, 0.15, 0.08);
};

// Dźwięk startu gry / poziomu (wesoły akord A-dur)
export const playStart = () => {
  playTone(440, 'triangle', 0.1, 0, 0.1);      // A4
  playTone(554.37, 'triangle', 0.1, 0.1, 0.1); // C#5
  playTone(659.25, 'triangle', 0.4, 0.2, 0.1); // E5
};
