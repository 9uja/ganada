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

/** ✅ Chevron up/down (use instead of + / -) */
function ChevronUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 15l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ✅ Shopping cart icon */
function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.6L4.7 4.5A1.5 1.5 0 0 0 3.2 3H2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        fill="currentColor"
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
          transition: dragging ? "none" : "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          touchAction: "pan-y",
        }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2.5">
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

  /** Cart: itemId -> qty */
  const [cart, setCart] = useState<Record<string, number>>(() => {
    const sanitize = (obj: unknown): Record<string, number> => {
      if (!obj || typeof obj !== "object") return {};
      const o = obj as Record<string, unknown>;
      const out: Record<string, number> = {};
      for (const [id, v] of Object.entries(o)) {
        const qty = typeof v === "number" ? v : Number(v);
        if (!Number.isFinite(qty) || qty <= 0) continue;

        const it = items.find((x) => String(x.id) === String(id));
        if (!it) continue;
        // ✅ market price는 장바구니에 포함하지 않음
        if (it.price.kind === "market") continue;

        out[String(id)] = Math.floor(qty);
      }
      return out;
    };

    try {
      const raw = localStorage.getItem("ganada_cart_v1");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return sanitize(parsed);
    } catch {
      return {};
    }
  });

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0),
    [cart]
  );

  const cartItems = useMemo(() => {
    const map = new Map(items.map((it) => [String(it.id), it] as const));
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty, item: map.get(id) ?? null }))
      .filter((x): x is { id: string; qty: number; item: Item } => !!x.item);
  }, [cart]);

  // ✅ persist cart across navigation/reload
  useEffect(() => {
    try {
      if (Object.keys(cart).length === 0) {
        localStorage.removeItem("ganada_cart_v1");
      } else {
        localStorage.setItem("ganada_cart_v1", JSON.stringify(cart));
      }
    } catch {
      // ignore
    }
  }, [cart]);

  const cartTotals = useMemo(() => {
    let totalRm = 0;
    let hasMarket = false;
    for (const { qty, item } of cartItems) {
      if (!item) continue;
      if (item.price.kind === "market") {
        hasMarket = true;
        continue;
      }
      totalRm += item.price.rm * qty;
    }
    // round to 2dp
    totalRm = Math.round(totalRm * 100) / 100;
    return { totalRm, hasMarket };
  }, [cartItems]);

  const addToCart = (id: string) => {
    const it = items.find((x) => String(x.id) === String(id));
    if (!it) return;
    if (it.price.kind === "market") return; // ✅ market 차단
    setCart((prev) => ({ ...prev, [String(id)]: (prev[String(id)] ?? 0) + 1 }));
  };
  const incCart = (id: string) => {
    const it = items.find((x) => String(x.id) === String(id));
    if (!it) return;
    if (it.price.kind === "market") return; // ✅ market 차단
    setCart((prev) => ({ ...prev, [String(id)]: (prev[String(id)] ?? 0) + 1 }));
  };
  const decCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? 0;
      const v = cur - 1;
      if (v <= 0) delete next[id];
      else next[id] = v;
      return next;
    });
  };

  const clearCart = () => {
    if (Object.keys(cart).length === 0) return;
    const ok = window.confirm("Clear cart?");
    if (!ok) return;
    setCart({});
    try {
      localStorage.removeItem("ganada_cart_v1");
    } catch {
      // ignore
    }
  };

  const [cartOpen, setCartOpen] = useState(false);
  const [cartPageOpen, setCartPageOpen] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);
  useEffect(() => {
    if (cartOpen) setCartMounted(true);
  }, [cartOpen]);

  // floating visibility
  // ✅ 플로팅 메뉴는 항상 노출
  const [showFloating, setShowFloating] = useState(true);
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

  // ✅ cart button ref (Fly-to-cart target)
  const cartBtnRef = useRef<HTMLButtonElement | null>(null);

  /** =========================
   *  Fly-to-cart tuning knobs
   *  ========================= */
  const FLY_MS = 320; // ← 여기서 미세 조정
  const FLY_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // ← 여기서 미세 조정
  const BOUNCE_MS = 100; // ← 여기서 미세 조정
  const BOUNCE_EASE = "cubic-bezier(0.22, 12.35, 0.36, 1)"; // ← 여기서 미세 조정

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getCardImageElFromButton = (btn: HTMLElement) => {
    const card = btn.closest<HTMLElement>('[data-menu-card="1"]');
    if (!card) return null;
    const img = card.querySelector<HTMLImageElement>('img[data-menu-img="1"]');
    return img ?? null;
  };

  const bounceCartButton = () => {
    const el = cartBtnRef.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    try {
      el.animate(
        [
          { transform: "translateZ(0) scale(1)" },
          { transform: "translateZ(0) scale(1.08)" },
          { transform: "translateZ(0) scale(1)" },
        ],
        { duration: BOUNCE_MS, easing: BOUNCE_EASE }
      );
    } catch {
      // ignore
    }
  };

  const flyToCart = (imgEl: HTMLImageElement) => {
    const targetBtn = cartBtnRef.current;
    if (!imgEl || !targetBtn) return;

    if (prefersReducedMotion()) {
      bounceCartButton();
      return;
    }

    const from = imgEl.getBoundingClientRect();
    const to = targetBtn.getBoundingClientRect();

    // destination = cart button center
    const toX = to.left + to.width / 2;
    const toY = to.top + to.height / 2;

    // source = img center
    const fromX = from.left + from.width / 2;
    const fromY = from.top + from.height / 2;

    const dx = toX - fromX;
    const dy = toY - fromY;

    const ghost = imgEl.cloneNode(true) as HTMLImageElement;
    ghost.alt = "";
    ghost.decoding = "async";
    ghost.draggable = false;

    // styling
    ghost.style.position = "fixed";
    ghost.style.left = `${from.left}px`;
    ghost.style.top = `${from.top}px`;
    ghost.style.width = `${from.width}px`;
    ghost.style.height = `${from.height}px`;
    ghost.style.objectFit = "contain";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";
    ghost.style.borderRadius = "16px";
    ghost.style.background = "rgba(255,255,255,0.85)";
    ghost.style.boxShadow = "0 18px 50px rgba(0,0,0,0.20)";

    document.body.appendChild(ghost);

    // animate flight
    try {
      ghost.animate(
        [
          { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.18)`, opacity: 0 },
        ],
        { duration: FLY_MS, easing: FLY_EASE }
      );
    } catch {
      // ignore
    }

    // cleanup + bounce
    window.setTimeout(() => {
      try {
        ghost.remove();
      } catch {
        // ignore
      }
      bounceCartButton();
    }, FLY_MS);
  };

  // floating visibility
  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY || window.pageYOffset || 0;

    const update = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      // ✅ 항상 보이게 유지
      setShowFloating(true);
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

  // cart / fab는 상호 배타적으로
  useEffect(() => {
    if (fabOpen) setCartOpen(false);
  }, [fabOpen]);
  useEffect(() => {
    if (cartOpen) setFabOpen(false);
  }, [cartOpen]);
  useEffect(() => {
    if (lightboxItem) setCartOpen(false);
  }, [lightboxItem]);

  useEffect(() => {
    if (cartPageOpen) {
      setFabOpen(false);
      setCartOpen(false);
      setLightboxItem(null);
    }
  }, [cartPageOpen]);

  // 활성 카테고리 바뀌면 상단 버블을 중앙 쪽으로 스크롤
  useEffect(() => {
    const root = catBarRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLButtonElement>(`button[data-cat="${String(active)}"]`);
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

  // ✅ Cart 버튼 3색 링(항상)
  const cartRing =
    "bg-[conic-gradient(from_0deg,#2563eb_0%,#2563eb_33%,#dc2626_33%,#dc2626_66%,#facc15_66%,#facc15_100%)]";

  return (
    <div className="mx-auto max-w-6xl px-0 pb-8 sm:px-0">
      {/* 상단 카테고리: 버블 + 가로 스크롤 + 우측 슬라이드 버튼 */}
      <div className="mt-0">
        <div className="relative bg-[#d9c6b6]/70 px-4 py-12 sm:px-4">
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
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold transition",
                    isActive
                      ? `${categoryAccentClass(c)} shadow-sm`
                      : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                  ].join(" ")}
                  type="button"
                >
                  <span
                    className={[
                      "flex items-center justify-center rounded-full",
                      "h-8 w-8 sm:h-8 sm:w-8",
                      isActive ? "bg-white/15" : "bg-neutral-900/5",
                    ].join(" ")}
                  >
                    <CategoryIcon
                      c={c}
                      className="h-4 w-4 sm:h-4 sm:w-4"
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
            className="absolute right-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full shadow-sm"
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
          <div
            key={`${m.id}`}
            role="button"
            tabIndex={0}
            onClick={() => setLightboxItem(m)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setLightboxItem(m);
            }}
            className="group w-full cursor-pointer text-left"
            data-menu-card="1"
          >
            {/* ✅ 3색 얇은 테두리 */}
            <div className={["rounded-3xl p-[1px] shadow-sm transition group-hover:shadow-lg", cardTriBorder].join(" ")}>
              {/* ✅ 실제 카드 */}
              <div className="relative overflow-hidden rounded-3xl bg-white">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white p-2 pt-3">
                  <img
                    src={resolveSrc(m.image.src)}
                    alt={m.image.alt}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                    data-menu-img="1"
                  />

                  {/* Add to cart (+) top-right */}
                  {m.price.kind !== "market" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const imgEl = getCardImageElFromButton(e.currentTarget as HTMLButtonElement);
                        if (imgEl) flyToCart(imgEl);
                        addToCart(String(m.id));
                      }}
                      className={[
                        "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full",
                      ].join(" ")}
                      aria-label="Add to cart"
                      type="button"
                    >
                      <span className="text-xl font-extrabold leading-none">+</span>
                    </button>
                  )}
                </div>

                {/* ✅ compact content */}
                <div className="p-3">
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

                  <div className="mt-2 text-sm font-extrabold text-neutral-900">{priceLabel(m.price)}</div>
                  {priceSubLabel(m.price) && (
                    <div className="text-xs font-semibold text-neutral-500">{priceSubLabel(m.price)}</div>
                  )}

                  {!!m.tags?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className={[
                            "max-w-full rounded-full px-1.5 py-0.5 text-[9px] font-extrabold",
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

                  {/* Tap to view + Add to cart */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-neutral-400">Tap to view</p>

                    {m.price.kind !== "market" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const imgEl = getCardImageElFromButton(e.currentTarget as HTMLButtonElement);
                          if (imgEl) flyToCart(imgEl);
                          addToCart(String(m.id));
                        }}
                        className="shrink-0 text-xs font-extrabold text-neutral-900 decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
                        type="button"
                        aria-label="Add to cart"
                      >
                        Add to cart
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-neutral-400"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showMarketNote && (
        <p className="mt-6 px-2 text-xs leading-relaxed text-neutral-100 sm:px-6">
          BBQ items may be market price. Please ask our staff for today&apos;s price.
          <br />
          • All prices are subjected to 10% service charge.
          <br />
          • Images shown are for illustration purpose only, actual may differ.
        </p>
      )}

      {/* Floating UI (카테고리 리스트 + 장바구니 + Top) */}
      {!lightboxItem && showFloating && (
        <>
          {/* overlay: 패널이 열렸을 때만 */}
          {(fabOpen || cartOpen) && (
            <div
              className="fixed inset-0 z-[996] bg-black/10"
              onClick={() => {
                setFabOpen(false);
                setCartOpen(false);
              }}
              aria-hidden="true"
            />
          )}

          <div className="fixed z-[997] flex flex-col items-end" style={{ right: fabRight, bottom: fabBottom }}>
            {/* ✅ cart panel */}
            {cartMounted && (
              <div
                className="mb-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-lg backdrop-blur-sm"
                aria-hidden={!cartOpen}
                role="dialog"
                aria-modal="true"
                style={{
                  maxWidth: panelMaxWidth,
                  width: "min(420px, calc(100vw - 12px))",
                  transition: "transform 260ms cubic-bezier(0.22, 1.35, 0.36, 1), opacity 220ms ease-out",
                  transform: cartOpen ? "translateY(0px) scale(1)" : "translateY(10px) scale(0.96)",
                  opacity: cartOpen ? 1 : 0,
                  pointerEvents: cartOpen ? "auto" : "none",
                }}
                onTransitionEnd={(e) => {
                  if (!cartOpen && e.propertyName === "transform") setCartMounted(false);
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-neutral-900">Cart</p>
                    <p className="text-xs font-semibold text-neutral-500">
                      {cartCount === 0 ? "Empty" : `${cartCount} items`}
                    </p>
                  </div>

                  <button
                    onClick={() => setCartOpen(false)}
                    className={[
                      "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                      "border border-neutral-100 bg-white text-neutral-900 hover:bg-neutral-50",
                      "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                    ].join(" ")}
                    type="button"
                    aria-label="Close cart"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className="max-h-[50vh] overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {cartItems.length === 0 ? (
                    <p className="py-10 text-center text-sm font-semibold text-neutral-500">Cart is empty.</p>
                  ) : (
                    <div className="grid gap-3">
                      {cartItems.map(({ id, qty, item }) => {
                        if (!item) return null;
                        return (
                          <div key={id} className="flex min-w-0 items-center gap-2">
                            <div className="h-12 w-12 flex-none overflow-hidden rounded-xl border border-neutral-200 bg-white">
                              <img
                                src={resolveSrc(item.image.src)}
                                alt={item.image.alt}
                                className="h-full w-full object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>

                            <div className="min-w-0 flex-1 pr-1">
                              <p className="truncate text-sm font-extrabold text-neutral-900">
                                {item.nameKo ?? item.name}
                              </p>
                              {item.nameKo && (
                                <p className="truncate text-xs font-semibold text-neutral-500">{item.name}</p>
                              )}
                            </div>

                            <div className="flex flex-none items-center gap-1">
                              <button
                                onClick={() => decCart(id)}
                                className={[
                                  "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                                  "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                                ].join(" ")}
                                type="button"
                                aria-label="Decrease quantity"
                              >
                                <ChevronDownIcon className="h-5 w-5" />
                              </button>

                              <span className="w-7 text-center text-sm font-extrabold text-neutral-900">{qty}</span>

                              <button
                                onClick={() => incCart(id)}
                                className={[
                                  "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                                  "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                                ].join(" ")}
                                type="button"
                                aria-label="Increase quantity"
                              >
                                <ChevronUpIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ✅ cart footer (clear + total) */}
                <div className="border-t border-neutral-200 px-3 py-2.5">
                  <div className="flex items-stretch gap-2">
                    <button
                      onClick={clearCart}
                      className={[
                        "rounded-2xl px-3 py-3 text-left",
                        "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 active:scale-[0.99]",
                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                        cartCount === 0 ? "opacity-50 pointer-events-none" : "",
                      ].join(" ")}
                      type="button"
                      aria-label="Clear cart"
                      disabled={cartCount === 0}
                    >
                      <span className="text-sm font-extrabold">Clear</span>
                    </button>

                    <button
                      onClick={() => {
                        setCartPageOpen(true);
                      }}
                      className={[
                        "flex-1 rounded-2xl px-3 py-3 text-left",
                        "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:scale-[0.99]",
                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/20",
                        cartCount === 0 ? "opacity-50 pointer-events-none" : "",
                      ].join(" ")}
                      type="button"
                      aria-label="View cart total"
                      disabled={cartCount === 0}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-extrabold">Total</span>
                        <span className="text-sm font-extrabold">RM {cartTotals.totalRm.toFixed(2)}</span>
                      </div>
                      {cartTotals.hasMarket && (
                        <div className="mt-1 text-xs font-semibold text-white/80">
                          Market price items are not included in the total.
                        </div>
                      )}
                      <div className="mt-1 text-xs font-semibold text-white/80">View cart</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ category panel: 애니메이션 유지 + 닫힌 후 DOM 제거 */}
            {panelMounted && (
              <div
                className="mb-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-lg backdrop-blur-sm"
                role="menu"
                aria-hidden={!fabOpen}
                style={{
                  maxWidth: panelMaxWidth,
                  width: "min(320px, 78vw)",
                  transition: "transform 260ms cubic-bezier(0.22, 1.35, 0.36, 1), opacity 220ms ease-out",
                  transform: fabOpen ? "translateY(0px) scale(1)" : "translateY(10px) scale(0.96)",
                  opacity: fabOpen ? 1 : 0,
                  pointerEvents: fabOpen ? "auto" : "none",
                }}
                onTransitionEnd={(e) => {
                  if (!fabOpen && e.propertyName === "transform") setPanelMounted(false);
                }}
              >
                <div className="max-h-[50vh] overflow-y-auto overscroll-contain p-2" style={{ WebkitOverflowScrolling: "touch" }}>
                  <div className="grid gap-1">
                    {categories.map((c) => {
                      const isActive = c === active;
                      const bgOnly = CATEGORY_ACCENT_BG[String(c)]?.split(" ")[0] ?? "bg-neutral-900";

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
                            <CategoryIcon c={c} className="h-5 w-5 sm:h-5 sm:w-5" colorClass="bg-white" />
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
                "h-[56px] w-[56px] sm:h-[56px] sm:w-[56px]",
                "transition duration-200 ease-out",
                fabOpen ? "bg-white text-neutral-900" : `border-transparent ${categoryAccentClass(active)}`,
              ].join(" ")}
              aria-label={fabOpen ? "Close category menu" : "Open category menu"}
              type="button"
            >
              {fabOpen ? (
                <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <CategoryIcon c={active} className="h-7 w-7 sm:h-6 sm:w-6" colorClass="bg-white" />
              )}
            </button>

            {/* 장바구니 버튼(중간): 3색 링 + cartCount 있을 때만 pulse */}
            <button
              ref={cartBtnRef}
              onClick={() => setCartOpen((v) => !v)}
              className={[
                "mt-2 relative flex items-center justify-center rounded-full border border-neutral-200 shadow-xl",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                "h-[56px] w-[56px] sm:h-[56px] sm:w-[56px]",
                cartOpen ? "bg-white text-neutral-900" : "bg-white text-neutral-900 hover:bg-neutral-50",
              ].join(" ")}
              aria-label={cartOpen ? "Close cart" : "Open cart"}
              type="button"
            >
              {/* ✅ ring layer (always) */}
              <span
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute inset-[-3px] -z-10 rounded-full",
                  cartRing,
                  cartCount > 0 && !cartOpen ? "animate-pulse" : "",
                ].join(" ")}
              />

              {cartOpen ? (
                <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <>
                  <CartIcon className="h-6 w-6 sm:h-6 sm:w-6" />
                  {cartCount > 0 && (
                    <span className="pointer-events-none absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-extrabold text-white">
                      {cartCount}
                    </span>
                  )}
                </>
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
                "h-[56px] w-[56px] sm:h-[56px] sm:w-[56px]",
                showTop ? "opacity-100" : "pointer-events-none opacity-40",
              ].join(" ")}
              aria-label="Scroll to top"
              type="button"
              disabled={!showTop}
            >
              <ArrowUpIcon className="h-6 w-6 sm:h-6 sm:w-6" />
            </button>
          </div>
        </>
      )}

      {/* ✅ full cart page (modal) */}
      {cartPageOpen && (
        <div
          className="fixed inset-0 z-[998] bg-black/70"
          role="dialog"
          aria-modal="true"
          onClick={() => setCartPageOpen(false)}
        >
          <div className="mx-auto flex h-full max-w-3xl flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-4">
              <div className="min-w-0">
                <p className="text-base font-extrabold text-neutral-900">Cart</p>
                <p className="text-xs font-semibold text-neutral-500">
                  {cartCount === 0 ? "Empty" : `${cartCount} items`}
                </p>
              </div>

              <div className="flex flex-none items-center gap-2">
                <button
                  onClick={clearCart}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-extrabold",
                    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                    cartCount === 0 ? "opacity-50 pointer-events-none" : "",
                  ].join(" ")}
                  type="button"
                  aria-label="Clear cart"
                  disabled={cartCount === 0}
                >
                  Clear
                </button>

                <button
                  onClick={() => setCartPageOpen(false)}
                  className={[
                    "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                  ].join(" ")}
                  type="button"
                  aria-label="Close cart page"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3" style={{ WebkitOverflowScrolling: "touch" }}>
              {cartItems.length === 0 ? (
                <p className="py-16 text-center text-sm font-semibold text-neutral-500">Cart is empty.</p>
              ) : (
                <div className="grid gap-4">
                  {cartItems.map(({ id, qty, item }) => {
                    if (!item) return null;
                    return (
                      <div key={id} className="flex min-w-0 items-center gap-2 rounded-2xl border border-neutral-200 p-3">
                        <div className="h-14 w-14 flex-none overflow-hidden rounded-xl border border-neutral-200 bg-white">
                          <img
                            src={resolveSrc(item.image.src)}
                            alt={item.image.alt}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        <div className="min-w-0 flex-1 pr-1">
                          <p className="truncate text-sm font-extrabold text-neutral-900">{item.nameKo ?? item.name}</p>
                          {item.nameKo && (
                            <p className="truncate text-xs font-semibold text-neutral-500">{item.name}</p>
                          )}
                          <p className="mt-1 text-xs font-semibold text-neutral-500">
                            {priceLabel(item.price)}
                            {item.price.kind === "market" ? " (Ask staff)" : ""}
                          </p>
                        </div>

                        <div className="flex flex-none items-center gap-1.5">
                          <button
                            onClick={() => decCart(id)}
                            className={[
                              "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                              "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                              "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                            ].join(" ")}
                            type="button"
                            aria-label="Decrease quantity"
                          >
                            <ChevronDownIcon className="h-5 w-5" />
                          </button>

                          <span className="w-7 text-center text-sm font-extrabold text-neutral-900">{qty}</span>

                          <button
                            onClick={() => incCart(id)}
                            className={[
                              "flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                              "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                              "focus:outline-none focus-visible:ring-4 focus-visible:ring-neutral-900/15",
                            ].join(" ")}
                            type="button"
                            aria-label="Increase quantity"
                          >
                            <ChevronUpIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-neutral-900">Total</span>
                <span className="text-sm font-extrabold text-neutral-900">RM {cartTotals.totalRm.toFixed(2)}</span>
              </div>
              {cartTotals.hasMarket && (
                <div className="mt-1 text-xs font-semibold text-neutral-500">
                  Market price items are not included in the total.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Lightbox open={!!lightboxItem} item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </div>
  );
}
