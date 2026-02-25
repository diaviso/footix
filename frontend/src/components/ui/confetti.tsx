import confetti from 'canvas-confetti';
import type { ReactNode } from 'react';
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

import type {
  GlobalOptions as ConfettiGlobalOptions,
  Options as ConfettiOptions,
} from 'canvas-confetti';

// Types
interface Api {
  fire: (options?: ConfettiOptions) => void;
}

type Props = React.ComponentPropsWithRef<'canvas'> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

export type ConfettiRef = Api | null;

// Context for nested components
const ConfettiContext = createContext<Api | null>(null);

// Main Confetti Component
const Confetti = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props;

  const instanceRef = useRef<confetti.CreateTypes | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fire = useCallback(
    (opts: ConfettiOptions = {}) => {
      instanceRef.current?.({ ...options, ...opts });
    },
    [options]
  );

  const api = useMemo(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!canvasRef.current) return;

    instanceRef.current = confetti.create(canvasRef.current, globalOptions);

    if (!manualstart) {
      fire();
    }

    return () => {
      instanceRef.current?.reset();
    };
  }, [globalOptions, manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

Confetti.displayName = 'Confetti';

// Preset animations

// Basic confetti burst
export function fireConfetti() {
  const end = Date.now() + 1 * 1000;
  const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1', '#3b82f6', '#10b981'];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// Stars confetti
export function fireStars() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
  };

  const shoot = () => {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'],
    });
  };

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

// Fireworks
export function fireFireworks() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
    });
  }, 250);
}

// Side cannons
export function fireSideCannons() {
  const end = Date.now() + 2 * 1000;
  const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// Emoji confetti
export function fireEmoji(emoji: string = '🎉') {
  const scalar = 2;
  const particle = confetti.shapeFromText({ text: emoji, scalar });

  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.96,
    startVelocity: 20,
    shapes: [particle],
    scalar,
  };

  const shoot = () => {
    confetti({ ...defaults, particleCount: 30 });
    confetti({ ...defaults, particleCount: 5 });
    confetti({
      ...defaults,
      particleCount: 15,
      scalar: scalar / 2,
      shapes: ['circle'],
    });
  };

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

// Trophy celebration
export function fireTrophyCelebration() {
  // First wave - side cannons
  fireSideCannons();

  // Second wave - stars after 500ms
  setTimeout(() => {
    fireStars();
  }, 500);

  // Third wave - emoji trophies
  setTimeout(() => {
    fireEmoji('🏆');
  }, 1000);
}

// Theme completion - grand celebration
export function fireThemeCompletion() {
  // Intense fireworks
  fireFireworks();

  // Stars in the middle
  setTimeout(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      origin: { x: 0.5, y: 0.5 },
    };

    confetti({
      ...defaults,
      particleCount: 100,
      scalar: 2,
      shapes: ['star'],
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
    });
  }, 1500);

  // Trophy emojis
  setTimeout(() => {
    fireEmoji('🏆');
  }, 2000);

  // Final burst
  setTimeout(() => {
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.6 },
      colors: ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1', '#3b82f6', '#10b981', '#f59e0b'],
    });
  }, 2500);
}

export { Confetti };
