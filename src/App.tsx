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
function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6l-12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
    isActive ? "bg-neutral-900 text-white" : "text-neutral-900 hover:bg-neutral-50",
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
        ? "pb-10 sm:pt-5"
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
          <div className="h-1.5 w-full bg-amber-400" />

          {/* Header body: larger */}
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:py-5">
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
            <nav className="hidden items-center gap-10 md:flex">
              <NavLink className={desktopNavItem} to="/">
                Home
              </NavLink>
              <NavLink className={desktopNavItem} to="/menu">
                Menu
              </NavLink>
              <NavLink className={desktopNavItem} to="/promos">
                Promos
              </NavLink>
              <NavLink className={desktopNavItem} to="/contact">
                Contact
              </NavLink>
            </nav>

            {/* Right: utilities */}
            <div className="flex items-center gap-2">
              {/* Desktop */}
              <div className="hidden items-center gap-2 md:flex">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-5 text-base font-extrabold text-white hover:opacity-90"
                  href="https://wa.me/60123456789"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white md:hidden"
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                {mobileNavOpen ? (
                  <CloseIcon className="h-6 w-6 text-neutral-900" />
                ) : (
                  <MenuIcon className="h-6 w-6 text-neutral-900" />
                )}
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
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-neutral-900 text-base font-extrabold text-white hover:opacity-90"
                  href="https://wa.me/60123456789"
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
