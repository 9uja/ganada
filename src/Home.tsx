// src/Home.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { items, type Item } from "./menuData";

/** GitHub Pages(예: /menu/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

/** menuData의 image.src가 "/menu/..." 형태여도 GitHub Pages base를 자동 반영 */
function resolveSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;

  const base = import.meta.env.BASE_URL;
  if (src.startsWith(base)) return src;

  if (src.startsWith("/")) return publicUrl(src);
  return publicUrl(src);
}

/** Full-bleed wrapper inside a centered layout */
function FullBleed({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      {children}
    </div>
  );
}

/**
 * Invisible nav button (arrow removed).
 * - Keeps an accessible hit area but renders no visible icon.
 */
function CarouselNavButton({
  onClick,
  ariaLabel,
  size = "md",
  className = "",
}: {
  onClick: () => void;
  ariaLabel: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-14 w-14" : "h-12 w-12";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center justify-center rounded-full",
        sizeClass,
        "bg-transparent border border-transparent shadow-none",
        "transition active:scale-[0.98] hover:opacity-90",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
        className,
      ].join(" ")}
    >
      {/* arrow/icon intentionally removed */}
    </button>
  );
}

/** prefers-reduced-motion 감지 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(!!mq.matches);
    apply();

    if ("addEventListener" in mq) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    // @ts-expect-error - legacy
    mq.addListener?.(apply);
    // @ts-expect-error - legacy
    return () => mq.removeListener?.(apply);
  }, []);

  return reduced;
}

/** 모바일(sm 미만) 감지 (Tailwind sm = 640px) */
function useIsMobileSm() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsMobile(!!mq.matches);
    apply();

    if ("addEventListener" in mq) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    // @ts-expect-error - legacy
    mq.addListener?.(apply);
    // @ts-expect-error - legacy
    return () => mq.removeListener?.(apply);
  }, []);

  return isMobile;
}

type Slide = {
  id: string;
  type: "image" | "video";
  /** image면 이미지 경로, video면 mp4/webm 경로 */
  src: string;
  /** video 로딩 전 이미지(또는 fallback) */
  poster?: string;
  /** 접근성/SEO용 */
  alt?: string;
  href?: string; // external
  to?: string; // internal
  ctaLabel?: string;
};

/** Top banner carousel */
function BannerCarousel({
  slides,
  autoMs = 5200,
  videoHoldMs = 9000,
}: {
  slides: Slide[];
  autoMs?: number;
  videoHoldMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  // ✅ 슬라이드 자동 이동만 일시정지/재생
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobileSm = useIsMobileSm(); // (디버그/진단용으로 남겨도 됨)

  const active = slides[idx];
  const isActiveVideo = active?.type === "video";

  // ✅ 디버그: 주소창에 ?debugVideo=1
  const debugVideo =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugVideo");

  // ✅ Save-Data(데이터 절약)면 비디오 대신 이미지 (가능한 브라우저만)
  const saveData =
    typeof navigator !== "undefined" &&
    "connection" in navigator &&
    // @ts-expect-error - not typed everywhere
    !!navigator.connection?.saveData;

  /**
   * ✅ 핵심:
   * - DevTools 모바일 뷰에서도 video가 렌더되도록 isMobileSm는 fallback에 쓰지 않음
   * - reduced-motion 또는 saveData일 때만 fallback
   * - debugVideo면 fallback 금지
   */
  const shouldVideoFallback = (prefersReducedMotion || saveData) && !debugVideo;

  const go = (next: number) => {
    const n = slides.length;
    if (n === 0) return;
    const v = ((next % n) + n) % n;
    setIdx(v);
  };

  const prev = () => go(idx - 1);
  const next = () => go(idx + 1);

  /**
   * ✅ 자동 슬라이드
   * - reduced-motion이면 자동 넘김 OFF
   * - paused면 자동 넘김 OFF
   * - 비디오는 videoHoldMs 만큼 머무르고 다음으로 (paused는 비디오 재생/정지에 영향 없음)
   * - 이미지는 autoMs
   */
  useEffect(() => {
    if (slides.length <= 1) return;
    if (prefersReducedMotion) return;
    if (paused) return;

    const dwellMs = isActiveVideo ? videoHoldMs : autoMs;
    const t = window.setTimeout(() => {
      setIdx((v) => (v + 1) % slides.length);
    }, dwellMs);

    return () => window.clearTimeout(t);
  }, [slides.length, prefersReducedMotion, isActiveVideo, autoMs, videoHoldMs, paused]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, slides.length]);

  const Cta = ({ className = "" }: { className?: string }) => {
    // ✅ 비디오 슬라이드에서는 링크/CTA 제거
    if (active?.type === "video") return null;

    if (!active?.ctaLabel) return null;
    const common =
      "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-extrabold shadow-sm transition hover:opacity-95 " +
      className;

    if (active.to) {
      return (
        <Link to={active.to} className={common + " bg-neutral-900 text-white"}>
          {active.ctaLabel}
        </Link>
      );
    }
    if (active.href) {
      return (
        <a
          href={active.href}
          target="_blank"
          rel="noreferrer"
          className={common + " bg-neutral-900 text-white"}
        >
          {active.ctaLabel}
        </a>
      );
    }
    return null;
  };

  // ✅ SVG icons
  function ChevronIcon({
    dir,
    className = "",
    size = 30,
    strokeWidth = 4.6,
  }: {
    dir: "left" | "right";
    className?: string;
    size?: number;
    strokeWidth?: number;
  }) {
    const d = dir === "left" ? "M16 5 L8 12 L16 19" : "M8 5 L16 12 L8 19";
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // ✅ 막대 간격: 7 / 17 (더 쾅)
  function PauseIcon({
    className = "",
    size = 28,
    strokeWidth = 4.2,
  }: {
    className?: string;
    size?: number;
    strokeWidth?: number;
  }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M7 5 V19"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M17 5 V19"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function PlayIcon({
    className = "",
    size = 42,
  }: {
    className?: string;
    size?: number;
  }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <path
          d="
            M8.3 6.6
            C8.3 5.8 9.2 5.3 10.0 5.8
            L19.0 10.9
            C19.9 11.4 19.9 12.6 19.0 13.1
            L10.0 18.2
            C9.2 18.7 8.3 18.2 8.3 17.4
            Z
            "
          fill="currentColor"
        />
      </svg>
    );
  }

  const VideoSlide = ({
    s,
    isActive,
  }: {
    s: Slide;
    isActive: boolean;
  }) => {
    const ref = useRef<HTMLVideoElement | null>(null);

    // autoplay가 막힌 상태면 Tap to play 오버레이 노출
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);

    // ✅ TS6133 fix: muted 값을 읽지 않으므로 첫 원소 생략
    const [, setMuted] = useState(true);

    // ✅ “Sound on/off” 토스트: 기본 숨김, 탭 시 1초만 표시
    const [toastText, setToastText] = useState<"Sound on" | "Sound off" | null>(null);
    const toastTimer = useRef<number | null>(null);

    const showToast = (text: "Sound on" | "Sound off") => {
      setToastText(text);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToastText(null), 1000);
    };

    useEffect(() => {
      return () => {
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
      };
    }, []);

    // ✅ 활성 슬라이드에서만 autoplay 시도 (paused와 무관)
    useEffect(() => {
      if (!isActive) return;
      if (shouldVideoFallback) return;

      const el = ref.current;
      if (!el) return;

      el.muted = true;
      el.playsInline = true;
      setMuted(true);

      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => setAutoplayBlocked(true));
      }
    }, [isActive, shouldVideoFallback, setMuted]);

    // ✅ reduced-motion / saveData → 의도적 이미지 fallback
    if (shouldVideoFallback) {
      return (
        <img
          src={publicUrl(s.poster ?? "home/banners/video-fallback.webp")}
          alt={s.alt ?? "Banner"}
          className="h-full w-full object-cover"
          loading={isActive ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      );
    }

    // ✅ 비활성일 때는 포스터만 (리소스/CPU 절약)
    if (!isActive) {
      return (
        <img
          src={publicUrl(s.poster ?? "home/banners/video-fallback.webp")}
          alt={s.alt ?? "Banner"}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      );
    }

    const onTap = () => {
      const el = ref.current;
      if (!el) return;

      // 1) 재생이 멈춰있거나 autoplay가 막혔으면: 먼저 재생 시도 (무음)
      if (el.paused || autoplayBlocked) {
        el.muted = true;
        el.playsInline = true;

        const p = el.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => setAutoplayBlocked(true));
        }

        setAutoplayBlocked(false);
        setMuted(true);
        showToast("Sound off");
        return;
      }

      // 2) 재생 중이면: 음소거 토글
      const nextMuted = !el.muted;
      el.muted = nextMuted;
      setMuted(nextMuted);
      showToast(nextMuted ? "Sound off" : "Sound on");
    };

    const showPlayOverlay = autoplayBlocked;

    return (
      <div className="relative h-full w-full">
        {/* ✅ 클릭 영역: 재생(필요시) 또는 음소거 토글 */}
        <button
          type="button"
          className="absolute inset-0 z-10"
          aria-label="Play video or toggle sound"
          onClick={onTap}
          style={{ background: "transparent" }}
        >
          {/* Tap to play 오버레이 */}
          {showPlayOverlay ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-black/60 px-6 py-3 text-sm font-extrabold text-white">
                Tap to play
              </div>
            </div>
          ) : null}

          {/* ✅ Sound 토스트: 탭 시 1초만 */}
          {toastText ? (
            <div className="pointer-events-none absolute bottom-4 left-4">
              <div className="rounded-full bg-black/60 px-4 py-2 text-xs font-extrabold text-white">
                {toastText}
              </div>
            </div>
          ) : null}
        </button>

        <video
          key={`video-${s.id}-${idx}`}
          ref={ref}
          className="h-full w-full object-cover"
          poster={s.poster ? publicUrl(s.poster) : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setAutoplayBlocked(false)}
          onPause={() => setAutoplayBlocked(true)}
        >
          <source src={publicUrl(s.src)} type="video/mp4" />
        </video>
      </div>
    );
  };

  // ✅ 컨트롤 버튼 공통 스타일 (54x54, 어두운 회색 원형)
  const baseBtn =
    "w-[42px] h-[42px] sm:w-[54px] sm:h-[54px] " +
    "rounded-full bg-neutral-800 flex items-center justify-center select-none " +
    "transition active:scale-[0.98] hover:opacity-95 " +
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/15";

  // ✅ 색상 규칙
  const iconLeft = "text-blue-500"; // <
  const iconMid = "text-red-500"; // ⏸ / ▶
  const iconRight = "text-yellow-400"; // >

  return (
    <section
      className="bg-neutral-950"
      aria-roledescription="carousel"
      aria-label="Top banners"
      data-mobile={isMobileSm ? "1" : "0"} // 디버그용
    >
      <div className="mx-auto">
        <div className="relative overflow-hidden rounded-none">
          <div
            className="relative h-[500px] sm:h-[540px] lg:h-[540px]"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
              touchDeltaX.current = 0;
            }}
            onTouchMove={(e) => {
              if (touchStartX.current == null) return;
              const x = e.touches[0]?.clientX ?? 0;
              touchDeltaX.current = x - touchStartX.current;
            }}
            onTouchEnd={() => {
              const dx = touchDeltaX.current;
              touchStartX.current = null;
              touchDeltaX.current = 0;
              if (Math.abs(dx) < 42) return;
              if (dx > 0) prev();
              else next();
            }}
          >
            {slides.map((s, i) => {
              const isActiveSlide = i === idx;
              return (
                <div
                  key={s.id}
                  className={[
                    "absolute inset-0",
                    prefersReducedMotion ? "" : "transition-opacity duration-500",
                    isActiveSlide ? "opacity-100" : "opacity-0 pointer-events-none",
                  ].join(" ")}
                >
                  {/* ✅ Full-banner click (image slides only) */}
                  {active?.type === "image" && (active.to || active.href) ? (
                    active.to ? (
                      <Link
                        to={active.to}
                        aria-label={`Go to ${active.alt ?? "banner link"}`}
                        className="absolute inset-0 z-10"
                      />
                    ) : (
                      <a
                        href={active.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${active.alt ?? "banner link"}`}
                        className="absolute inset-0 z-10"
                      />
                    )
                  ) : null}
                  {s.type === "video" ? (
                    <VideoSlide s={s} isActive={isActiveSlide} />
                  ) : (
                    <img
                      src={publicUrl(s.src)}
                      alt={s.alt ?? ""}
                      className="h-full w-full object-cover"
                      loading={isActiveSlide ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/15" />
                </div>
              );
            })}

            {/* prev/next (icon removed) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-5">
              <div className="pointer-events-auto">
                <CarouselNavButton ariaLabel="Previous banner" onClick={prev} size="lg" />
              </div>

              <div className="pointer-events-auto">
                <CarouselNavButton ariaLabel="Next banner" onClick={next} size="lg" />
              </div>
            </div>

            {/* ✅ Bottom-right controls: SVG chevrons + pause/play (autoslide only) */}
            <div className="absolute bottom-4 left-1/2 translate-x-[30px] sm:translate-x-[220px] lg:translate-x-[320px] z-20 flex gap-3 pointer-events-auto">
              {/* < prev */}
              <button
                type="button"
                aria-label="Previous slide"
                className={baseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
              >
                <ChevronIcon dir="left" className={iconLeft} />
              </button>

              {/* ⏸ / ▶ */}
              <button
                type="button"
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                className={baseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaused((v) => !v);
                }}
              >
                {paused ? (
                  <PlayIcon className={iconMid} />
                ) : (
                  <PauseIcon className={iconMid} />
                )}
              </button>

              {/* > next */}
              <button
                type="button"
                aria-label="Next slide"
                className={baseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
              >
                <ChevronIcon dir="right" className={iconRight} />
              </button>
            </div>

            {/* CTA (비디오 슬라이드에서는 숨김) */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="mx-auto flex max-w-6xl justify-end px-4 pb-4 pt-3 sm:pb-5">
                <Cta />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ✅ 추천메뉴
 * - 모바일(sm:hidden): 1개씩 보임 + 1개씩 슬라이드 + 자동슬라이드
 * - 데스크탑(sm:block): 2개씩 보임(페이지당 2개) + 2개씩 슬라이드(페이지 단위) + 자동슬라이드
 * - 투명 버튼(CarouselNavButton) 제거 금지: 모바일/데스크탑 모두 유지
 */
function RecommendedMenuCarousel({
  list,
  autoMs = 3000,
}: {
  list: Item[];
  autoMs?: number;
}) {
  if (list.length === 0) return null;

  // ---------------------------
  // Mobile: 1개씩 (item 단위)
  // ---------------------------
  const [mIdx, setMIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goMobile = (next: number) => {
    const n = list.length;
    if (n === 0) return;
    const v = ((next % n) + n) % n;
    setMIdx(v);
  };
  const prevMobile = () => goMobile(mIdx - 1);
  const nextMobile = () => goMobile(mIdx + 1);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = window.setInterval(() => {
      setMIdx((v) => (v + 1) % list.length);
    }, autoMs);
    return () => window.clearInterval(t);
  }, [list.length, autoMs]);

  // ---------------------------
  // Desktop: 2개씩 (page 단위)
  // ---------------------------
  const pages = useMemo(() => {
    const out: Item[][] = [];
    for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2));
    return out;
  }, [list]);

  const [dPage, setDPage] = useState(0);

  const goDesktop = (next: number) => {
    const n = pages.length;
    if (n === 0) return;
    const v = ((next % n) + n) % n;
    setDPage(v);
  };
  const prevDesktop = () => goDesktop(dPage - 1);
  const nextDesktop = () => goDesktop(dPage + 1);

  useEffect(() => {
    if (pages.length <= 1) return;
    const t = window.setInterval(() => {
      setDPage((v) => (v + 1) % pages.length);
    }, autoMs);
    return () => window.clearInterval(t);
  }, [pages.length, autoMs]);

  useEffect(() => {
    if (mIdx >= list.length) setMIdx(0);
  }, [list.length, mIdx]);

  useEffect(() => {
    if (dPage >= pages.length) setDPage(0);
  }, [pages.length, dPage]);

  return (
    <section className="bg-white p-6 shadow-sm sm:p-8">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="hidden sm:block" />
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
          RECOMMENDED
        </h2>
        <div className="hidden items-center justify-end gap-2 sm:flex">
          <CarouselNavButton ariaLabel="이전" onClick={prevDesktop} size="sm" />
          <CarouselNavButton ariaLabel="다음" onClick={nextDesktop} size="sm" />
        </div>
      </div>

      {/* ---------------- MOBILE (1개씩) ---------------- */}
      <div className="relative mt-5 sm:hidden flex justify-center">
        <div
          className="relative w-full max-w-[720px] overflow-hidden rounded-3xl border border-neutral-200 bg-white"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
            touchDeltaX.current = 0;
          }}
          onTouchMove={(e) => {
            if (touchStartX.current == null) return;
            const x = e.touches[0]?.clientX ?? 0;
            touchDeltaX.current = x - touchStartX.current;
          }}
          onTouchEnd={() => {
            const dx = touchDeltaX.current;
            touchStartX.current = null;
            touchDeltaX.current = 0;
            if (Math.abs(dx) < 42) return;
            if (dx > 0) prevMobile();
            else nextMobile();
          }}
        >
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${mIdx * 100}%)` }}
          >
            {list.map((m) => (
              <div key={m.id} className="w-full shrink-0 p-3">
                <Link
                  to={`/menu?item=${encodeURIComponent(m.id)}`}
                  className="block rounded-3xl bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                    <img
                      src={resolveSrc(m.image.src)}
                      alt={m.image.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </div>

                  <div className="mt-3 flex flex-col items-center text-center gap-1">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="truncate text-xl font-extrabold leading-snug text-neutral-900">
                        {m.nameKo ?? m.name}
                      </h3>
                    </div>

                    {m.nameKo && (
                      <p className="truncate text-xl font-semibold text-neutral-500">
                        {m.name}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between">
          <div className="pointer-events-auto -translate-x-[40%]">
            <CarouselNavButton ariaLabel="이전" onClick={prevMobile} size="sm" />
          </div>
          <div className="pointer-events-auto translate-x-[40%]">
            <CarouselNavButton ariaLabel="다음" onClick={nextMobile} size="sm" />
          </div>
        </div>
      </div>

      {/* ---------------- DESKTOP (2개씩, 2개씩 슬라이드) ---------------- */}
      <div className="relative mt-5 hidden sm:flex justify-center">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${dPage * 100}%)` }}
          >
            {pages.map((page, pageIdx) => (
              <div key={`page-${pageIdx}`} className="w-full shrink-0 p-3">
                <div className="grid grid-cols-2 gap-3">
                  {page.map((m) => (
                    <Link
                      key={`${m.category}-${m.id}`}
                      to={`/menu?item=${encodeURIComponent(m.id)}`}
                      className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:bg-neutral-50"
                    >
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                        <img
                          src={resolveSrc(m.image.src)}
                          alt={m.image.alt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </div>

                      <div className="mt-3 flex flex-col items-center text-center gap-1">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="truncate text-xl font-extrabold leading-snug text-neutral-900 sm:text-xl">
                            {m.nameKo ?? m.name}
                          </h3>
                        </div>

                        {m.nameKo && (
                          <p className="truncate text-lg font-semibold text-neutral-800 sm:text-lg">
                            {m.name}
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-semibold text-neutral-500 text-center">
                        Tap to view
                      </p>
                    </Link>
                  ))}

                  {page.length === 1 && (
                    <div className="rounded-3xl border border-transparent p-3" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  /**
   * ✅ 파일 위치 (Vite public)
   * - public/home/banners/01.mp4
   * - public/home/banners/01.webp (poster 권장)
   */
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "b1",
        type: "video",
        src: "home/banners/01.mp4",
        poster: "home/banners/01.webp",
        alt: "Banner video",
      },
      {
        id: "b2",
        type: "image",
        src: "home/banners/02.webp",
        alt: "Banner 2",
        to: "/menu",
      },
      {
        id: "b3",
        type: "image",
        src: "home/banners/03.webp",
        alt: "Banner 3",
        to: "/menu",
      },
    ],
    []
  );

  const bestList = useMemo(() => {
    const best = items.filter((it) => it.tags?.includes("RECOMMENDED"));
    return best.length > 0 ? best : items.slice(0, 10);
  }, []);

  return (
    <div className="space-y-8">
      <FullBleed>
        <BannerCarousel slides={slides} autoMs={5200} videoHoldMs={9000} />
      </FullBleed>

      <RecommendedMenuCarousel list={bestList} autoMs={3000} />

      <section className="grid gap-3 sm:grid-cols-3 px-6">
        <Link
          to="/menu"
          className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="text-sm font-extrabold text-neutral-900">Menu</div>
          <p className="mt-1 text-sm text-neutral-600">대표 메뉴를 빠르게 확인하세요.</p>
          <div className="mt-3 text-sm font-extrabold text-neutral-900">
            보러가기 <span aria-hidden="true">→</span>
          </div>
        </Link>

        <Link
          to="/promos"
          className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="text-sm font-extrabold text-neutral-900">What’s New</div>
          <p className="mt-1 text-sm text-neutral-600">신메뉴/프로모션 소식.</p>
          <div className="mt-3 text-sm font-extrabold text-neutral-900">
            보러가기 <span aria-hidden="true">→</span>
          </div>
        </Link>

        <Link
          to="/contact"
          className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="text-sm font-extrabold text-neutral-900">Contact</div>
          <p className="mt-1 text-sm text-neutral-600">예약/문의/오시는 길.</p>
          <div className="mt-3 text-sm font-extrabold text-neutral-900">
            보러가기 <span aria-hidden="true">→</span>
          </div>
        </Link>
      </section>

      <div className="h-6" />
    </div>
  );
}
