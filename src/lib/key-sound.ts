/**
 * Tiny key-press sounds, generated with the Web Audio API (no audio files).
 * Only plays when the user has switched on Settings → Sound effects.
 */

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** A short soft tick for a correct key, a lower thud for a wrong one. */
export function playKeySound(correct: boolean) {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = correct ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(correct ? 880 : 180, now);
  const peak = correct ? 0.04 : 0.06;
  const length = correct ? 0.035 : 0.09;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + length + 0.01);
}
