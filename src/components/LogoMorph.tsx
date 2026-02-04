// src/components/LogoMorph.tsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Intro sequence (on top of already-rendered Home):
 * 1) Doors exist (flat white, no seam visible)
 * 2) Center "가나다"
 * 3) Pixelize -> galaxy swirl (tilted disk) -> converge to center
 * 4) Pixels -> logo file grows (scale 0 -> 1) to 64px (h-16 w-16)
 * 5) Logo handle turn then shrink
 * 6) Doors open to reveal Home behind
 */

type Props = {
  onDone?: () => void;
  /** /public 기준 로고 경로 (default: /logo-mark.svg) */
  logoSrc?: string;
  /** /public 기준 워드마크 이미지 경로 (default: /ganada-wordmark.png) */
  wordmarkSrc?: string;
};

type Phase =
  | "textPop"
  | "pixelize"
  | "logoGrow"
  | "handleTurn"
  | "logoShrink"
  | "doorsOpen"
  | "done";

type Particle = {
  id: number;
  a0: number;
  r0: number;
  spin: number;
  drift: number;
  size: number;
  alpha: number;
  rgb: readonly [number, number, number];
  kind: "dust" | "star";
};

// Galaxy palette 제한: 검정/파랑/빨강/노랑
const GALAXY_RGB = {
  black: [0, 0, 0] as const,
  blue: [37, 99, 235] as const, // #2563EB
  red: [239, 68, 68] as const, // #EF4444
  yellow: [250, 204, 21] as const, // #FACC15
} as const;

function rgba(rgb: readonly [number, number, number], a: number) {
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function LogoMorph({ onDone, logoSrc = "/logo-mark.svg", wordmarkSrc = "/ganada-wordmark.png" }: Props) {
  const [phase, setPhase] = useState<Phase>("textPop");
  const [now, setNow] = useState(0);
  const raf = useRef<number | null>(null);

  // drive time
  useEffect(() => {
    const start = performance.now();
    const tick = (t: number) => {
      setNow(t - start);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // timeline (ms)
  const T1 = 450; // text pop
  const T2 = 1100; // pixels swirl+converge (a bit longer for "galaxy" feel)
  const T3 = 420; // logo grow
  const T4 = 420; // handle turn
  const T5 = 280; // shrink
  const T6 = 720; // doors open
  const total = T1 + T2 + T3 + T4 + T5 + T6;

  useEffect(() => {
    const t = now;
    if (t < T1) setPhase("textPop");
    else if (t < T1 + T2) setPhase("pixelize");
    else if (t < T1 + T2 + T3) setPhase("logoGrow");
    else if (t < T1 + T2 + T3 + T4) setPhase("handleTurn");
    else if (t < T1 + T2 + T3 + T4 + T5) setPhase("logoShrink");
    else if (t < total) setPhase("doorsOpen");
    else setPhase("done");
  }, [now, total, T1, T2, T3, T4, T5]);

  useEffect(() => {
    if (phase === "done") onDone?.();
  }, [phase, onDone]);

  // Particles: galaxy-like disk with bright core + colorful dust + star glints
  const particles = useMemo<Particle[]>(() => {
    const out: Particle[] = [];
    const N = 600; // ✅ increase density (mobile: reduce to 600 if needed)

    const dustPalette: readonly (readonly [number, number, number])[] = [
      GALAXY_RGB.blue,
      GALAXY_RGB.blue,
      GALAXY_RGB.blue,
      GALAXY_RGB.red,
      GALAXY_RGB.yellow,
      GALAXY_RGB.black,
    ];
    const starPalette: readonly (readonly [number, number, number])[] = [
      GALAXY_RGB.blue,
      GALAXY_RGB.yellow,
      GALAXY_RGB.red,
    ];

    for (let i = 0; i < N; i++) {
      const a0 = Math.random() * Math.PI * 2;
      // bias toward center (pow < 1 makes center denser)
      const r0 = Math.pow(Math.random(), 0.55) * 140; // px
      const spin = (Math.random() * 2.2 + 0.8) * (Math.random() < 0.5 ? -1 : 1);
      const drift = Math.random() * 10;

      const isStar = Math.random() < 0.03;

      // ✅ 픽셀 조금만 더 크게
      // - dust: 2~3px
      // - star: 3~4px
      const size = isStar ? (Math.random() < 0.25 ? 4 : 3) : Math.random() < 0.65 ? 2 : 3;

      const alpha = isStar ? 0.75 + Math.random() * 0.25 : 0.22 + Math.random() * 0.62;

      // ✅ 색 제한: 검정/파랑/빨강/노랑
      // 중심부는 따뜻하게(빨강/노랑) 나올 확률을 조금 올림
      const core = 1 - Math.min(1, r0 / 140);
      const preferWarm = Math.random() < core * 0.55;
      const rgb = isStar
        ? starPalette[Math.floor(Math.random() * starPalette.length)]
        : preferWarm
          ? Math.random() < 0.55
            ? GALAXY_RGB.yellow
            : GALAXY_RGB.red
          : dustPalette[Math.floor(Math.random() * dustPalette.length)];

      out.push({
        id: i,
        a0,
        r0,
        spin,
        drift,
        size,
        alpha,
        rgb,
        kind: isStar ? "star" : "dust",
      });
    }
    return out;
  }, []);

  // Door open progress
  const doorP = (() => {
    if (phase === "doorsOpen") {
      const t = (now - (T1 + T2 + T3 + T4 + T5)) / T6;
      return easeInOutCubic(clamp01(t));
    }
    if (phase === "done") return 1;
    return 0;
  })();

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 999999,
    pointerEvents: "none",
    background: "transparent",
  };

  // Doors: flat white, no seam, no shadow. Use overlap to prevent mobile subpixel gaps.
  const OVERLAP_PX = 6;
  const doorStyleBase: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    background: "#FFFFFF",
    willChange: "transform",
  };

  // Center stage container (for alignment)
  const stageStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
  };

  // 2) text pop: 크게 등장 -> 작게 박히는 느낌
  const textPopP = easeOutCubic(clamp01(now / T1));
  const textScale = 1.65 - 0.65 * textPopP;
  const textOpacity =
    phase === "pixelize" ||
    phase === "logoGrow" ||
    phase === "handleTurn" ||
    phase === "logoShrink" ||
    phase === "doorsOpen" ||
    phase === "done"
      ? 0
      : 1;

  // 3) pixelize: galaxy swirl + converge
  const pixT0 = T1;
  const pixP = phase === "pixelize" ? clamp01((now - pixT0) / T2) : phase === "textPop" ? 0 : 1;
  const converge = easeInOutCubic(pixP);
  const swirl = 1 - converge;

  // 4) logo grows (scale 0->1) to 64px (h-16 w-16)
  const logoGrowT0 = T1 + T2;
  const logoGrowP =
    phase === "logoGrow"
      ? easeOutCubic(clamp01((now - logoGrowT0) / T3))
      : phase === "handleTurn" || phase === "logoShrink" || phase === "doorsOpen" || phase === "done"
        ? 1
        : 0;

  // 5) handle turn + shrink
  const handleT0 = T1 + T2 + T3;
  const handleP =
    phase === "handleTurn"
      ? easeInOutCubic(clamp01((now - handleT0) / T4))
      : phase === "logoShrink" || phase === "doorsOpen" || phase === "done"
        ? 1
        : 0;

  const handleRot = (handleP <= 0.5 ? handleP * 2 : (1 - handleP) * 2) * 28;

  const shrinkT0 = T1 + T2 + T3 + T4;
  const shrinkP =
    phase === "logoShrink"
      ? easeInOutCubic(clamp01((now - shrinkT0) / T5))
      : phase === "doorsOpen" || phase === "done"
        ? 1
        : 0;

  const logoScale = logoGrowP * (1 - 0.85 * shrinkP);

  // doorsOpen 때는 로고를 0으로 보내서 깔끔히 퇴장
  const logoOutScale =
    phase === "doorsOpen" ? Math.max(0, 0.15 * (1 - doorP)) : phase === "done" ? 0 : logoScale;

  // ✅ 문이 열리기 전부터 로고는 완전 투명
  // - doorsOpen 시작 시점(doorP=0)부터 opacity=0
  // - logoShrink 구간에서 끝(≈99.99%)에는 opacity가 0으로 수렴
  const logoOutOpacity =
    phase === "doorsOpen"
      ? 0
      : phase === "logoShrink"
        ? Math.max(0, 1 - shrinkP * 1.05)
        : 1;

  const logoVisible =
    phase === "logoGrow" || phase === "handleTurn" || phase === "logoShrink" || phase === "doorsOpen";

  // lock scroll while overlay active
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (phase === "done") return null;

  // Galaxy presentation settings
  const GALAXY_BOX = 260; // container size (bigger => wider disk)
  const ELLIPSE = 0.48; // y compression (0.35~0.6)
  const ARMS = 2; // 2~4
  const ARM_TWIST = 1.8; // arm curvature

  return (
    <div style={overlayStyle} aria-hidden="true">
      {/* 1) Doors are already present (flat white) */}
      <div
        style={{
          ...doorStyleBase,
          left: 0,
          width: `calc(50% + ${OVERLAP_PX}px)`,
          transform: `translateX(${(-doorP * 110).toFixed(3)}%)`,
        }}
      />
      <div
        style={{
          ...doorStyleBase,
          right: 0,
          width: `calc(50% + ${OVERLAP_PX}px)`,
          transform: `translateX(${(doorP * 110).toFixed(3)}%)`,
        }}
      />

      {/* 2~5) Center animation */}
      <div style={stageStyle}>
        {/* 2) Wordmark image (center) */}
        <img
          src={wordmarkSrc}
          alt=""
          draggable={false}
          style={{
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            transformOrigin: "center",
            transition: "opacity 120ms ease",
            height: 48, // h-12 느낌
            width: "auto",
            maxWidth: "86vw",
            userSelect: "none",
          }}
        />

        {/* 3) Pixel galaxy swirl -> converge */}
        {phase === "pixelize" && (
          <div
            style={{
              position: "absolute",
              width: GALAXY_BOX,
              height: GALAXY_BOX,
              // 3D tilt + diagonal axis (similar to Andromeda angle)
              perspective: "900px",
              transformStyle: "preserve-3d",
              transform: `rotateZ(-22deg) rotateX(62deg) scale(${1 - converge * 0.25})`,
              transformOrigin: "center",
              // blend on white doors; keep particles vivid
              mixBlendMode: "multiply",
            }}
          >
            {particles.map((p) => {
              const tSec = (now - pixT0) / 1000;

              // galaxy swirl dynamics
              const a =
                p.a0 +
                p.spin * tSec * (0.9 + swirl * 2.6) +
                (p.r0 / 140) * ARM_TWIST +
                (p.id % ARMS) * ((Math.PI * 2) / ARMS);

              const r = p.r0 * (0.18 + swirl) + p.drift * Math.sin(tSec * 2 + p.id);
              const rc = r * (1 - converge); // converge to center
              const x = Math.cos(a) * rc;
              const y = Math.sin(a) * rc * ELLIPSE;

              // brighten core: extra opacity toward center
              const coreBoost = 1 - Math.min(1, p.r0 / 140);
              const alpha = Math.min(1, p.alpha + coreBoost * 0.35);

              const isStar = p.kind === "star";
              const color = rgba(p.rgb, alpha);

              return (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: p.size,
                    height: p.size,
                    transform: `translate(${x}px, ${y}px)`,
                    background: color,
                    borderRadius: isStar ? 999 : 2,
                    opacity: 1,
                    // only stars glow (boxShadow is expensive)
                    boxShadow: isStar ? `0 0 ${6 + p.size * 2}px ${color}` : "none",
                    mixBlendMode: "screen",
                  }}
                />
              );
            })}

            {/* bright core bloom (cheap radial) */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 72,
                height: 72,
                transform: "translate(-50%,-50%)",
                borderRadius: 999,
                background:
                  "radial-gradient(circle, rgba(250,204,21,0.85) 0%, rgba(239,68,68,0.33) 28%, rgba(37,99,235,0.12) 58%, rgba(0,0,0,0) 72%)",
                filter: "blur(0.2px)",
                mixBlendMode: "screen",
                opacity: 0.9,
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {/* 4~5) Logo file itself */}
        {logoVisible && (
          <img
            src={logoSrc}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              width: 64, // h-16 w-16
              height: 64, // h-16 w-16
              transform: `rotate(${handleRot}deg) scale(${logoOutScale})`,
              transformOrigin: "center",
              opacity: logoOutOpacity,
              willChange: "transform, opacity",
              userSelect: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}
