let clickAudio: HTMLAudioElement | null = null;
let fillAudio: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;

export function playSound(type: 'click' | 'fill'): void {
  try {
    if (type === 'click') {
      if (!clickAudio) {
        clickAudio = new Audio('/sounds/click.mp3');
      }
      clickAudio.currentTime = 0;
      clickAudio.play().catch(() => {});
    } else if (type === 'fill') {
      if (!fillAudio) {
        fillAudio = new Audio('/sounds/fill.mp3');
      }
      fillAudio.currentTime = 0;
      fillAudio.play().catch(() => {});
    }
  } catch {
    // Ignore audio autoplay restrictions or missing sound
  }
}

export function playCelebrationSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    // Pleasant musical chord: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch {
    // Graceful fallback
  }
}
