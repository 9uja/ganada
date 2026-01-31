// src/analytics/RouteTracker.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_MEASUREMENT_ID = "G-FMP64NSV2Q";

export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const page_path = location.pathname + location.search;

    // gtag가 아직 로드되지 않았거나, 광고차단 등으로 막힌 경우 대비
    if (typeof window.gtag !== "function") return;

    // SPA 라우트 전환마다 page_path를 업데이트해 GA4에 page_view로 기록되게 함
    window.gtag("config", GA_MEASUREMENT_ID, { page_path });
  }, [location]);

  return null;
}
