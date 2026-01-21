// src/Menu.tsx
import { useEffect, useMemo, useState } from "react";
import { categories, items, type Category, type Item } from "./menuData";

/** GitHub Pages(예: /menu/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

/** ---------------------------
 * Category icon images (public/)
 * Put files here (PNG recommended per your setup):
 * public/category-icons/
 *   all.png
 *   beef-bbq.png
 *   pork-bbq.png
 *   other-bbq.png
 *   hotpot.png
 *   stew.png
 *   sidedish.png
 *   rice.png
 *   noodles.png
 *   beverages.png
 * -------------------------- */
function categoryIconSrc(c: Category) {
  switch (c) {
    case "All":
      return publicUrl("category-icons/all.png");
    case "BEEF BBQ":
      return publicUrl("category-icons/beef-bbq.png");
    case "PORK BBQ":
      return publicUrl("category-icons/pork-bbq.png");
    case "LIVE":
      return publicUrl("category-icons/live.png");
    case "OTHER BBQ":
      return publicUrl("category-icons/other-bbq.png");
    case "HOTPOT":
      return publicUrl("category-icons/hotpot.png");
    case "STEW":
      return publicUrl("category-icons/stew.png");
    case "CHEESE SERIES":
      return publicUrl("category-icons/cheese-series.png");
    case "SIDEDISH":
      return publicUrl("category-icons/sidedish.png");
    case "RICE":
      return publicUrl("category-icons/rice.png");
    case "NOODLES":
      return publicUrl("category-icons/noodles.png");
    case "BEVERAGES":
      return publicUrl("category-icons/beverages.png");
    default:
      return publicUrl("category-icons/all.png");
  }
}

function CategoryIconImg({
  c,
  className = "",
}: {
  c: Category;
  className?: string;
}) {
  return (
    <img
      src={categoryIconSrc(c)}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

/** ---- image preload utils ---- **/
const preloaded = new Set<string>();

function preloadImage(src: string) {
  if (!src || preloaded.has(src)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  preloaded.add(src);
}

function preloadImagesBatch(srcs: string[], batchSize = 6) {
  for (let i = 0; i < Math.min(srcs.length, batchSize); i++) preloadImage(srcs[i]);
}

/** ---- price label ---- **/
function priceLabel(p: Item["price"]) {
  if (p.kind === "market") return "Market Price";
  return `RM ${p.rm.toFixed(2)}`;
}
function priceSubLabel(p: Item["price"]) {
  if (p.kind === "market") return "Ask staff";
  return null;
}

/** ---- 추천 정렬: Best/Spicy 상단, 나머지는 기존 items 순서 유지 ---- **/
function tagScore(tags?: Item["tags"]) {
  if (!tags || tags.length === 0) return 0;
  return tags.includes("🔥Best") ? 1 : 0; // ✅ Best만 상단
}

function getItemsForCategory(active: Category) {
  const indexed = items.map((it, idx) => ({ it, idx }));
  const filtered =
    active === "All" ? indexed : indexed.filter(({ it }) => it.category === active);

  return filtered
    .sort((a, b) => {
      const s = tagScore(b.it.tags) - tagScore(a.it.tags);
      if (s !== 0) return s;
      return a.idx - b.idx; // keep original order
    })
    .map(({ it }) => it);
}

/** ---- chevron icon ---- **/
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

/** ---- Category bottom sheet ---- **/
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
      className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 z-[999] mx-auto w-full max-w-6xl rounded-t-3xl border border-neutral-800 bg-neutral-950 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-neutral-800" />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Choose a category</h2>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900"
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
                    ? "border-neutral-200 bg-neutral-900 text-neutral-50"
                    : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900/40",
                ].join(" ")}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <CategoryIconImg
                    c={c}
                    className={[
                      "h-5 w-5 shrink-0",
                      isActive ? "opacity-100" : "opacity-90",
                    ].join(" ")}
                  />
                  <span className="truncate text-sm font-semibold">{c}</span>
                </span>

                {isActive && (
                  <span className="text-xs font-semibold opacity-80">Selected</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-neutral-400">
          Tip: Use the floating button (after you scroll) to change categories anytime.
        </p>
      </div>
    </div>
  );
}

/** ---- Lightbox (compact + centered) ---- **/
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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[min(92vw,720px)] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {item.nameKo ? item.nameKo : item.name}
            </p>
            {item.nameKo && <p className="truncate text-xs text-neutral-400">{item.name}</p>}
            <p className="text-xs text-neutral-400">
              {priceLabel(item.price)}
              {priceSubLabel(item.price) ? ` • ${priceSubLabel(item.price)}` : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-center">
            <img
              src={item.image.src}
              alt={item.image.alt}
              className="max-h-[60vh] w-auto max-w-full rounded-2xl object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          {item.desc && (
            <p className="mt-3 whitespace-pre-line text-sm text-neutral-300">
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<Item | null>(null);

  // floating button appears only after some scroll
  const [showFloating, setShowFloating] = useState(false);

  const list = useMemo(() => getItemsForCategory(active), [active]);

  /** initial preload */
  useEffect(() => {
    const first = getItemsForCategory(active).map((x) => x.image.src);
    preloadImagesBatch(first, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** preload on category change */
  useEffect(() => {
    const srcs = getItemsForCategory(active).map((x) => x.image.src);

    const run = () => preloadImagesBatch(srcs, 10);
    const w = window as any;

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(run, { timeout: 700 });
      return () => w.cancelIdleCallback?.(id);
    } else {
      const t = window.setTimeout(run, 120);
      return () => window.clearTimeout(t);
    }
  }, [active]);

  /** preload next category lightly */
  useEffect(() => {
    const idx = categories.indexOf(active);
    const next = categories[(idx + 1) % categories.length];
    const srcsNext = getItemsForCategory(next)
      .slice(0, 6)
      .map((x) => x.image.src);

    const t = window.setTimeout(() => preloadImagesBatch(srcsNext, 6), 250);
    return () => window.clearTimeout(t);
  }, [active]);

  /** scroll observer */
  useEffect(() => {
    const THRESHOLD = 180;
    let ticking = false;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setShowFloating(y > THRESHOLD);
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
    <div className="relative">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu</h1>
          <p className="mt-1 text-sm text-neutral-300">GANADA Korean BBQ • Malaysia</p>
        </div>

        <a
          className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          href="https://wa.me/60123456789"
          target="_blank"
          rel="noreferrer"
        >
          Ask / Order
        </a>
      </div>

      {/* Top category bar: only near top */}
      {!showFloating && (
        <div className="mt-5">
          <button
            onClick={() => setSheetOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-left hover:bg-neutral-900/40"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CategoryIconImg c={active} className="h-5 w-5 shrink-0 opacity-90" />
              <span className="min-w-0">
                <span className="block text-xs text-neutral-400">Category</span>
                <span className="block truncate text-sm font-semibold">{active}</span>
              </span>
            </span>
            <ChevronDownIcon className="h-5 w-5 text-neutral-300" />
          </button>
        </div>
      )}

      {/* Items grid: mobile 2 columns */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              preloadImage(m.image.src);
              setLightboxItem(m);
            }}
            className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3 text-left transition hover:bg-neutral-900/40"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              <img
                src={m.image.src}
                alt={m.image.alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* ✅ KO/EN forced on separate lines (KO top + tags), EN below */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              {/* Left: title/desc */}
              <div className="min-w-0">
                <div className="min-w-0">
                  {/* 1st line: KO + tags */}
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="min-w-0 truncate text-sm font-semibold leading-snug sm:text-base">
                      {m.nameKo ?? m.name}
                    </h3>

                    {m.tags?.map((t) => (
                      <span
                        key={t}
                        className="shrink-0 rounded-full border border-neutral-700 px-2 py-0.5 text-[11px] text-neutral-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* 2nd line: EN (forced new line) */}
                  {m.nameKo && (
                    <p className="mt-0.5 block w-full truncate text-xs text-neutral-400 sm:text-sm">
                      {m.name}
                    </p>
                  )}
                </div>

                {m.desc && (
                  <p className="mt-1 whitespace-pre-line line-clamp-3 text-xs leading-relaxed text-neutral-300 sm:text-sm">
                    {m.desc}
                  </p>
                )}
              </div>

              {/* Right: price (mobile stacked) */}
              <div className="flex items-baseline justify-between gap-2 sm:flex-col sm:items-end sm:text-right">
                <div className="text-sm font-semibold">{priceLabel(m.price)}</div>
                {priceSubLabel(m.price) && (
                  <div className="text-xs text-neutral-400">{priceSubLabel(m.price)}</div>
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-neutral-400">Tap to view photo</p>
          </button>
        ))}
      </div>

      {showMarketNote && (
        <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
          BBQ items may be market price. Please ask our staff for today&apos;s price.
          <br />
          • All prices are subjected to 10% service charge.
          <br />
          • Images shown are for illustration purpose only, actual may differ.
        </p>
      )}

      {/* Floating category button */}
      {canShowFloating && (
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-5 right-5 z-[997] flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-950/90 px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur hover:bg-neutral-900"
          aria-label="Change category"
        >
          <CategoryIconImg c={active} className="h-5 w-5 shrink-0 opacity-95" />
          <span className="max-w-[42vw] truncate">{active}</span>
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
