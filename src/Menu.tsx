// src/Menu.tsx
import { useEffect, useMemo, useState } from "react";
import { categories, items, type Category, type Item } from "./menuData";

/** GitHub Pages(예: /menu/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

function resolveSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;

  const base = import.meta.env.BASE_URL;
  if (src.startsWith(base)) return src;

  if (src.startsWith("/")) return publicUrl(src);
  return publicUrl(src);
}

function priceLabel(p: Item["price"]) {
  if (p.kind === "market") return "Market Price";
  return `RM ${p.rm.toFixed(2)}`;
}
function priceSubLabel(p: Item["price"]) {
  if (p.kind === "market") return "Ask staff";
  return null;
}

/** Display label (keep internal category values stable) */
function categoryLabel(c: Category) {
  return c === "All" ? "ALL" : c;
}

// NOTE: Category state is intentionally not restored from query/localStorage.
// This ensures that every fresh entry into the Menu tab starts from "All",
// while category changes *within* the Menu page are preserved during the session.

/** requestIdleCallback typing (avoid `any`) */
type IdleDeadline = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    cb: (deadline: IdleDeadline) => void,
    opts?: { timeout: number }
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** Category icon SVG files (public/) */
function categoryIconSrc(c: Category) {
  switch (c) {
    case "All":
      return publicUrl("category-icons/all.svg");
    case "BEEF BBQ":
      return publicUrl("category-icons/beef-bbq.svg");
    case "PORK BBQ":
      return publicUrl("category-icons/pork-bbq.svg");
    case "LIVE":
      return publicUrl("category-icons/live.svg");
    case "OTHER BBQ":
      return publicUrl("category-icons/other-bbq.svg");
    case "HOTPOT":
      return publicUrl("category-icons/hotpot.svg");
    case "STEW":
      return publicUrl("category-icons/stew.svg");
    case "CHEESE SERIES":
      return publicUrl("category-icons/cheese-series.svg");
    case "SIDEDISH":
      return publicUrl("category-icons/sidedish.svg");
    case "RICE":
      return publicUrl("category-icons/rice.svg");
    case "NOODLES":
      return publicUrl("category-icons/noodles.svg");
    case "BEVERAGES":
      return publicUrl("category-icons/beverages.svg");
    default:
      return publicUrl("category-icons/all.svg");
  }
}

/** SVG recolor via CSS mask */
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
      aria-hidden="true"
      className={["inline-block", colorClass, className].join(" ").trim()}
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

/** ---- image preload utils ---- **/
const preloaded = new Set<string>();

function preloadImage(src: string) {
  const s = resolveSrc(src);
  if (!s || preloaded.has(s)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = s;
  preloaded.add(s);
}

function preloadImagesBatch(srcs: string[], batchSize = 6) {
  for (let i = 0; i < Math.min(srcs.length, batchSize); i++) preloadImage(srcs[i]);
}

/** ---- sorting ---- **/
function tagScore(tags?: Item["tags"]) {
  if (!tags || tags.length === 0) return 0;
  return tags.includes("Best") ? 1 : 0;
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

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategorySheet({
  open,
  onClose,
  categories,
  active,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  active: Category;
  onPick: (c: Category) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 z-[999] mx-auto w-full max-w-6xl rounded-t-3xl border border-neutral-200 bg-white p-4 shadow-[0_-20px_60px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-neutral-200" />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold tracking-tight text-neutral-900">
            Choose a category
          </h2>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {categories.map((c) => {
            const isActive = c === active;
            return (
              <button
                key={c}
                onClick={() => {
                  onPick(c);
                  onClose();
                }}
                className={[
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                  isActive
                    ? "border-neutral-900 bg-white text-neutral-900"
                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                ].join(" ")}
                type="button"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <CategoryIcon c={c} className="h-5 w-5 shrink-0" colorClass="bg-neutral-900" />
                  <span className="truncate text-sm font-extrabold">{categoryLabel(c)}</span>
                </span>

                {isActive && <span className="text-xs font-extrabold opacity-70">Selected</span>}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Tip: Use the floating button (after you scroll) to change categories anytime.
        </p>
      </div>
    </div>
  );
}

function Lightbox({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[min(92vw,740px)] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
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
  /**
   * 옵션 B 정책:
   * - 메뉴 탭으로 '새로 진입(마운트)'하면 항상 All
   * - 메뉴 페이지 내부에서 카테고리 이동은 유지
   * - 메뉴를 떠났다가 다시 들어오면 다시 All
   */
  const [active, setActive] = useState<Category>("All");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Item | null>(null);
  const [showFloating, setShowFloating] = useState(false);

  const list = useMemo(() => getItemsForCategory(active), [active]);

  useEffect(() => {
    const first = getItemsForCategory(active).map((x) => x.image.src);
    preloadImagesBatch(first, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const srcs = getItemsForCategory(active).map((x) => x.image.src);
    const run = () => preloadImagesBatch(srcs, 10);
    const w = window as WindowWithIdleCallback;

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => run(), { timeout: 700 });
      return () => w.cancelIdleCallback?.(id);
    }

    const t = window.setTimeout(run, 120);
    return () => window.clearTimeout(t);
  }, [active]);

  useEffect(() => {
    const THRESHOLD = 180;
    let ticking = false;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const next = y > THRESHOLD;
      setShowFloating((prev) => (prev === next ? prev : next));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const canShowFloating = showFloating && !sheetOpen && !lightboxItem;

  const isBbqGroup =
    active === "All" ||
    active === "BEEF BBQ" ||
    active === "PORK BBQ" ||
    active === "OTHER BBQ";

  const showMarketNote = isBbqGroup && list.some((x) => x.price.kind === "market");

  return (
    <div className="mx-auto max-w-6xl pt-2 pb-8 sm:px-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            Menu
          </h1>
          <p className="mt-1 text-sm font-semibold text-neutral-500">
            Browse by category. Tap an item to view photo.
          </p>
        </div>

        <button
          onClick={() => setSheetOpen(true)}
          className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-extrabold text-neutral-900 shadow-sm hover:bg-neutral-50 sm:inline-flex"
          type="button"
        >
          <CategoryIcon c={active} className="h-5 w-5 shrink-0" colorClass="bg-neutral-900" />
          <span className="max-w-[24ch] truncate">{categoryLabel(active)}</span>
          <ChevronDownIcon className="h-5 w-5 text-neutral-500" />
        </button>
      </div>

      <div className="mt-5">
        <button
          onClick={() => setSheetOpen(true)}
          className={[
            "flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-neutral-50",
            // ✅ DOM 제거 대신 숨김 처리(공간 유지 → 스크롤 점프 방지)
            showFloating ? "invisible pointer-events-none" : "visible",
          ].join(" ")}
          type="button"
          aria-hidden={showFloating}
          tabIndex={showFloating ? -1 : 0}
        >
          <span className="flex min-w-0 items-center gap-3">
            <CategoryIcon c={active} className="h-5 w-5 shrink-0" colorClass="bg-neutral-900" />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-neutral-500">Category</span>
              <span className="block truncate text-sm font-extrabold text-neutral-900">
                {categoryLabel(active)}
              </span>
            </span>
          </span>
          <ChevronDownIcon className="h-5 w-5 text-neutral-500" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 sm:mt-6 sm:gap-3 lg:grid-cols-3">
        {list.map((m, idx) => (
          <button
            // ✅ key에서 idx 제거 (불필요한 리마운트/깜빡임 완화)
            key={`${m.category}-${m.id}`}
            onClick={() => {
              preloadImage(m.image.src);
              setLightboxItem(m);
            }}
            className="rounded-3xl border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:bg-neutral-50"
            type="button"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src={resolveSrc(m.image.src)}
                alt={m.image.alt}
                className="h-full w-full object-cover"
                // ✅ 첫 화면에 주로 보이는 6개만 eager, 나머지 lazy
                loading={idx < 6 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>

            {/* ✅ 모바일: desc 아래 price(2줄) → price 아래 tags */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              {/* Left */}
              <div className="min-w-0">
                <h3 className="min-w-0 truncate text-sm font-extrabold leading-snug text-neutral-900 sm:text-base">
                  {m.nameKo ?? m.name}
                </h3>

                {m.nameKo && (
                  <p className="mt-0.5 block w-full truncate text-xs font-semibold text-neutral-500 sm:text-sm">
                    {m.name}
                  </p>
                )}

                {m.desc && (
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-neutral-600 sm:text-sm">
                    {m.desc}
                  </p>
                )}
              </div>

              {/* Right (price → tags) */}
              <div className="mt-1 flex min-w-0 flex-col items-start gap-1 sm:mt-0 sm:items-end sm:text-right">
                <div className="text-sm font-extrabold text-neutral-900">{priceLabel(m.price)}</div>

                {priceSubLabel(m.price) && (
                  <div className="text-xs font-semibold text-neutral-500">
                    {priceSubLabel(m.price)}
                  </div>
                )}

                {!!m.tags?.length && (
                  <div className="mt-1 flex min-w-0 flex-wrap gap-1.5 sm:justify-end">
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
              </div>
            </div>

            <p className="mt-2 text-xs font-semibold text-neutral-500">Tap to view photo</p>
          </button>
        ))}
      </div>

      {showMarketNote && (
        <p className="mt-6 text-xs leading-relaxed text-neutral-600">
          BBQ items may be market price. Please ask our staff for today&apos;s price.
          <br />
          • All prices are subjected to 10% service charge.
          <br />
          • Images shown are for illustration purpose only, actual may differ.
        </p>
      )}

      {canShowFloating && (
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-5 right-5 z-[997] flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-extrabold text-neutral-900 shadow-lg hover:bg-neutral-50"
          aria-label="Change category"
          type="button"
        >
          <CategoryIcon c={active} className="h-5 w-5 shrink-0" colorClass="bg-neutral-900" />
          <span className="max-w-[42vw] truncate">{categoryLabel(active)}</span>
        </button>
      )}

      <CategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        categories={categories}
        active={active}
        onPick={(c) => setActive(c)}
      />

      <Lightbox open={!!lightboxItem} item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </div>
  );
}
