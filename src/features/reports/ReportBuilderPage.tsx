import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, Printer, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card } from "../../components/Card";
import { ErrorState } from "../../components/ErrorState";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getCarbonTransactions } from "../../lib/db/carbonTransactions";
import { getDepartments } from "../../lib/db/departments";
import { supabase } from "../../lib/supabase";
import type { Department } from "../../lib/types";

type ReportKind = "carbon" | "engagement" | "compliance";
type ReportRow = Record<string, string | number>;
const labels: Record<ReportKind, string> = { carbon: "Carbon activity", engagement: "Employee engagement", compliance: "Policy compliance" };
const controlClass = "w-full rounded-lg border border-border bg-base px-3 py-2 text-xs font-medium text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export const ReportBuilderPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [kind, setKind] = useState<ReportKind>("carbon");
  const [departmentId, setDepartmentId] = useState("all");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadDepartments = async () => { try { setDepartments(await getDepartments()); } catch (err: any) { setError(err.message || "Could not load departments."); } finally { setLoading(false); } };
  useEffect(() => { loadDepartments(); }, []);

  const generate = async (showSuccess: boolean | React.MouseEvent = true) => {
    setGenerating(true); setError(null);
    try {
      if (kind === "carbon") {
        const transactions = await getCarbonTransactions({ departmentId, startDate, endDate });
        setRows(transactions.map((tx) => ({ Date: tx.date, Department: tx.department_name || "—", Description: tx.description, Source: tx.source_type, "CO2e (kg)": Number(tx.co2e) })));
      } else if (kind === "engagement") {
        let query = supabase.from("challenge_participations").select("approval_status, xp_awarded, users:employee_id(name, departments:department_id(name)), challenges:challenge_id(title, deadline)").order("created_at", { ascending: false });
        if (departmentId !== "all") { const { data: users } = await supabase.from("users").select("id").eq("department_id", departmentId); query = query.in("employee_id", (users || []).map((user) => user.id)); }
        const { data, error: queryError } = await query; if (queryError) throw queryError;
        setRows((data || []).map((item: any) => ({ Challenge: item.challenges?.title || "—", Employee: item.users?.name || "—", Department: item.users?.departments?.name || "—", Status: item.approval_status, "XP awarded": item.xp_awarded || 0, Deadline: item.challenges?.deadline || "—" })));
      } else {
        const { data, error: queryError } = await supabase.from("policy_acknowledgements").select("acknowledged_at, users:employee_id(name, department_id, departments:department_id(name)), esg_policies:policy_id(title, version)").order("acknowledged_at", { ascending: false });
        if (queryError) throw queryError;
        setRows((data || []).filter((item: any) => departmentId === "all" || item.users?.department_id === departmentId).map((item: any) => ({ Policy: item.esg_policies?.title || "—", Version: item.esg_policies?.version || "—", Employee: item.users?.name || "—", Department: item.users?.departments?.name || "—", Acknowledged: item.acknowledged_at ? new Date(item.acknowledged_at).toLocaleDateString() : "—" })));
      }
      setHasGenerated(true);
      if (showSuccess === true) toast.success("Report preview is ready.");
    } catch (err: any) { setError(err.message || "Report generation failed."); } finally { setGenerating(false); }
  };
  useEffect(() => { if (!loading && !error) generate(false); }, [loading]);
  const columns = useMemo(() => rows[0] ? Object.keys(rows[0]) : [], [rows]);
  const exportCsv = () => { if (!rows.length) return; const csv = [columns, ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? "")))].map((row) => row.join(",")).join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); link.download = `ecospher-${kind}-report.csv`; link.click(); URL.revokeObjectURL(link.href); };
  const selectedDepartment = departments.find((department) => department.id === departmentId)?.name || "All departments";
  if (loading) return <LoadingSpinner message="Setting up your report workspace..." />;
  if (error && !rows.length && !generating) return <ErrorState message={error} onRetry={() => { setError(null); setLoading(true); loadDepartments(); }} />;
  return <div className="space-y-6">
    <section><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">One focused answer</p><h2 className="mt-1 text-2xl font-black tracking-tight text-text-primary">Custom report builder</h2><p className="mt-1 text-sm text-text-secondary">Choose a report lens, narrow the scope, then export a clean working report.</p></section>
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]"><Card title="Build your report" subtitle="Start with one data lens for a clear, exportable result." accent="primary"><div className="space-y-5"><Field label="Report type"><select value={kind} onChange={(event) => setKind(event.target.value as ReportKind)} className={controlClass}><option value="carbon">Carbon activity ledger</option><option value="engagement">Employee engagement</option><option value="compliance">Policy compliance</option></select></Field><Field label="Department"><select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className={controlClass}><option value="all">All departments</option>{departments.filter((department) => department.status === "active").map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></Field>{kind === "carbon" && <div className="grid grid-cols-2 gap-3"><Field label="From"><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={controlClass} /></Field><Field label="To"><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={controlClass} /></Field></div>}<button onClick={generate} disabled={generating} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#27873a] disabled:opacity-60"><Filter className="h-3.5 w-3.5" />{generating ? "Generating report..." : "Generate preview"}</button></div></Card><Card title={rows.length ? labels[kind] : "Your report preview"} subtitle={rows.length ? `${selectedDepartment} · ${rows.length} record${rows.length === 1 ? "" : "s"}` : "Configure the report on the left, then generate a preview."} actions={rows.length ? <div className="flex gap-2"><button onClick={() => window.print()} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-base text-text-secondary transition-colors hover:bg-surface hover:text-text-primary" title="Print report"><Printer className="h-4 w-4" /></button><button onClick={exportCsv} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-base text-text-secondary transition-colors hover:bg-surface hover:text-text-primary" title="Export CSV"><Download className="h-4 w-4" /></button></div> : undefined}>{error && <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">{error}</p>}{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b border-border bg-surface/60">{columns.map((column) => <th key={column} className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary">{column}</th>)}</tr></thead><tbody className="divide-y divide-border/70">{rows.map((row, index) => <tr key={index} className="hover:bg-surface/40">{columns.map((column) => <td key={column} className="px-3 py-3 text-text-primary">{String(row[column])}</td>)}</tr>)}</tbody></table></div> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="mb-3 rounded-xl bg-primary/10 p-3 text-primary"><FileText className="h-6 w-6" /></div><p className="text-sm font-bold text-text-primary">A usable report, not a blank canvas</p><p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">Run a focused carbon, engagement, or compliance report. Your data stays filtered to the scope you choose.</p><div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[10px] font-bold text-text-secondary"><Sparkles className="h-3 w-3 text-primary" />Ready when you are</div></div>}</Card></div>
  </div>;
};
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-[11px] font-bold text-text-primary">{label}</span>{children}</label>;
