import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import { supabase } from "../../lib/supabase";
import { UserProfile, DepartmentScore } from "../../lib/types";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Users, Award, Sparkles, Scale } from "lucide-react";

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"individual" | "department">(
    "individual",
  );
  const [users, setUsers] = useState<
    (UserProfile & { department_name?: string; badge_count?: number })[]
  >([]);
  const [deptScores, setDeptScores] = useState<
    (DepartmentScore & { employee_count?: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "individual") {
        // 1. Fetch users + departments + badge counts
        const { data: usersData, error: uError } = await supabase
          .from("users")
          .select(
            `
            *,
            departments:department_id(name),
            user_badges(id)
          `,
          )
          .order("xp", { ascending: false });

        if (uError) throw uError;

        const mappedUsers = (usersData || []).map((item: any) => ({
          ...item,
          department_name: item.departments?.name || "Unassigned",
          badge_count: item.user_badges?.length || 0,
        }));

        setUsers(mappedUsers);
      } else {
        // 2. Fetch department scores + employee counts
        const { data: scoresData, error: sError } = await supabase
          .from("department_scores")
          .select(
            `
            *,
            departments:department_id(name, employee_count)
          `,
          )
          .eq("period", "2026-07")
          .not("department_id", "is", null) // Filter out org-wide composite score
          .order("total_score", { ascending: false });

        if (sError) throw sError;

        const mappedScores = (scoresData || []).map((item: any) => ({
          ...item,
          department_name: item.departments?.name || "Unknown Dept",
          employee_count: item.departments?.employee_count || 0,
        }));

        setDeptScores(mappedScores);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load leaderboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Chart data formatting
  const topUsersChartData = users
    .slice(0, 5)
    .map((u) => ({ name: u.name, value: u.xp }));

  const deptChartData = deptScores.map((d) => ({
    name: d.department_name,
    value: d.total_score,
  }));

  if (loading) return <LoadingSpinner message="Re-calculating rankings..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-[#f08c00]">
              <Trophy className="h-6 w-6" />
            </span>
            <span>Performance Leaderboards</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Benchmarking employee XP milestones and department ESG composite
            scores.
          </p>
        </div>

        {/* Tabs Switcher */}
        <div className="bg-border p-1 rounded-lg flex space-x-1 shrink-0 select-none">
          <button
            onClick={() => setActiveTab("individual")}
            className={`flex items-center space-x-1.5 py-1.5 px-4 rounded-md text-xs font-bold transition-all active:scale-[0.98] ${
              activeTab === "individual"
                ? "bg-base text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Individual (XP)</span>
          </button>
          <button
            onClick={() => setActiveTab("department")}
            className={`flex items-center space-x-1.5 py-1.5 px-4 rounded-md text-xs font-bold transition-all active:scale-[0.98] ${
              activeTab === "department"
                ? "bg-base text-text-primary shadow-xs"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Departments (ESG)</span>
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table List */}
        <div className="lg:col-span-2">
          {activeTab === "individual" ? (
            /* INDIVIDUAL LIST */
            <Card
              title="Individual Standings"
              subtitle="Ranked by total earned XP points."
            >
              {users.length === 0 ? (
                <div className="text-center py-12 text-xs text-text-secondary/50">
                  No rankings available.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 text-center">Rank</th>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4 text-center">Badges</th>
                        <th className="py-3 px-4 text-center">Level</th>
                        <th className="py-3 px-4 text-right">Total XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u, idx) => {
                        const isTopThree = idx < 3;
                        const rankMedal =
                          idx === 0
                            ? "🥇"
                            : idx === 1
                              ? "🥈"
                              : idx === 2
                                ? "🥉"
                                : null;

                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-surface/30 transition-colors"
                          >
                            <td className="py-4 px-4 text-center font-black">
                              {rankMedal ? (
                                <span
                                  className="text-lg"
                                  title={`Rank ${idx + 1}`}
                                >
                                  {rankMedal}
                                </span>
                              ) : (
                                <span className="text-text-secondary/50">
                                  #{idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] shadow-inner uppercase">
                                  {u.avatar_url ? (
                                    <img
                                      src={u.avatar_url}
                                      alt={u.name}
                                      className="h-full w-full object-cover rounded-full"
                                    />
                                  ) : (
                                    u.name.charAt(0)
                                  )}
                                </div>
                                <span className="font-extrabold text-text-primary">
                                  {u.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-text-secondary font-medium">
                              {u.department_name}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-text-primary">
                              {(u.badge_count || 0) > 0 ? (
                                <span className="inline-flex items-center space-x-0.5 text-warning bg-warning/5 px-2 py-0.5 rounded-full border border-warning/10 font-black">
                                  <Award className="h-3 w-3 fill-warning/10" />
                                  <span>{u.badge_count}</span>
                                </span>
                              ) : (
                                <span className="text-text-secondary/30">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-text-secondary">
                              Lvl {u.level}
                            </td>
                            <td className="py-4 px-4 text-right font-black text-[#f08c00] text-sm flex items-center justify-end space-x-1">
                              <span>{u.xp.toLocaleString()}</span>
                              <Sparkles className="h-3 w-3 fill-[#f08c00]/10" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : (
            /* DEPARTMENT LIST */
            <Card
              title="Department Benchmarks"
              subtitle="Ranked by composite ESG scores."
            >
              {deptScores.length === 0 ? (
                <div className="text-center py-12 text-xs text-text-secondary/50">
                  No department scores generated yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 text-center">Rank</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4 text-center">Employees</th>
                        <th className="py-3 px-4 text-center">E Score</th>
                        <th className="py-3 px-4 text-center">S Score</th>
                        <th className="py-3 px-4 text-center">G Score</th>
                        <th className="py-3 px-4 text-right">
                          Composite Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {deptScores.map((ds, idx) => {
                        const rankMedal =
                          idx === 0
                            ? "🥇"
                            : idx === 1
                              ? "🥈"
                              : idx === 2
                                ? "🥉"
                                : null;

                        return (
                          <tr
                            key={ds.id}
                            className="hover:bg-surface/30 transition-colors"
                          >
                            <td className="py-4 px-4 text-center font-black">
                              {rankMedal ? (
                                <span className="text-lg">{rankMedal}</span>
                              ) : (
                                <span className="text-text-secondary/50">
                                  #{idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-bold text-text-primary">
                              {ds.department_name}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-text-secondary">
                              {ds.employee_count}
                            </td>
                            <td className="py-4 px-4 text-center font-black text-primary">
                              {ds.environmental_score}
                            </td>
                            <td className="py-4 px-4 text-center font-black text-[#1971c2]">
                              {ds.social_score}
                            </td>
                            <td className="py-4 px-4 text-center font-black text-[#6741d9]">
                              {ds.governance_score}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/10">
                                <Scale className="h-3 w-3 mr-1" />
                                <span>{ds.total_score}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Top 5 Chart Visualization */}
        <div className="lg:col-span-1">
          {activeTab === "individual" ? (
            <Card
              title="Top XP Leaders"
              subtitle="XP standings for top 5 contributors."
            >
              {topUsersChartData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-text-secondary/50 text-xs">
                  No chart data available.
                </div>
              ) : (
                <div className="h-56 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topUsersChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#dee2e6"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        stroke="#495057"
                        fontSize={9}
                        tickLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#495057"
                        fontSize={9}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip formatter={(v) => `${(v || 0).toLocaleString()} XP`} />
                      <Bar
                        dataKey="value"
                        fill="#f08c00"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      >
                        {topUsersChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#6741d9" : "#f08c00"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          ) : (
            <Card
              title="ESG Leaderboard"
              subtitle="ESG composite scores compared."
            >
              {deptChartData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-text-secondary/50 text-xs">
                  No chart data available.
                </div>
              ) : (
                <div className="h-56 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#dee2e6"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#495057"
                        fontSize={9}
                        tickLine={false}
                      />
                      <YAxis stroke="#495057" fontSize={9} tickLine={false} />
                      <Tooltip formatter={(v) => `${v || 0} ESG`} />
                      <Bar
                        dataKey="value"
                        fill="#2f9e44"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      >
                        {deptChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#2f9e44" : "#1971c2"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
