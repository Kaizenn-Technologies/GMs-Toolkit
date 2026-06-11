import { useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SettingsOverlay } from "@/components/features/SettingsOverlay";
import { useSettings } from "@/contexts/SettingsContext";

const HpCalculator = lazy(() =>
  import("@/components/features/hp-calculator/HpCalculator").then((m) => ({ default: m.HpCalculator }))
);
const StatGenerator = lazy(() =>
  import("@/components/features/stat-generator/StatGenerator").then((m) => ({ default: m.StatGenerator }))
);
const DiceRoller = lazy(() =>
  import("@/components/features/dice-roller/DiceRoller").then((m) => ({ default: m.DiceRoller }))
);
const LandingPage = lazy(() =>
  import("@/components/layout/LandingPage").then((m) => ({ default: m.LandingPage }))
);

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const maximizeSpace = settings.sitewide.maximizeSpace;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const getActiveTab = (): "hp" | "point-buy" | "dice-roller" | "landing" => {
    if (location.pathname === "/") return "landing";
    if (location.pathname.startsWith("/stat-generator")) return "point-buy";
    if (location.pathname.startsWith("/dm-dice-roller")) return "dice-roller";
    if (location.pathname.startsWith("/hp-calculator")) return "hp";
    return "hp";
  };

  const activeTab = getActiveTab();

  const setActiveTab = (tab: "hp" | "point-buy" | "dice-roller" | "landing") => {
    if (tab === "landing") navigate("/");
    else if (tab === "hp") navigate("/hp-calculator");
    else if (tab === "point-buy") navigate("/stat-generator/pointbuy");
    else if (tab === "dice-roller") navigate("/dm-dice-roller");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={
        maximizeSpace 
          ? "max-w-none w-full flex-1 flex flex-col p-1 sm:p-2" 
          : "max-w-6xl mx-auto w-full flex-1 flex flex-col pt-4 px-4 pb-2 md:pt-8 md:px-8 md:pb-2"
      }>
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground animate-pulse">
              <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Loading session...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/hp-calculator" element={<HpCalculator />} />
            <Route
              path="/stat-generator"
              element={<Navigate to="/stat-generator/pointbuy" replace />}
            />
            <Route path="/stat-generator/pointbuy" element={<StatGenerator />} />
            <Route
              path="/stat-generator/standard-array"
              element={<StatGenerator />}
            />
            <Route path="/stat-generator/rolled" element={<StatGenerator />} />
            <Route path="/dm-dice-roller" element={<DiceRoller />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </main>

      <SettingsOverlay
        enabledTabs={
          activeTab === "hp"
            ? ["hp"]
            : activeTab === "point-buy"
              ? ["pointbuy", "roll", "standard"]
              : activeTab === "dice-roller"
                ? ["dice"]
                : []
        }
      />
    </div>
  );
}

