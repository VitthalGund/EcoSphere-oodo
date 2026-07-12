import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import { supabase } from "../../lib/supabase";
import { Badge, UserBadge, UserProfile } from "../../lib/types";
import { toast } from "react-hot-toast";
import { Award, Plus, X, Search, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const BadgesPage: React.FC = () => {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User stats for calculating locked badge progress
  const [userStats, setUserStats] = useState<Record<string, number>>({
    xp: 0,
    challenges_completed: 0,
    carbon_transactions_logged: 0,
    csr_activities_completed: 0,
  });

  // Modal & Form State for Admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🌱");
  const [ruleMetric, setRuleMetric] = useState<
    | "xp"
    | "challenges_completed"
    | "carbon_transactions_logged"
    | "csr_activities_completed"
  >("xp");
  const [ruleOperator, setRuleOperator] = useState<">=" | ">" | "==" | "<=">(
    ">=",
  );
  const [ruleValue, setRuleValue] = useState<number>(500);

  const isAdmin = profile?.role === "admin";

  const loadData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch all badges
      const { data: bData, error: bErr } = await supabase
        .from("badges")
        .select("*");
      if (bErr) throw bErr;
      setBadges(bData as Badge[]);

      // 2. Fetch user's unlocked badges
      const { data: ubData, error: ubErr } = await supabase
        .from("user_badges")
        .select(
          `
          *,
          badges:badge_id(name, description, icon)
        `,
        )
        .eq("user_id", profile.id);
      if (ubErr) throw ubErr;

      const mappedUserBadges = (ubData || []).map((item: any) => ({
        ...item,
        badge_name: item.badges?.name || "",
        badge_description: item.badges?.description || "",
        badge_icon: item.badges?.icon || "🏆",
      }));
      setUnlockedBadges(mappedUserBadges as UserBadge[]);

      // 3. Fetch user's counts to check progress
      const [xpVal, chCompleted, txLogged, csrCompleted] = await Promise.all([
        supabase.from("users").select("xp").eq("id", profile.id).single(),
        supabase
          .from("challenge_participations")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", profile.id)
          .eq("approval_status", "approved"),
        supabase
          .from("carbon_transactions")
          .select("*", { count: "exact", head: true })
          .eq("created_by", profile.id),
        supabase
          .from("employee_participations")
          .select("*", { count: "exact", head: true })
          .eq("employee_id", profile.id)
          .eq("approval_status", "approved"),
      ]);

      setUserStats({
        xp: xpVal.data?.xp || 0,
        challenges_completed: chCompleted.count || 0,
        carbon_transactions_logged: txLogged.count || 0,
        csr_activities_completed: csrCompleted.count || 0,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load badges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !icon || ruleValue < 0) {
      toast.error("Please enter all required fields.");
      return;
    }

    const newBadge = {
      name,
      description,
      icon,
      unlock_rule: {
        type: "threshold",
        metric: ruleMetric,
        operator: ruleOperator,
        value: Number(ruleValue),
      },
    };

    try {
      const { error: bErr } = await supabase.from("badges").insert([newBadge]);

      if (bErr) throw bErr;

      toast.success("Badge and data-driven rule created successfully!");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create badge.");
    }
  };

  // Helper to check if user has unlocked a badge
  const getUnlockDetails = (badgeId: string) => {
    return unlockedBadges.find((ub) => ub.badge_id === badgeId);
  };

  // Helper to get metric formatted label
  const getMetricLabel = (m: string) => {
    switch (m) {
      case "xp":
        return "XP Points";
      case "challenges_completed":
        return "Challenges Completed";
      case "carbon_transactions_logged":
        return "Carbon Transactions Logged";
      case "csr_activities_completed":
        return "CSR Activities Completed";
      default:
        return m;
    }
  };

  if (loading) return <LoadingSpinner message="Loading badges catalog..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-[#f08c00]">
              <Award className="h-6 w-6" />
            </span>
            <span>Gamified Badges</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Unlock corporate achievements and track your rule thresholds.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-[#f08c00] hover:bg-[#d97c00] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm active:scale-95 transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Badge Rule</span>
          </button>
        )}
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const unlock = getUnlockDetails(badge.id);
          const isUnlocked = !!unlock;

          // Rule Evaluation details
          const rule = badge.unlock_rule;
          const userVal = userStats[rule.metric] || 0;
          const threshold = rule.value;
          const percent = isUnlocked
            ? 100
            : Math.max(
                0,
                Math.min(100, Math.round((userVal / threshold) * 100)),
              );

          return (
            <div key={badge.id} className="relative">
              <Card
                accent={isUnlocked ? "gamification" : undefined}
                className={`h-full select-none ${!isUnlocked ? "opacity-70 bg-surface/50 border-dashed" : ""}`}
              >
                <div className="flex items-start space-x-4 text-left">
                  {/* Badge Icon (scaled/grayed out if locked) */}
                  <div
                    className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-md border ${
                      isUnlocked
                        ? "bg-gradient-to-tr from-[#f08c00]/20 to-[#6741d9]/20 border-warning/20 animate-pulse"
                        : "bg-border text-text-secondary/40 border-border filter grayscale"
                    }`}
                  >
                    {badge.icon || "🏆"}
                  </div>

                  {/* Title & Desc */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-text-primary">
                        {badge.name}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {badge.description}
                    </p>

                    {/* Unlock criteria rule label */}
                    <div className="pt-2 text-[10px] text-text-secondary/50 font-bold flex items-center space-x-1">
                      <span>Goal:</span>
                      <span className="text-text-secondary">
                        {getMetricLabel(rule.metric)} {rule.operator}{" "}
                        {rule.value}
                      </span>
                    </div>

                    {/* Progress slider (only shown if locked) */}
                    {!isUnlocked && (
                      <div className="pt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-text-secondary font-bold">
                          <span>Progress</span>
                          <span>
                            {userVal} / {threshold} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="bg-[#f08c00] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Unlocked date */}
                    {isUnlocked && unlock && (
                      <p className="text-[10px] text-text-secondary/40 font-semibold pt-4">
                        Unlocked on{" "}
                        {new Date(unlock.awarded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Create Badge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                Add Achievement Badge
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateBadge}
              className="p-5 space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Badge Name*
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eco Warrior"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#f08c00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Description*
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Unlocked when employee completes 10 carbon logs."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#f08c00] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Emoji Icon*
                  </label>
                  <input
                    type="text"
                    required
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🏆"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Rule Metric
                  </label>
                  <select
                    value={ruleMetric}
                    onChange={(e) => setRuleMetric(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  >
                    <option value="xp">Total XP</option>
                    <option value="challenges_completed">
                      Challenges Completed
                    </option>
                    <option value="carbon_transactions_logged">
                      Carbon Transactions Logged
                    </option>
                    <option value="csr_activities_completed">
                      CSR Activities Completed
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Comparison
                  </label>
                  <select
                    value={ruleOperator}
                    onChange={(e) => setRuleOperator(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  >
                    <option value=">=">&gt;= (Greater or Equal)</option>
                    <option value=">">&gt; (Greater Than)</option>
                    <option value="==">== (Equal To)</option>
                    <option value="<=">&lt;= (Less or Equal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Value Goal*
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ruleValue}
                    onChange={(e) => setRuleValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-warning/5 border border-warning/10 rounded-lg flex items-start space-x-2 text-[10px] text-warning leading-relaxed font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Note:</strong> Rule evaluates dynamically in the
                  background when users finish challenges. Badges will unlock
                  automatically.
                </span>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-text-secondary bg-base hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f08c00] hover:bg-[#d97c00] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-warning/10 transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
