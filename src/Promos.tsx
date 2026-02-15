// src/Promos.tsx
import { useEffect, useMemo, useState } from "react";

type Lang = "en" | "kr";

type Step = { t: string; d: string };

type PromoContent = {
  badge: string;
  heroTitle: string;
  heroSub: string;
  heroRuleLine: string;
  ctaMain: string;
  ctaSub: string;
  howTitle: string;
  steps: Step[];
  mysteryTitle: string;
  mysterySub: string;
  pills: string[];
  note: string;
  rulesTitle: string;
  rules: string[];
  footerLine: string;
  stickyTitle: string;
  stickySub: string;
  toggleLabel: string;
};

const LS_KEY = "ganada:promo_lang";

/** GitHub Pages(예: /promos/)에서도 public 파일이 깨지지 않게 base를 자동 반영 */
const publicUrl = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\/+/, "")}`;

/** querystring에서 lang 읽기 */
function getLangFromUrl(): Lang | null {
  try {
    const p = new URLSearchParams(window.location.search);
    const v = (p.get("lang") || "").toLowerCase();
    if (v === "kr" || v === "ko") return "kr";
    if (v === "en") return "en";
    return null;
  } catch {
    return null;
  }
}

/** URL에 lang 반영 (공유/북마크용) */
function setLangToUrl(lang: Lang) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // ignore
  }
}

export default function Promos() {
  // ✅ 기본 EN. URL > localStorage > default 순으로 적용
  const [lang, setLang] = useState<Lang>(() => {
    const fromUrl = getLangFromUrl();
    if (fromUrl) return fromUrl;

    try {
      const saved = (localStorage.getItem(LS_KEY) || "") as Lang;
      if (saved === "en" || saved === "kr") return saved;
    } catch {
      // ignore
    }
    return "en";
  });

  // 전환 애니메이션용
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    // localStorage 저장
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch {
      // ignore
    }
    // URL 반영
    setLangToUrl(lang);
    // fade 트리거
    setFadeKey((k) => k + 1);
  }, [lang]);

  // ✅ Place ID 기반 리뷰 링크 (추천)
  const PLACE_ID = "PLACE_ID_HERE"; // TODO: 실제 Place ID로 교체
  const reviewUrl = useMemo(() => {
    if (PLACE_ID && PLACE_ID !== "PLACE_ID_HERE") {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
        PLACE_ID
      )}`;
    }
    // fallback
    return "https://www.google.com/maps/search/?api=1&query=GANADA%20Korean%20BBQ%20Malaysia";
  }, []);

  const content: Record<Lang, PromoContent> = {
    en: {
      badge: "Always On • Visit-day only",
      heroTitle: "Ganada Review Event",
      heroSub: "Review us and get a free spin!",
      heroRuleLine: "*1 chance per table",
      ctaMain: "Review us",
      ctaSub: "Write Google Review",
      howTitle: "How to enter",
      steps: [
        { t: "Search us on Google", d: "Search GANADA on Google Maps" },
        { t: "Leave a rating & short review", d: "Including a photo would be great." },
        { t: "Show our staff", d: "Get a free spin!" },
      ],
      mysteryTitle: "Mystery Rewards 🎁",
      mysterySub: "Spin and discover your surprise.",
      pills: ["Drink", "Side Dish","?"],
      note: "*Rewards may vary depending on store conditions.",
      rulesTitle: "Event Rules",
      rules: [
        "Max 1 spin per table.",
        "Show your review screen to staff.",
      ],
      footerLine: "Google login may be required.",
      stickyTitle: "Review → 1 Capsule Spin",
      stickySub: "Today only · 1 per table",
      toggleLabel: "Language",
    },
    kr: {
      badge: "상시 진행 • 방문 당일만",
      heroTitle: "가나다 리뷰 이벤트",
      heroSub: "리뷰를 남기고 캡슐 머신에 도전하세요.",
      heroRuleLine: "테이블당 최대 1회",
      ctaMain: "리뷰 작성하기",
      ctaSub: "리뷰 작성하기",
      howTitle: "참여 방법",
      steps: [
        { t: "Google에서 매장 검색", d: "Google Maps에서 GANADA를 검색" },
        { t: "별점 + 간단 후기 작성", d: "사진을 첨부해 주시면 감사합니다." },
        { t: "리뷰 화면을 직원에게 보여주기", d: "매장 내 확인 후 → 캡슐 1회!" },
      ],
      mysteryTitle: "랜덤 리워드 🎁",
      mysterySub: "돌려보기 전에는 아무도 몰라요.\n오늘의 운을 확인하세요.",
      pills: ["음료수", "사이드", "?"],
      note: "*구성은 운영 상황에 따라 변동될 수 있습니다.",
      rulesTitle: "이벤트 규칙",
      rules: [
        "방문 당일만 유효합니다.",
        "테이블당 1회 참여 가능합니다.",
        "직원에게 리뷰 화면을 보여주세요.",
      ],
      footerLine: "Google 로그인 필요할 수 있습니다.",
      stickyTitle: "리뷰 → 캡슐 1회",
      stickySub: "당일 유효 · 테이블당 1회",
      toggleLabel: "언어",
    },
  };

  const t = content[lang];

  return (
    <div className="relative min-h-screen bg-white text-neutral-900">
      {/* ===== Top Poster (Mobile / Desktop) ===== */}
      <div className="w-full">
        {/* Desktop Poster */}
        <div className="hidden md:block">
          <img
            src={publicUrl("promos/poster/mobile.webp")}
            alt="Promos Poster"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        {/* Mobile Poster */}
        <div className="block md:hidden">
          <img
            src={publicUrl("promos/poster/mobile.webp")}
            alt="Promos Poster"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* ===== Language Toggle row (UNDER poster) ===== */}
      <div className="mx-auto max-w-3xl px-4 pt-3">
        <div className="flex items-center justify-end gap-2">
          <span className="hidden sm:block text-xs font-semibold text-neutral-500">
            {t.toggleLabel}
          </span>
          <div className="flex overflow-hidden rounded-full border border-neutral-200 bg-white shadow-sm">
            <button
              onClick={() => setLang("en")}
              className={[
                "px-3 py-1 text-xs font-extrabold",
                lang === "en" ? "bg-neutral-900 text-white" : "bg-white text-neutral-700",
              ].join(" ")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              onClick={() => setLang("kr")}
              className={[
                "px-3 py-1 text-xs font-extrabold",
                lang === "kr" ? "bg-neutral-900 text-white" : "bg-white text-neutral-700",
              ].join(" ")}
              aria-pressed={lang === "kr"}
            >
              KR
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        {/* HERO */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          {/* Brand line (always on top) */}
          <div className="absolute left-0 top-0 z-20 h-1 w-full bg-gradient-to-r from-blue-500 via-red-500 to-yellow-400" />

          {/* Decorative (always behind text; do not cover) */}
          <div className="pointer-events-none absolute -right-10 -top-10 z-0 h-44 w-44 rounded-full bg-gradient-to-br from-yellow-200 via-red-100 to-blue-100 blur-2xl opacity-70" />

          {/* Text/CTA layer */}
          <div key={fadeKey} className="relative z-10 animate-[fadeIn_160ms_ease-out]">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
              {t.badge}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight">
              {t.heroTitle}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{t.heroSub}</p>

            <p className="mt-3 text-sm font-extrabold text-neutral-900">
              <span className="rounded-lg bg-yellow-100 px-2 py-1">{t.heroRuleLine}</span>
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <a
                href={reviewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-extrabold text-white"
              >
                {t.ctaMain}
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-extrabold text-neutral-900"
              >
                {t.howTitle}
              </a>
            </div>

            <p className="mt-3 text-xs text-neutral-500">{t.footerLine}</p>
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="mt-8">
          <h2 className="text-lg font-extrabold tracking-tight">{t.howTitle}</h2>
          <div className="mt-4 grid gap-3">
            {t.steps.map((s, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-extrabold text-white">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-neutral-900">{s.t}</div>
                    <div className="mt-1 text-sm leading-relaxed text-neutral-600">{s.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MYSTERY */}
        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">{t.mysteryTitle}</h2>
          <p className="mt-1 text-sm text-neutral-600 whitespace-pre-line">{t.mysterySub}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {t.pills.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-center text-xs font-extrabold text-neutral-800"
              >
                {p}
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-neutral-500">{t.note}</p>
        </section>

        {/* RULES */}
        <section className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-lg font-extrabold">{t.rulesTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            {t.rules.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-extrabold text-neutral-900">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold text-neutral-900">
              {t.stickyTitle}
            </div>
            <div className="truncate text-xs text-neutral-600">{t.stickySub}</div>
          </div>

          <a
            href={reviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-red-500 to-yellow-400 px-4 py-3 text-sm font-extrabold text-neutral-100"
          >
            {t.ctaSub}
          </a>
        </div>
      </div>

      {/* Minimal keyframes fallback (works even if Tailwind config doesn't define it) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
