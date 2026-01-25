// src/Menu.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, items, type Category, type Item } from "./menuData";

/** GitHub Pages에서도 public 파일 경로 안정화 */
const publicUrl = (p: string) =>
  `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

function resolveSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;

  const base = import.meta.env.BASE_URL;
  if (src.startsWith(base)) return src;

  if (src.startsWith("/")) return publicUrl(src);
  return publicUrl(src);
}

function priceLabel(p: Item["price"]) {
  return p.kind === "market" ? "Market Price" : `RM ${p.rm.toFixed(2)}`;
}
function priceSubLabel(p: Item["price"]) {
  return p.kind === "market" ? "Ask staff" : null;
}
function categoryLabel(c: Category) {
  return c === "All" ? "ALL" : c;
}

/** ✅ ArrowUp SVG icon */
function ArrowUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 5l-6 6m6-6l6 6M12 5v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ✅ X icon (for open state) */
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ✅ Right chevron (for category scroller) */
function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Category icon SVG files (public/) */
const CATEGORY_ICON_MAP: Record<string, string> = {
  All: "category-icons/all.svg",
  "BEEF BBQ": "category-icons/beef-bbq.svg",
  "PORK BBQ": "category-icons/pork-bbq.svg",
  LIVE: "category-icons/live.svg",
  "OTHER BBQ": "category-icons/other-bbq.svg",
  HOTPOT: "category-icons/hotpot.svg",
  STEW: "category-icons/stew.svg",
  "CHEESE SERIES": "category-icons/cheese-series.svg",
  SIDEDISH: "category-icons/sidedish.svg",
  RICE: "category-icons/rice.svg",
  NOODLES: "category-icons/noodles.svg",
  BEVERAGES: "category-icons/beverages.svg",
};

function categoryIconSrc(c: Category) {
  const rel = CATEGORY_ICON_MAP[String(c)] ?? "category-icons/all.svg";
  return publicUrl(rel);
}

/** category accent color (bg) */
const CATEGORY_ACCENT_BG: Record<string, string> = {
  All: "bg-amber-400 text-neutral-950",
  "BEEF BBQ": "bg-red-600 text-white",
  "PORK BBQ": "bg-rose-600 text-white",
  LIVE: "bg-emerald-600 text-white",
  "OTHER BBQ": "bg-orange-600 text-white",
  HOTPOT: "bg-indigo-600 text-white",
  STEW: "bg-amber-600 text-white",
  "CHEESE SERIES": "bg-sky-600 text-white",
  NOODLES: "bg-yellow-600 text-white",
  SIDEDISH: "bg-lime-600 text-white",
  RICE: "bg-violet-600 text-white",
  BEVERAGES: "bg-fuchsia-600 text-white",
};

function categoryAccentClass(c: Category) {
  return CATEGORY_ACCENT_BG[String(c)] ?? "bg-neutral-900 text-white";
}

function CategoryIcon({
  c,
  className = "",
  colorClass = "bg-neutral-900",
}: {
  c: Category;
  className?: string;
  colorClass?: string;
}) {
  const url = categoryIconSrc(c);
  return (
    <span
      className={["inline-block", className, colorClass].join(" ").trim()}
      style={{
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/** ---- sorting (Best 우선) ---- **/
function tagScore(tags?: Item["tags"]) {
  if (!tags || tags.length === 0) return 0;
  return (tags as string[]).includes("Best") ? 1 : 0;
}
function getItemsForCategory(active: Category) {
  const indexed = items.map((it, idx) => ({ it, idx }));
  const filtered = active === "All" ? indexed : indexed.filter(({ it }) => it.category === active);

  return filtered
    .sort((a, b) => {
      const s = tagScore(b.it.tags) - tagScore(a.it.tags);
      if (s !== 0) return s;
      return a.idx - b.idx;
    })
    .map(({ it }) => it);
}

/** ✅ Lightbox (swipe down to close) */
function Lightbox({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      setDragging(false);
    }
  }, [open]);

  if (!open || !item) return null;

  const backdropAlpha = Math.max(0.35, 0.6 - dragY / 700);

  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0]?.clientY ?? 0;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const y = e.touches[0]?.clientY ?? 0;
    const delta = y - startYRef.current;
    setDragY(delta > 0 ? delta : 0);
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > 120) {
      onClose();
      return;
    }
    setDragY(0);
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: `rgba(0,0,0,${backdropAlpha})` }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[min(92vw,740px)] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          touchAction: "pan-y",
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-neutral-900">
              {item.nameKo ? item.nameKo : item.name}
            </p>
            {item.nameKo && (
              <p className="truncate text-xs font-semibold text-neutral-500">{item.name}</p>
            )}
            <p className="text-xs text-neutral-500">
              {priceLabel(item.price)}
              {priceSubLabel(item.price) ? ` • ${priceSubLabel(item.price)}` : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-center">
            <img
              src={resolveSrc(item.image.src)}
              alt={item.image.alt}
              className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>

          {item.desc && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {item.desc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [active, setActive] = useState<Category>("All");
  const [lightboxItem, setLightboxItem] = useState<Item | null>(null);

  // floating visibility
  const [showFloating, setShowFloating] = useState(false); // 180px+
  const [showTop, setShowTop] = useState(false); // 300px+

  // category change scroll-to-top after closing overlays
  const [pendingScrollTop, setPendingScrollTop] = useState(false);

  // expandable FAB open/close (category list)
  const [fabOpen, setFabOpen] = useState(false);

  // ✅ panel mounted state (애니메이션 유지 + DOM 제거)
  const [panelMounted, setPanelMounted] = useState(false);
  useEffect(() => {
    if (fabOpen) setPanelMounted(true);
  }, [fabOpen]);

  const list = useMemo(() => getItemsForCategory(active), [active]);

  // top category bubble scroller ref
  const catBarRef = useRef<HTMLDivElement | null>(null);

  // floating visibility
  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY || window.pageYOffset || 0;

    const update = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      setShowFloating(y > 180);
      setShowTop(y > 300);
      // ✅ 여기서는 fabOpen을 닫지 않음 (초기 update()에서도 실행되기 때문)
    };

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;

      // ✅ "실제 스크롤 변화"가 있을 때만 닫기 (미세 흔들림 방지용 임계값)
      if (fabOpen && Math.abs(y - lastY) > 6) {
        setFabOpen(false);
      }
      lastY = y;

      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

  update(); // 초기 1회는 showFloating/showTop만 세팅
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, [fabOpen]);
  // ESC로 fab 닫기
  useEffect(() => {
    if (!fabOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFabOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fabOpen]);

  // iOS 안정성: 라이트박스 닫힌 후 다음 프레임에 스크롤 수행
  useEffect(() => {
    if (!pendingScrollTop) return;
    if (lightboxItem) return;

    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    setPendingScrollTop(false);
    return () => window.cancelAnimationFrame(id);
  }, [pendingScrollTop, lightboxItem]);

  // lightbox 열리면 fab는 닫기
  useEffect(() => {
    if (lightboxItem) setFabOpen(false);
  }, [lightboxItem]);

  // 활성 카테고리 바뀌면 상단 버블을 중앙 쪽으로 스크롤
  useEffect(() => {
    const root = catBarRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLButtonElement>(
      `button[data-cat="${String(active)}"]`
    );
    if (!el) return;

    const r = root.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const delta = b.left - r.left - (r.width / 2 - b.width / 2);

    root.scrollBy({ left: delta, behavior: "smooth" });
  }, [active]);

  const isBbqGroup =
    active === "All" ||
    active === "BEEF BBQ" ||
    active === "PORK BBQ" ||
    active === "OTHER BBQ";

  const showMarketNote = isBbqGroup && list.some((x) => x.price.kind === "market");

  const handlePickCategory = (c: Category) => {
    setActive(c);
    setFabOpen(false);
    setPendingScrollTop(true);
  };

  // iPhone safe-area 고려
  const fabRight = "calc(env(safe-area-inset-right) + 6px)";
  const fabBottom = "calc(env(safe-area-inset-bottom) + 10px)";
  const panelMaxWidth = "calc(100vw - env(safe-area-inset-right) - 12px)";

  const onScrollRight = () => {
    const root = catBarRef.current;
    if (!root) return;
    root.scrollBy({ left: 260, behavior: "smooth" });
  };

  // ✅ 메뉴 카드 3색 얇은 테두리(파랑/빨강/노랑)
  const cardTriBorder =
    "bg-[linear-gradient(90deg,rgba(37,99,235,0.20)_0%,rgba(37,99,235,0.20)_33.33%,rgba(220,38,38,0.20)_33.33%,rgba(220,38,38,0.20)_66.66%,rgba(250,204,21,0.20)_66.66%,rgba(250,204,21,0.20)_100%)]";

  return (
    <div className="mx-auto max-w-6xl px-0 pb-8 sm:px-0">
      {/* 상단 카테고리: 버블 + 가로 스크롤 + 우측 슬라이드 버튼 */}
      <div className="mt-3">
        <div className="relative bg-[#d9c6b6]/70 px-2 py-10 sm:px-4">
          <div
            ref={catBarRef}
            className={[
              "flex items-center gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap pr-10",
              "scroll-smooth",
              "[scrollbar-width:none] [-ms-overflow-style:none]",
              "hide-scrollbar",
            ].join(" ")}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            {categories.map((c) => {
              const isActive = c === active;
              return (
                <button
                  key={String(c)}
                  data-cat={String(c)}
                  onClick={() => handlePickCategory(c)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition",
                    isActive
                      ? `${categoryAccentClass(c)} shadow-sm`
                      : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                  ].join(" ")}
                  type="button"
                >
                  <span
                    className={[
                      "flex items-center justify-center rounded-full",
                      // 모바일에서 아이콘 더 크게
                      "h-8 w-8 sm:h-6 sm:w-6",
                      isActive ? "bg-white/15" : "bg-neutral-900/5",
                    ].join(" ")}
                  >
                    <CategoryIcon
                      c={c}
                      className="h-5 w-5 sm:h-4 sm:w-4"
                      colorClass={isActive ? "bg-white" : "bg-neutral-900"}
                    />
                  </span>
                  <span className="truncate">{categoryLabel(c)}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onScrollRight}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm hover:bg-white"
            type="button"
            aria-label="Scroll categories right"
          >
            <ChevronRightIcon className="h-5 w-5 text-neutral-900" />
          </button>
        </div>
      </div>

      {/* ✅ 메뉴 카드 그리드 (모바일 2개) */}
      <div className="mt-4 grid grid-cols-2 gap-2 px-2 sm:grid-cols-2 sm:gap-3 sm:px-6">
        {list.map((m) => (
          <button
            key={`${m.id}`}
            onClick={() => setLightboxItem(m)}
            className="group w-full text-left"
            type="button"
          >
            {/* ✅ 3색 얇은 테두리 */}
            <div className={["rounded-3xl p-[1px] shadow-sm transition group-hover:shadow-md", cardTriBorder].join(" ")}>
              {/* ✅ 실제 카드 */}
              <div className="overflow-hidden rounded-3xl bg-white">
                <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                  <img
                    src={resolveSrc(m.image.src)}
                    alt={m.image.alt}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="p-4">
                  {/* 모바일/데스크탑 동일 순서: KO → EN → desc → price → tags */}
                  <h3 className="truncate text-base font-extrabold leading-snug text-neutral-900">
                    {m.nameKo ?? m.name}
                  </h3>

                  {m.nameKo && (
                    <p className="truncate text-xs font-semibold text-neutral-500">{m.name}</p>
                  )}

                  {m.desc && (
                    <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-neutral-600 sm:text-sm">
                      {m.desc}
                    </p>
                  )}

                  <div className="mt-2 text-sm font-extrabold text-neutral-900">
                    {priceLabel(m.price)}
                  </div>
                  {priceSubLabel(m.price) && (
                    <div className="text-xs font-semibold text-neutral-500">
                      {priceSubLabel(m.price)}
                    </div>
                  )}

                  {!!m.tags?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className={[
                            "max-w-full rounded-full px-2 py-0.5 text-[11px] font-extrabold",
                            "overflow-hidden text-ellipsis whitespace-nowrap",
                            t === "Best"
                              ? "bg-amber-400 text-neutral-950"
                              : "border border-neutral-200 bg-white text-neutral-700",
                          ].join(" ")}
                          title={t}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-2 text-xs font-semibold text-neutral-500">
                    Tap to view photo
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showMarketNote && (
        <p className="mt-6 px-2 text-xs leading-relaxed text-neutral-600 sm:px-6">
          BBQ items may be market price. Please ask our staff for today&apos;s price.
          <br />
          • All prices are subjected to 10% service charge.
          <br />
          • Images shown are for illustration purpose only, actual may differ.
        </p>
      )}

      {/* Floating UI (카테고리 리스트 + Top) */}
      {!lightboxItem && showFloating && (
        <>
          {/* overlay: 패널이 열렸을 때만 */}
          {fabOpen && (
            <div
              className="fixed inset-0 z-[996] bg-black/10"
              onClick={() => setFabOpen(false)}
              aria-hidden="true"
            />
          )}

          <div
            className="fixed z-[997] flex flex-col items-end"
            style={{ right: fabRight, bottom: fabBottom }}
          >
            {/* ✅ category panel: 애니메이션 유지 + 닫힌 후 DOM 제거 */}
            {panelMounted && (
              <div
                className="mb-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-lg backdrop-blur-sm"
                role="menu"
                aria-hidden={!fabOpen}
                style={{
                  maxWidth: panelMaxWidth,
                  width: "min(320px, 78vw)",
                  // spring 느낌 (근사)
                  transition:
                    "transform 260ms cubic-bezier(0.22, 1.35, 0.36, 1), opacity 220ms ease-out",
                  transform: fabOpen ? "translateY(0px) scale(1)" : "translateY(10px) scale(0.96)",
                  opacity: fabOpen ? 1 : 0,
                  pointerEvents: fabOpen ? "auto" : "none",
                }}
                onTransitionEnd={(e) => {
                  if (!fabOpen && e.propertyName === "transform") setPanelMounted(false);
                }}
              >
                <div
                  className="max-h-[50vh] overflow-y-auto overscroll-contain p-2"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="grid gap-1">
                    {categories.map((c) => {
                      const isActive = c === active;
                      const bgOnly =
                        CATEGORY_ACCENT_BG[String(c)]?.split(" ")[0] ?? "bg-neutral-900";

                      return (
                        <button
                          key={String(c)}
                          onClick={() => handlePickCategory(c)}
                          className={[
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                            isActive ? "bg-neutral-900 text-white" : "hover:bg-neutral-50",
                          ].join(" ")}
                          type="button"
                          role="menuitem"
                        >
                          <span
                            className={[
                              "flex items-center justify-center rounded-full",
                              "h-9 w-9 sm:h-10 sm:w-10",
                              isActive ? "bg-white/15" : bgOnly,
                            ].join(" ")}
                          >
                            <CategoryIcon
                              c={c}
                              className="h-5 w-5 sm:h-5 sm:w-5"
                              colorClass="bg-white"
                            />
                          </span>

                          <span
                            className={[
                              "truncate text-sm font-extrabold",
                              isActive ? "text-white" : "text-neutral-900",
                            ].join(" ")}
                          >
                            {categoryLabel(c)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 메인 버튼(위): 닫힘=현재 카테고리 아이콘, 열림=X */}
            <button
              onClick={() => setFabOpen((v) => !v)}
              className={[
                "flex items-center justify-center rounded-full border border-neutral-200 shadow-xl",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                // 요청: 데스크톱 56, 모바일 40 (Tailwind로 근사 + px로 정확)
                "h-[40px] w-[40px] sm:h-[56px] sm:w-[56px]",
                "transition duration-200 ease-out",
                fabOpen ? "bg-white text-neutral-900" : `border-transparent ${categoryAccentClass(active)}`,
              ].join(" ")}
              aria-label={fabOpen ? "Close category menu" : "Open category menu"}
              type="button"
            >
              {fabOpen ? (
                <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <CategoryIcon
                  c={active}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  colorClass="bg-white"
                />
              )}
            </button>

            {/* Top 버튼(아래) */}
            <button
              onClick={() => {
                setFabOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={[
                "mt-2 flex items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-xl hover:bg-neutral-50",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                "h-[40px] w-[40px] sm:h-[56px] sm:w-[56px]",
                showTop ? "opacity-100" : "pointer-events-none opacity-40",
              ].join(" ")}
              aria-label="Scroll to top"
              type="button"
              disabled={!showTop}
            >
              <ArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </>
      )}

      <Lightbox open={!!lightboxItem} item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </div>
  );
}
