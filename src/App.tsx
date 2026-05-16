import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HpCalculator } from "@/components/features/hp-calculator/HpCalculator";
import { StatGenerator } from "@/components/features/stat-generator/StatGenerator";
import { DiceRoller } from "@/components/features/dice-roller/DiceRoller";
import { SettingsOverlay } from "@/components/features/SettingsOverlay";

import { LandingPage } from "@/components/layout/LandingPage";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

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

      <main className="max-w-6xl mx-auto w-full flex-1 flex flex-col pt-4 px-4 pb-2 md:pt-8 md:px-8 md:pb-2">
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

