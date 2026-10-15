"use client";

/**
 * Soft UniteCar field: lime washes + curved strokes + hairline pattern.
 * Decorative only — stays behind content.
 */
export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      {/* Soft color washes */}
      <div className="absolute -left-28 -top-16 h-[48vh] w-[48vw] rounded-full bg-gold/25 blur-3xl" />
      <div className="absolute -right-20 top-[18%] h-[42vh] w-[38vw] rounded-full bg-white/70 blur-3xl" />
      <div className="absolute bottom-[-8%] left-[18%] h-[36vh] w-[55vw] rounded-full bg-gold/15 blur-3xl" />

      {/* Fine diagonal hairlines */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -18deg,
              transparent 0,
              transparent 22px,
              rgba(107, 143, 18, 0.045) 22px,
              rgba(107, 143, 18, 0.045) 23px
            ),
            repeating-linear-gradient(
              72deg,
              transparent 0,
              transparent 48px,
              rgba(20, 22, 20, 0.025) 48px,
              rgba(20, 22, 20, 0.025) 49px
            )
          `,
        }}
      />

      {/* Smooth curved lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <linearGradient id="bc-curve-a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(197,240,66,0)" />
            <stop offset="35%" stopColor="rgba(155,196,30,0.28)" />
            <stop offset="70%" stopColor="rgba(107,143,18,0.14)" />
            <stop offset="100%" stopColor="rgba(197,240,66,0)" />
          </linearGradient>
          <linearGradient id="bc-curve-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(20,22,20,0)" />
            <stop offset="40%" stopColor="rgba(20,22,20,0.08)" />
            <stop offset="100%" stopColor="rgba(20,22,20,0)" />
          </linearGradient>
        </defs>

        <path
          d="M-40,160 C220,40 480,280 760,140 S1200,40 1500,180"
          fill="none"
          stroke="url(#bc-curve-a)"
          strokeWidth="1.5"
        />
        <path
          d="M-60,340 C260,220 520,460 820,300 S1280,220 1520,380"
          fill="none"
          stroke="url(#bc-curve-a)"
          strokeWidth="1.25"
          opacity="0.75"
        />
        <path
          d="M-20,560 C300,440 560,680 900,520 S1320,460 1540,620"
          fill="none"
          stroke="url(#bc-curve-b)"
          strokeWidth="1.25"
        />
        <path
          d="M80,-20 C200,180 120,360 280,520 S420,780 180,940"
          fill="none"
          stroke="url(#bc-curve-b)"
          strokeWidth="1"
          opacity="0.7"
        />
        <path
          d="M1280,-40 C1180,160 1340,340 1200,520 S1080,760 1320,920"
          fill="none"
          stroke="url(#bc-curve-a)"
          strokeWidth="1.1"
          opacity="0.55"
        />
        <path
          d="M-40,760 C360,680 640,860 980,720 S1300,700 1500,820"
          fill="none"
          stroke="url(#bc-curve-a)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>

      {/* Soft vignette so edges stay calm */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(230,233,227,0.55)_100%)]" />
    </div>
  );
}
