import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HpCalculator } from "@/components/features/HpCalculator";
import { StatGenerator } from "@/components/features/StatGenerator";

export default function App() {
  const [activeTab, setActiveTab] = useState<"hp" | "point-buy">("hp");
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />

      <main className="max-w-6xl mx-auto w-full flex-1 flex flex-col pt-4 px-4 pb-2 md:pt-8 md:px-8 md:pb-2">
        {activeTab === "hp" ? <HpCalculator /> : <StatGenerator />}
        <Footer />
      </main>
    </div>
  );
}
