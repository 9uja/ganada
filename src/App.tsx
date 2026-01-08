// src/App.tsx
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Home from "./Home";
import Menu from "./Menu";
import Promos from "./Promos";
import Gallery from "./Gallery";
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
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }

    lastYRef.current = window.scrollY || 0;

    const SHOW_AT_TOP_Y = 24; // 이 위치보다 위면 무조건 보이기
    const HIDE_DELTA = 14;    // 아래로 이 정도 이상 움직이면 숨기기(잔떨림 방지)
    const SHOW_DELTA = 10;    // 위로 이 정도 이상 움직이면 보이기

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const lastY = lastYRef.current;
        const diff = y - lastY;

        // 맨 위 근처면 항상 표시
        if (y <= SHOW_AT_TOP_Y) {
          setHidden(false);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        // 스크롤 down: 숨김
        if (diff > HIDE_DELTA) {
          setHidden(true);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        // 스크롤 up: 표시
        if (diff < -SHOW_DELTA) {
          setHidden(false);
          lastYRef.current = y;
          tickingRef.current = false;
          return;
        }

        // 작은 움직임은 lastY만 살짝 업데이트(추적 누적 방지)
        lastYRef.current = y;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return hidden;
}

const navItem = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm border transition",
    isActive
      ? "border-neutral-200 bg-neutral-50 text-neutral-950"
      : "border-neutral-700 text-neutral-200 hover:bg-neutral-900",
  ].join(" ");

export default function App() {
  const isQr = useIsQrMenuMode();
  const hideHeader = useAutoHideHeader(!isQr);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-50">
      {/* Header: QR 메뉴 모드에선 숨김 */}
      {!isQr && (
        <header
          className={[
            "sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur",
            "transition-transform duration-200 will-change-transform",
            hideHeader ? "-translate-y-full" : "translate-y-0",
          ].join(" ")}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src= {publicUrl("brand/logo-mark.svg")}
                alt="GANADA"
                className="h-8 w-8 rounded-xl"
                loading="eager"
                decoding="async"
              />

              <span className="text-lg font-semibold tracking-tight">
                <span className="whitespace-nowrap ganada-logo-font inline-flex items-baseline leading-none">
                  <span className="text-[1.18em] tracking-[0.01em]">G</span>
                  <span className="tracking-[0.08em]">ANADA</span>
                </span>
              </span>
            </Link>
            <nav className="hidden gap-2 md:flex">
              <NavLink className={navItem} to="/">
                Home
              </NavLink>
              <NavLink className={navItem} to="/menu">
                Menu
              </NavLink>
              <NavLink className={navItem} to="/promos">
                Promos
              </NavLink>
              <NavLink className={navItem} to="/gallery">
                Gallery
              </NavLink>
              <NavLink className={navItem} to="/contact">
                Contact
              </NavLink>
            </nav>

            <a
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
              href="https://wa.me/60123456789"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>

          {/* Mobile tab bar */}
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:hidden">
            <NavLink className={navItem} to="/">
              Home
            </NavLink>
            <NavLink className={navItem} to="/menu">
              Menu
            </NavLink>
            <NavLink className={navItem} to="/promos">
              Promos
            </NavLink>
            <NavLink className={navItem} to="/gallery">
              Gallery
            </NavLink>
            <NavLink className={navItem} to="/contact">
              Contact
            </NavLink>
          </div>
        </header>
      )}

      <main className={isQr ? "px-4 py-5" : "px-4 py-10"}>
        <div className="mx-auto max-w-6xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/promos" element={<Promos />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </main>

      {!isQr && (
        <footer className="border-t border-neutral-800 px-4 py-10 text-sm text-neutral-400">
          <div className="mx-auto max-w-6xl">
            © {new Date().getFullYear()} GANADA Korean BBQ Restaurant • Malaysia
          </div>
        </footer>
      )}
    </div>
  );
}
