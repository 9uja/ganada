// src/App.tsx
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Home from "./Home";
import Menu from "./Menu";
import Promos from "./Promos";
import Contact from "./Contact";

/**
 * ✅ Router는 main.tsx에서만 1번 감싼다.
 * - App.tsx에서는 BrowserRouter/RouteTracker를 절대 넣지 않는다.
 */
export default function App() {
  return <AppShell />;
}

/** 실제 UI/라우팅은 AppShell에서 담당 */
function AppShell() {
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
              <DesktopNavLink to="/promos">Promotion</DesktopNavLink>
              <DesktopNavLink to="/contact">Contact</DesktopNavLink>
            </nav>

            {/* Right: utilities */}
            <div className="flex items-center gap-2">
              {/* Desktop */}
              <div className="hidden items-center gap-2 md:flex">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full px-5 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                  href="tel:+60328566183"
                  target="_blank"
                  rel="noreferrer"
                >
                  Call to order
                </a>
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                className={[
                  "group inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                  "bg-white text-neutral-800",
                  "ring-0 ring-neutral-200 shadow-sm",
                  "transition-all duration-200 ease-out",
                  "active:scale-[0.98]",
                  "md:hidden",
                ].join(" ")}
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                <AnimatedMenuIcon
                  open={mobileNavOpen}
                  className="h-10 w-10"
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
                    Promotion
                  </NavLink>
                  <NavLink className={mobileNavItem} to="/contact">
                    Contact
                  </NavLink>
                </nav>

                <a
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl text-base font-extrabold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                  href="tel:+60328566183"
                  target="_blank"
                  rel="noreferrer"
                >
                  Call to order
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
            <Route path="/Promos" element={<Promos />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </ContentWrap>
      </main>

      {!isQr && (
        <footer className="bg-neutral-800 px-4 py-6 text-sm text-neutral-100">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-2">
              {/* 1) Left: logo -> home */}
              <div className="flex flex-col gap-2">
                <Link to="/" aria-label="Go to home" className="block w-fit">
                  <img
                    src={publicUrl("/brand/logo-mark.svg")}
                    alt="GANADA"
                    className="h-12 w-12 bg-white"
                    loading="eager"
                    decoding="async"
                  />
                </Link>
              </div>

              {/* 2) Middle */}
              <div className="border-t border-white/10 pt-5">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Ganada | Tel: +60 3-2856 6183
                </div>
              </div>

              {/* 3) Right */}
              <div className="border-t border-white/10 pt-3">
                <div className="space-y-1">
                  <div>
                    <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
                      GANADA Korean BBQ Restaurant
                    </div>
                    <div className="text-neutral-300">Malaysia</div>
                    <div className="pt-2 text-xs text-neutral-400">
                      COPYRIGHT © {new Date().getFullYear()} ALL RIGHTS RESERVED
                      BY GANADA&apos;s.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

/** GitHub Pages(예: /menu/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) =>
  `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

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

  const BLUE = "#2563EB";
  const RED = "#DC2626";
  const AMBER = "#FBBF24";

  const base = "transition-all duration-200 ease-out origin-center";
  const common = {
    strokeWidth,
    strokeLinecap: "round" as const,
    style: { transformOrigin: "12px 12px" },
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
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
      className="pointer-events-none absolute bottom-[-1px] h-[6px] overflow-hidden"
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
