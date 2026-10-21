import confetti from 'canvas-confetti';

export function triggerConfetti(intensity: 'small' | 'medium' | 'grand' = 'medium') {
  if (typeof window === 'undefined') return;

  if (intensity === 'small') {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    return;
  }

  if (intensity === 'grand') {
    const end = Date.now() + 1500;
    const colors = ['#f43f5e', '#8b5cf6', '#eab308', '#06b6d4', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
    return;
  }

  // Medium standard celebration burst
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']
  });
}
