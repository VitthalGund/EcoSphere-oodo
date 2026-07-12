import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Building2, Download, Leaf, RefreshCw, ShieldCheck, Users2 } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "react-hot-toast";
import { Card } from "../../components/Card";
import { ErrorState } from "../../components/ErrorState";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { supabase } from "../../lib/supabase";
import { recalculateAllScores } from "../../lib/rules/scoreCalculator";
import type { DepartmentScore, ESGConfig } from "../../lib/types";

const REPORT_PERIOD = "2026-07";
type SummaryData = { score: DepartmentScore | null; config: ESGConfig | null; departments: Array<DepartmentScore & { department_name: string }>; carbonTotal: number; activeChallenges: number; acknowledgementRate: number; };
const gradeFor = (score: number) => score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";

export const ESGSummaryPage: React.FC = () => {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const results = await Promise.all([
        supabase.from("department_scores").select("*").is("department_id", null).eq("period", REPORT_PERIOD).maybeSingle(),
        supabase.from("esg_config").select("*").limit(1).maybeSingle(),
        supabase.from("department_scores").select("*, departments:department_id(name)").eq("period", REPORT_PERIOD).not("department_id", "is", null).order("total_score", { ascending: false }),
        supabase.from("carbon_transactions").select("co2e"),
        supabase.from("challenges").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("esg_policies").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("policy_acknowledgements").select("id", { count: "exact", head: true }),
      ]);
      const firstError = results.find((result) => result.error)?.error;
      if (firstError) throw firstError;
      const [scoreResult, configResult, deptResult, carbonResult, challengeResult, policyResult, userResult, acknowledgementResult] = results;
      const policySlots = (policyResult.count || 0) * (userResult.count || 0);
      setData({ score: scoreResult.data as DepartmentScore | null, config: configResult.data as ESGConfig | null, departments: (deptResult.data || []).map((item: any) => ({ ...item, department_name: item.departments?.name || "Unknown department" })), carbonTotal: (carbonResult.data || []).reduce((total, item) => total + Number(item.co2e || 0), 0), activeChallenges: challengeResult.count || 0, acknowledgementRate: policySlots ? Math.min(100, Math.round(((acknowledgementResult.count || 0) / policySlots) * 100)) : 0 });
    } catch (err: any) { setError(err.message || "Could not load the ESG summary."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);
  const handleRefresh = async () => { setRefreshing(true); try { await recalculateAllScores(REPORT_PERIOD); await loadData(); toast.success("ESG scores refreshed from current activity."); } catch { toast.error("Scores could not be recalculated."); } finally { setRefreshing(false); } };
  const exportSummary = () => {
    if (!data) return;
    const score = data.score;
    const csv = [["EcoSphere ESG summary", `Period ${REPORT_PERIOD}`], ["Overall score", score?.total_score ?? 0], ["Environmental score", score?.environmental_score ?? 0], ["Social score", score?.social_score ?? 0], ["Governance score", score?.governance_score ?? 0], ["Carbon logged (kg CO2e)", data.carbonTotal.toFixed(2)], [], ["Department", "ESG score", "Environmental", "Social", "Governance"], ...data.departments.map((department) => [department.department_name, department.total_score, department.environmental_score, department.social_score, department.governance_score])].map((row) => row.join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); link.download = `ecospher-esg-summary-${REPORT_PERIOD}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  const pillarData = useMemo(() => data?.score ? [{ name: "Environmental", value: data.score.environmental_score, weight: data.config?.environmental_weight ?? 40, color: "#2f9e44" }, { name: "Social", value: data.score.social_score, weight: data.config?.social_weight ?? 30, color: "#1971c2" }, { name: "Governance", value: data.score.governance_score, weight: data.config?.governance_weight ?? 30, color: "#6741d9" }] : [], [data]);
  if (loading) return <LoadingSpinner message="Preparing your ESG summary..." />;
  if (error) return <ErrorState message={error} onRetry={() => { setLoading(true); loadData(); }} />;
  const score = data?.score?.total_score ?? 0;
  return <div className="space-y-6">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Board-ready view</p><h2 className="mt-1 text-2xl font-black tracking-tight text-text-primary">ESG score summary</h2><p className="mt-1 text-sm text-text-secondary">A live readout of the organization’s ESG performance for July 2026.</p></div><div className="flex flex-wrap gap-2"><button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3.5 py-2 text-xs font-bold text-text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh scores</button><button onClick={exportSummary} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#27873a]"><Download className="h-3.5 w-3.5" />Export CSV</button></div></section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<BarChart3 className="h-4 w-4" />} label="Organization score" value={`${score}/100`} detail={`Grade ${gradeFor(score)}`} color="text-primary" /><Metric icon={<Leaf className="h-4 w-4" />} label="Carbon logged" value={`${(data?.carbonTotal ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`} detail="All recorded transactions" color="text-primary" /><Metric icon={<Users2 className="h-4 w-4" />} label="Active challenges" value={`${data?.activeChallenges ?? 0}`} detail="Driving employee action" color="text-[#f08c00]" /><Metric icon={<ShieldCheck className="h-4 w-4" />} label="Policy coverage" value={`${data?.acknowledgementRate ?? 0}%`} detail="Published policy acknowledgements" color="text-[#6741d9]" /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><Card title="Weighted score composition" subtitle="Pillar scores are weighted by your ESG configuration." accent="primary"><div className="flex flex-col items-center gap-4 sm:flex-row"><div className="h-52 w-full max-w-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pillarData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">{pillarData.map((pillar) => <Cell key={pillar.name} fill={pillar.color} />)}</Pie><Tooltip formatter={(value, name) => [`${value}/100`, name]} /></PieChart></ResponsiveContainer></div><div className="w-full space-y-3">{pillarData.map((pillar) => <div key={pillar.name} className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2.5"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pillar.color }} /><span className="text-xs font-bold text-text-primary">{pillar.name}</span></div><div className="text-right"><span className="text-sm font-black text-text-primary">{pillar.value}</span><span className="ml-1 text-[10px] text-text-secondary">× {pillar.weight}%</span></div></div>)}</div></div></Card><Card title="Department comparison" subtitle="Ranked by weighted ESG score for the reporting period." actions={<Building2 className="h-4 w-4 text-text-secondary" />}>{data?.departments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs"><thead><tr className="border-b border-border text-[10px] uppercase tracking-wider text-text-secondary"><th className="pb-3 font-bold">Department</th><th className="pb-3 text-center font-bold">Environmental</th><th className="pb-3 text-center font-bold">Social</th><th className="pb-3 text-center font-bold">Governance</th><th className="pb-3 text-right font-bold">Total</th></tr></thead><tbody className="divide-y divide-border/70">{data.departments.map((department, index) => <tr key={department.id} className="hover:bg-surface/50"><td className="py-3 font-bold text-text-primary"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px]">{index + 1}</span>{department.department_name}</td><td className="py-3 text-center text-primary">{department.environmental_score}</td><td className="py-3 text-center text-governance">{department.social_score}</td><td className="py-3 text-center text-secondary">{department.governance_score}</td><td className="py-3 text-right text-sm font-black text-text-primary">{department.total_score}</td></tr>)}</tbody></table></div> : <EmptyCopy text="Department scores will appear after the first refresh." />}</Card></div>
  </div>;
};
const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string; detail: string; color: string }> = ({ icon, label, value, detail, color }) => <div className="rounded-xl border border-border bg-base p-4 shadow-xs"><div className={`mb-3 inline-flex rounded-lg bg-surface p-2 ${color}`}>{icon}</div><p className="text-xs font-semibold text-text-secondary">{label}</p><p className="mt-1 text-xl font-black tracking-tight text-text-primary">{value}</p><p className="mt-1 text-[11px] text-text-secondary">{detail}</p></div>;
const EmptyCopy: React.FC<{ text: string }> = ({ text }) => <div className="py-10 text-center text-xs text-text-secondary">{text}</div>;
