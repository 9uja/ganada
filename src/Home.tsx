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
        // circle hidden + no icon
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

type Slide = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  href?: string; // external
  to?: string; // internal
  ctaLabel?: string;
};

/** Top banner carousel (autoplay always ON, no play/pause) */
function BannerCarousel({
  slides,
  autoMs = 5200,
}: {
  slides: Slide[];
  autoMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const go = (next: number) => {
    const n = slides.length;
    if (n === 0) return;
    const v = ((next % n) + n) % n;
    setIdx(v);
  };

  const prev = () => go(idx - 1);
  const next = () => go(idx + 1);

  // autoplay (always)
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(
      () => setIdx((v) => (v + 1) % slides.length),
      autoMs
    );
    return () => window.clearInterval(t);
  }, [slides.length, autoMs]);

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

  const active = slides[idx];

  const Cta = ({ className = "" }: { className?: string }) => {
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

  // 최상단 배너 캐러셀
  return (
    <section
      className="bg-neutral-950"
      aria-roledescription="carousel"
      aria-label="Top banners"
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
              const isActive = i === idx;
              return (
                <div
                  key={s.id}
                  className={[
                    "absolute inset-0 transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-0 pointer-events-none",
                  ].join(" ")}
                >
                  <img
                    src={publicUrl(s.imageSrc)}
                    alt={s.imageAlt}
                    className="h-full w-full object-cover"
                    loading={isActive ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/15" />
                </div>
              );
            })}

            {/* prev/next (icon removed) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-5">
              <div className="pointer-events-auto">
                <CarouselNavButton
                  ariaLabel="Previous banner"
                  onClick={prev}
                  size="lg"
                />
              </div>

              <div className="pointer-events-auto">
                <CarouselNavButton
                  ariaLabel="Next banner"
                  onClick={next}
                  size="lg"
                />
              </div>
            </div>

            {/* ✅ dots + 1/3 제거 → CTA만 유지 */}
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
 * - 모바일(sm:hidden): 1개씩 보임 + 1개씩 슬라이드 + 자동슬라이드(1초)
 * - 데스크탑(sm:block): 2개씩 보임(페이지당 2개) + 2개씩 슬라이드(페이지 단위) + 자동슬라이드(1초)
 * - 투명 버튼(CarouselNavButton) 제거 금지: 모바일/데스크탑 모두 유지
 */
function RecommendedMenuCarousel({
  list,
  autoMs = 3000, // ✅ 초당 n번 자동 슬라이드
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

  // 데스크탑 자동 슬라이드: 페이지 단위(=2개씩 이동)
  useEffect(() => {
    if (pages.length <= 1) return;
    const t = window.setInterval(() => {
      setDPage((v) => (v + 1) % pages.length);
    }, autoMs);
    return () => window.clearInterval(t);
  }, [pages.length, autoMs]);

  // list/paging 변경 시 index 안전 보정
  useEffect(() => {
    if (mIdx >= list.length) setMIdx(0);
  }, [list.length, mIdx]);

  useEffect(() => {
    if (dPage >= pages.length) setDPage(0);
  }, [pages.length, dPage]);

  return (
    <section className="bg-white p-6 shadow-sm sm:p-8">
      {/* ✅ 헤더: 버튼 유무와 관계없이 제목을 '화면 기준 정중앙'으로 고정 */}
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {/* left spacer (desktop에서만 균형용) */}
        <div className="hidden sm:block" />

        <h2 className="text-center text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
          RECOMMENDED
        </h2>

        {/* Desktop buttons (icon removed) - 제거 금지 */}
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

        {/* 모바일 좌/우 버튼 유지 (제거 금지) */}
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

                  {/* 홀수 개수 보정(2칸 유지) */}
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
  const slides: Slide[] = useMemo(
    () => [
      { id: "b1", imageSrc: "home/banners/01.webp", imageAlt: "Banner 1", to: "/promos" },
      { id: "b2", imageSrc: "home/banners/02.webp", imageAlt: "Banner 2", to: "/menu" },
      { id: "b3", imageSrc: "home/banners/03.webp", imageAlt: "Banner 3", href: "https://wa.me/60123456789" },
    ],
    []
  );

  // RECOMMENDED tagged items auto
  const bestList = useMemo(() => {
    const best = items.filter((it) => it.tags?.includes("RECOMMENDED"));
    return best.length > 0 ? best : items.slice(0, 10);
  }, []);

  return (
    <div className="space-y-8">
      <FullBleed>
        <BannerCarousel slides={slides} />
      </FullBleed>

      {/* ✅ 추천메뉴만 변경됨 */}
      <RecommendedMenuCarousel list={bestList} autoMs={3000} />

      <section className="grid gap-3 sm:grid-cols-3">
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