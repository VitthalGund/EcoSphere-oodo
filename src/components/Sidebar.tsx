import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { supabase } from "../lib/supabase";
import {
  BarChart3,
  Leaf,
  Users2,
  ShieldCheck,
  Trophy,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
}

interface NavSection {
  name: string;
  icon: React.ReactNode;
  emoji: string;
  basePath: string;
  countKey?: string;
  subItems: NavItem[];
  colorClass: string;
}

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    Environmental: true,
    Social: false,
    Governance: false,
    Gamification: true,
    Reports: false,
    Settings: false,
  });

  // Real active item counts
  const [counts, setCounts] = useState<Record<string, number>>({
    environmental: 8,
    social: 0,
    governance: 0,
    gamification: 3,
  });

  useEffect(() => {
    if (!profile) return;

    const fetchCounts = async () => {
      try {
        // Query carbon transactions count
        const { count: envCount } = await supabase
          .from("carbon_transactions")
          .select("*", { count: "exact", head: true });

        // Query pending CSR activity participation count
        const { count: socCount } = await supabase
          .from("employee_participations")
          .select("*", { count: "exact", head: true })
          .eq("approval_status", "pending");

        // Query open compliance issues count
        const { count: govCount } = await supabase
          .from("compliance_issues")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        // Query active challenges count
        const { count: gamCount } = await supabase
          .from("challenges")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        setCounts({
          environmental: envCount || 0,
          social: socCount || 0,
          governance: govCount || 0,
          gamification: gamCount || 0,
        });
      } catch (err) {
        console.warn(
          "Could not load sidebar counts, using seeded fallbacks.",
          err,
        );
      }
    };

    fetchCounts();

    // Refresh counts every 10 seconds in case of background updates
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, [profile]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const navSections: NavSection[] = [
    {
      name: "Environmental",
      icon: <Leaf className="h-5 w-5" />,
      emoji: "🌱",
      basePath: "/environmental",
      countKey: "environmental",
      colorClass: "text-primary border-primary hover:bg-primary/5",
      subItems: [
        { name: "Dashboard", path: "/environmental/dashboard" },
        { name: "Emission Factors", path: "/environmental/factors" },
        { name: "Carbon Transactions", path: "/environmental/transactions" },
        { name: "Environmental Goals", path: "/environmental/goals" },
      ],
    },
    {
      name: "Social",
      icon: <Users2 className="h-5 w-5" />,
      emoji: "👥",
      basePath: "/social",
      countKey: "social",
      colorClass: "text-[#1971c2] border-[#1971c2] hover:bg-[#1971c2]/5", // Using blue for social
      subItems: [
        { name: "CSR Activities", path: "/social/activities" },
        { name: "CSR Participation", path: "/social/participation" },
      ],
    },
    {
      name: "Governance",
      icon: <ShieldCheck className="h-5 w-5" />,
      emoji: "🏛",
      basePath: "/governance",
      countKey: "governance",
      colorClass: "text-[#6741d9] border-[#6741d9] hover:bg-[#6741d9]/5", // Purple
      subItems: [
        { name: "Policies", path: "/governance/policies" },
        {
          name: "Policy Acknowledgements",
          path: "/governance/acknowledgements",
        },
      ],
    },
    {
      name: "Gamification",
      icon: <Trophy className="h-5 w-5" />,
      emoji: "🏆",
      basePath: "/gamification",
      countKey: "gamification",
      colorClass: "text-[#f08c00] border-[#f08c00] hover:bg-[#f08c00]/5", // Orange
      subItems: [
        { name: "Challenges", path: "/gamification/challenges" },
        { name: "Participation", path: "/gamification/participation" },
        { name: "Badges", path: "/gamification/badges" },
        { name: "Rewards Store", path: "/gamification/rewards" },
        { name: "Leaderboards", path: "/gamification/leaderboards" },
      ],
    },
    {
      name: "Reports",
      icon: <FileText className="h-5 w-5" />,
      emoji: "📈",
      basePath: "/reports",
      colorClass: "text-text-primary border-text-primary hover:bg-surface",
      subItems: [
        { name: "ESG Summary", path: "/reports/summary" },
        { name: "Report Builder", path: "/reports/builder" },
      ],
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      emoji: "⚙",
      basePath: "/settings",
      colorClass: "text-text-secondary border-text-secondary hover:bg-surface",
      subItems: [
        { name: "Departments", path: "/settings/departments" },
        { name: "Categories", path: "/settings/categories" },
        { name: "ESG Weights Config", path: "/settings/config" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-base border-r border-border h-screen flex flex-col justify-between select-none fixed left-0 top-0 z-20">
      {/* Sidebar Top: Logo */}
      <div className="p-6 border-b border-border">
        <NavLink to="/" className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md transform rotate-6 hover:rotate-12 transition-transform">
            <span className="text-white text-lg">🌱</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            EcoSphere
          </span>
        </NavLink>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {/* Main Dashboard Link */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            }`
          }
        >
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5" />
            <span>📊 Dashboard</span>
          </div>
        </NavLink>

        <div className="pt-4 pb-2 text-[10px] font-bold text-text-secondary/50 uppercase tracking-widest px-3">
          ESG Pillars & Management
        </div>

        {/* Dynamic Sections */}
        {navSections.map((section) => {
          const isExpanded = expandedSections[section.name];
          const isCurrentPath = location.pathname.startsWith(section.basePath);
          const activeCount = section.countKey ? counts[section.countKey] : 0;

          return (
            <div key={section.name} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                  isCurrentPath
                    ? "text-text-primary font-bold bg-surface/80 border-l-2"
                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                } ${isCurrentPath ? section.colorClass.split(" ")[1] : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{section.emoji}</span>
                  <span>{section.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {activeCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-surface border border-border text-text-primary shadow-xs">
                      {activeCount}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-text-secondary/60" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-secondary/60" />
                  )}
                </div>
              </button>

              {/* Sub items */}
              {isExpanded && (
                <div className="pl-9 pr-2 py-1 space-y-1 border-l border-border ml-5">
                  {section.subItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          isActive
                            ? "text-primary bg-primary/5 font-semibold"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: User profile & Logout */}
      <div className="p-4 border-t border-border bg-surface/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shadow-inner">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="truncate w-32">
              <p className="text-xs font-bold text-text-primary truncate">
                {profile?.name || "Loading..."}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/10 mt-0.5 uppercase tracking-wide">
                {profile?.role?.replace("_", " ") || "employee"}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 rounded-lg border border-border bg-base text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-all active:scale-95"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
