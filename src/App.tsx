// src/App.tsx
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Home from "./Home";
import Menu from "./Menu";
import Promos from "./Promos";
import Contact from "./Contact";

/** GitHub Pages(예: /menu/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

function useIsQrMenuMode() {
  const { pathname, search } = useLocation();
  if (pathname !== "/menu") return false;
  const p = new URLSearchParams(search);
  return p.get("src") === "qr";
}

function useAutoHideHeader(enabled: boolean) {
  const [hidden, setHidden] = useState(false);

  // Avoid redundant setState on every scroll frame (prevents scroll jank)
  const hiddenRef = useRef(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  const setHiddenSafe = (v: boolean) => {
    if (hiddenRef.current === v) return;
    hiddenRef.current = v;
    setHidden(v);
  };

  useEffect(() => {
    if (!enabled) {
      setHiddenSafe(false);
      return;
    }

    lastYRef.current = window.scrollY || 0;

    const SHOW_AT_TOP_Y = 24;
    const HIDE_DELTA = 14;
    const SHOW_DELTA = 10;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const lastY = lastYRef.current;
        const diff = y - lastY;

        if (y <= SHOW_AT_TOP_Y) {
          setHiddenSafe(false);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        if (diff > HIDE_DELTA) {
          setHiddenSafe(true);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        if (diff < -SHOW_DELTA) {
          setHiddenSafe(false);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        lastYRef.current = y;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return hidden;
}

/**
 * ✅ 중요: App() 내부에서 ContentWrap을 선언하면
 * App이 리렌더링될 때마다 ContentWrap "타입"이 바뀌어
 * 하위 트리가 언마운트/리마운트 됩니다.
 * (Menu state가 스크롤 시 All로 리셋되던 핵심 원인)
 */
function ContentWrap({
  isQr,
  pathname,
  children,
}: {
  isQr: boolean;
  pathname: string;
  children: ReactNode;
}) {
  // HOME: remove wrapper for full-bleed carousel
  if (!isQr && pathname === "/") return <>{children}</>;
  return <div className="mx-auto max-w-6xl">{children}</div>;
}

/** --- icons --- */
/**
 * ✅ 브랜딩 고정 버전
 * - hover 시 배경/텍스트만 반전(버튼 배경은 dark)
 * - 아이콘 3색(파/빨/노)은 hover/open 상태에서도 유지
 * - open 시 햄버거 → X로 모핑(색은 그대로)
 */
function AnimatedMenuIcon({
  className = "",
  open,
  strokeWidth = 2.8,
  gap = 5,
}: {
  className?: string;
  open: boolean;
  strokeWidth?: number;
  gap?: number;
}) {
  const yTop = 12 - gap;
  const yMid = 12;
  const yBot = 12 + gap;

  // Tailwind 의존 제거(항상 보이게): 직접 색 지정
  const BLUE = "#2563EB"; // blue-600
  const RED = "#DC2626"; // red-600
  const AMBER = "#FBBF24"; // amber-400

  const base = "transition-all duration-200 ease-out origin-center";
  const common = {
    strokeWidth,
    strokeLinecap: "round" as const,
    style: { transformOrigin: "12px 12px" },
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      {/* CLOSED LAYER (3 lines) */}
      <g
        className={base}
        style={{
          opacity: open ? 0 : 1,
          transform: open ? "scale(0.98)" : "scale(1)",
        }}
      >
        <path d={`M4 ${yTop}h16`} stroke={BLUE} {...common} />
        <path d={`M4 ${yMid}h16`} stroke={RED} {...common} />
        <path d={`M4 ${yBot}h16`} stroke={AMBER} {...common} />
      </g>

      {/* OPEN LAYER (X: blue + red) */}
      <g
        className={base}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0.98)",
        }}
      >
        <path d="M6 6 L18 18" stroke={BLUE} {...common} />
        <path d="M18 6 L6 18" stroke={RED} {...common} />
      </g>
    </svg>
  );
}

function ActiveTriStrokeBar() {
  return (
    <span
      className="pointer-events-none absolute bottom-[-1px] h-[6px] overflow-hidden rounded-full"
      style={{ left: -12, right: -12 }}
    >
      <span className="flex h-full w-full">
        <span className="h-full w-1/2 bg-blue-600" />
        <span className="h-full w-1/4 bg-red-600" />
        <span className="h-full w-1/4 bg-amber-400" />
      </span>
    </span>
  );
}

function DesktopNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className={desktopNavItem}>
      {({ isActive }) => (
        <span className="relative inline-flex h-full items-center">
          {children}
          {isActive && <ActiveTriStrokeBar />}
        </span>
      )}
    </NavLink>
  );
}

// McD-like: bigger + bolder header nav
const desktopNavItem = ({ isActive }: { isActive: boolean }) =>
  [
    "text-2xl font-extrabold tracking-tight transition",
    isActive ? "text-neutral-950" : "text-neutral-700 hover:text-neutral-950",
  ].join(" ");



const mobileNavItem = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-2xl px-4 py-4 text-base font-extrabold transition",
    isActive
      ? "bg-amber-400 text-neutral-950 ring-1 ring-amber-500 shadow-sm"
      : "text-neutral-900 hover:bg-neutral-50",
  ].join(" ");

export default function App() {
  const isQr = useIsQrMenuMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Mobile nav open: disable auto-hide (prevents header disappearing)
  const hideHeader = useAutoHideHeader(!isQr && !mobileNavOpen);
  const { pathname } = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  // Reduce excessive top padding on /menu (it felt too tall)
  const mainClass = isQr
    ? "px-4 py-5"
    : pathname === "/"
      ? "px-0 py-0"
      : pathname === "/menu"
        ? "pb-0 sm:pt-0"
        : "px-4 py-10";

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      {/* Header hidden in QR menu mode */}
      {!isQr && (
        <header
          className={[
            "sticky top-0 z-50 bg-white/90 backdrop-blur",
            "border-b border-neutral-200",
            "transition-transform duration-200 will-change-transform",
            hideHeader ? "-translate-y-full" : "translate-y-0",
          ].join(" ")}
        >
          {/* thin brand strip */}
          <div className="flex h-1.5 w-full">
            <div className="h-full w-1/2 bg-blue-600" />
            <div className="h-full w-1/4 bg-red-600" />
            <div className="h-full w-1/4 bg-amber-400" />
          </div>

          {/* Header body: larger */}
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:h-[80px]">

            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={publicUrl("brand/logo-mark.svg")}
                alt="GANADA"
                className="h-12 w-12 bg-white"
                loading="eager"
                decoding="async"
              />
            </Link>

            {/* Center: Desktop nav */}
            <nav className="hidden h-full items-stretch gap-10 md:flex">
              <DesktopNavLink to="/">Home</DesktopNavLink>
              <DesktopNavLink to="/menu">Menu</DesktopNavLink>
              <DesktopNavLink to="/promos">Promos</DesktopNavLink>
              <DesktopNavLink to="/contact">Contact</DesktopNavLink>
            </nav>


            {/* Right: utilities */}
            <div className="flex items-center gap-2">
              {/* Desktop */}
              <div className="hidden items-center gap-2 md:flex">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full px-5 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                  href="https://wa.me/600328566183"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                className={[
                  // ✅ hover 시 "배경만" 반전(다크), 아이콘 3색은 그대로 유지
                  "group inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                  "bg-white text-neutral-900",
                  "ring-1 ring-neutral-200 shadow-sm",
                  "transition-all duration-200 ease-out",
                  "hover:bg-neutral-900 hover:text-white hover:shadow-md hover:ring-neutral-900/30",
                  "active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                  "md:hidden",
                ].join(" ")}
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                <AnimatedMenuIcon
                  open={mobileNavOpen}
                  className="h-10 w-10"
                  // 조절 포인트
                  strokeWidth={2.8}
                  gap={5}
                />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div className="border-t border-neutral-200 bg-white px-4 pb-4 md:hidden">
              <div className="mx-auto max-w-6xl py-3">
                <nav className="grid gap-2">
                  <NavLink className={mobileNavItem} to="/">
                    Home
                  </NavLink>
                  <NavLink className={mobileNavItem} to="/menu">
                    Menu
                  </NavLink>
                  <NavLink className={mobileNavItem} to="/promos">
                    Promos
                  </NavLink>
                  <NavLink className={mobileNavItem} to="/contact">
                    Contact
                  </NavLink>
                </nav>

                <a
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl text-base font-extrabold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                  href="https://wa.me/600328566183"
                  target="_blank"
                  rel="noreferrer"
                > 
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </header>
      )}

      <main className={mainClass}>
        <ContentWrap isQr={isQr} pathname={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/promos" element={<Promos />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </ContentWrap>
      </main>

      {!isQr && (
        <footer className="border-t border-neutral-200 bg-white px-4 py-10 text-sm text-neutral-600">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-neutral-800">GANADA Korean BBQ Restaurant</div>
              <div>Malaysia</div>
              <div className="mt-2 text-xs text-neutral-500">
                © {new Date().getFullYear()} GANADA. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
