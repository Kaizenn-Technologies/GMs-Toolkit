import { Calculator, Users, Dices } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSettings } from "@/contexts/SettingsContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const isDarkMode = settings.sitewide.darkMode;

  const features = [
    {
      title: "HP Calculator",
      description: "Sleek party management. Track HP, temp HP, and status for your entire table in one view.",
      icon: <Calculator className="w-12 h-12 text-blue-400" />,
      path: "/hp-calculator",
      gradient: "from-blue-600/20 via-blue-900/10 to-transparent",
      accent: "bg-blue-500",
      shadow: "hover:shadow-blue-500/20",
    },
    {
      title: "Stat Generator",
      description: "Character creation redefined. Point Buy, Standard Array, and custom rolling with real-time feedback.",
      icon: <Users className="w-12 h-12 text-emerald-400" />,
      path: "/stat-generator/pointbuy",
      gradient: "from-emerald-600/20 via-emerald-900/10 to-transparent",
      accent: "bg-emerald-500",
      shadow: "hover:shadow-emerald-500/20",
    },
    {
      title: "DM Dice Roller",
      description: "High-density rolling. Advantage, custom groups, and native Daggerheart support for fast-paced play.",
      icon: <Dices className="w-12 h-12 text-purple-400" />,
      path: "/dm-dice-roller",
      gradient: "from-purple-600/20 via-purple-900/10 to-transparent",
      accent: "bg-purple-500",
      shadow: "hover:shadow-purple-500/20",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] -z-10 animate-pulse delay-700" />

      {/* Hero Header */}
      <div className="text-center mb-20 space-y-6 animate-in fade-in slide-in-from-top-12 duration-1000">
        <div className="relative inline-block group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <img
            src={isDarkMode ? "/gm-toolkit-logo-white.svg" : "/gm-toolkit-logo-black.svg"}
            alt="GM's Toolkit Logo"
            className="relative h-24 w-auto sm:h-32 drop-shadow-2xl transition-transform hover:scale-105 duration-500"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
            GM's Toolkit
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground font-medium leading-relaxed">
            Master your session with professional-grade tools.<br />
            Fast. Responsive. Irreplaceable.
          </p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full perspective-1000">
        {features.map((feature, index) => (
          <div
            key={feature.path}
            className={`group animate-in fade-in slide-in-from-bottom-16 duration-700 delay-${(index + 1) * 150}`}
            onClick={() => navigate(feature.path)}
          >
            <div className={`
              relative h-full p-8 rounded-3xl border border-white/10 
              bg-black backdrop-blur-xl 
              transition-all duration-500 ease-out
              hover:border-white/20 hover:-translate-y-4 hover:rotate-1
              cursor-pointer overflow-hidden
              ${feature.shadow} shadow-2xl
            `}>
              {/* Subtle Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${feature.accent} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
                  {feature.icon}
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-400 group-hover:text-neutral-200 leading-relaxed transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                {/* <div className="pt-4 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                  Enter Feature <ArrowRight className="ml-2 w-4 h-4" />
                </div> */}
              </div>

              {/* Decorative Corner Element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div >
  );
}
