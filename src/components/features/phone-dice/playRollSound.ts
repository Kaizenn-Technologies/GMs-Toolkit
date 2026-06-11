/**
 * Synthesize a short dice-shake audio effect using the Web Audio API.
 * Pure function — uses no React state, so it lives at module scope.
 */
export function playRollSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 0.15; // 150ms buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise for dice shake/clack
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Low pass filter to make it sound like rolling in a cup
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);
    filter.Q.setValueAtTime(5, audioCtx.currentTime);

    // Gain node for decay
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
  } catch (e) {
    console.warn("AudioContext block/fail:", e);
  }
}
