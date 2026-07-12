import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import { supabase } from "../../lib/supabase";
import { ChallengeParticipation } from "../../lib/types";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Upload,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from "lucide-react";

interface ParticipationRecord extends ChallengeParticipation {
  challenge_title: string;
  challenge_xp: number;
  challenge_difficulty: string;
  employee_name: string;
  employee_email: string;
  department_name: string | null;
}

export const ParticipationPage: React.FC = () => {
  const { profile } = useAuth();
  const [participations, setParticipations] = useState<ParticipationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Expanded proof row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Inline proof submission state (for current user's own entries)
  const [proofText, setProofText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const isAdmin = profile?.role === "admin";
  const isDeptHead = profile?.role === "department_head";
  const canApprove = isAdmin || isDeptHead;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("challenge_participations")
        .select(`
          *,
          challenges:challenge_id ( title, xp, difficulty ),
          employee:employee_id ( name, email, department_id, departments:department_id ( name ) )
        `)
        .order("created_at", { ascending: false });

      // Employees only see their own participations
      if (!canApprove) {
        query = query.eq("employee_id", profile!.id);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      const mapped: ParticipationRecord[] = (data || []).map((item: any) => ({
        id: item.id,
        challenge_id: item.challenge_id,
        employee_id: item.employee_id,
        progress: item.progress,
        proof_url: item.proof_url,
        approval_status: item.approval_status,
        xp_awarded: item.xp_awarded,
        approved_by: item.approved_by,
        created_at: item.created_at,
        challenge_title: item.challenges?.title || "Unknown Challenge",
        challenge_xp: item.challenges?.xp || 0,
        challenge_difficulty: item.challenges?.difficulty || "Easy",
        employee_name: item.employee?.name || "Unknown",
        employee_email: item.employee?.email || "",
        department_name: item.employee?.departments?.name || null,
      }));

      setParticipations(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load participation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitProof = async (participationId: string) => {
    const proof = proofText[participationId]?.trim();
    if (!proof) {
      toast.error("Please enter proof before submitting.");
      return;
    }
    try {
      setSubmitting(participationId);
      const { error: err } = await supabase
        .from("challenge_participations")
        .update({ proof_url: proof, progress: 100, approval_status: "pending" })
        .eq("id", participationId);
      if (err) throw err;
      toast.success("Proof submitted! Awaiting approval.");
      setProofText((prev) => ({ ...prev, [participationId]: "" }));
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit proof.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleApprove = async (participationId: string, xpToAward: number) => {
    try {
      setApproving(participationId);
      const { error: err } = await supabase
        .from("challenge_participations")
        .update({
          approval_status: "approved",
          xp_awarded: xpToAward,
          approved_by: profile!.id,
        })
        .eq("id", participationId);
      if (err) throw err;

      // Also bump the employee's XP
      const record = participations.find((p) => p.id === participationId);
      if (record) {
        const { data: emp } = await supabase
          .from("users")
          .select("xp, points_balance")
          .eq("id", record.employee_id)
          .single();
        if (emp) {
          await supabase
            .from("users")
            .update({ xp: emp.xp + xpToAward, points_balance: emp.points_balance + Math.floor(xpToAward / 10) })
            .eq("id", record.employee_id);
        }
      }

      toast.success(`Participation approved! ${xpToAward} XP awarded.`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve.");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (participationId: string) => {
    try {
      setApproving(participationId);
      const { error: err } = await supabase
        .from("challenge_participations")
        .update({ approval_status: "rejected", approved_by: profile!.id })
        .eq("id", participationId);
      if (err) throw err;
      toast.success("Participation rejected.");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject.");
    } finally {
      setApproving(null);
    }
  };

  const filtered = participations.filter((p) => {
    const matchSearch =
      p.challenge_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || p.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: participations.length,
    pending: participations.filter((p) => p.approval_status === "pending").length,
    approved: participations.filter((p) => p.approval_status === "approved").length,
    rejected: participations.filter((p) => p.approval_status === "rejected").length,
    totalXp: participations.filter((p) => p.approval_status === "approved").reduce((s, p) => s + p.xp_awarded, 0),
  };

  const difficultyColor: Record<string, string> = {
    Easy: "text-primary bg-primary/10 border-primary/20",
    Medium: "text-[#e8590c] bg-[#e8590c]/10 border-[#e8590c]/20",
    Hard: "text-danger bg-danger/10 border-danger/20",
  };

  if (loading) return <LoadingSpinner message="Loading participation feed..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Challenge Participation Feed
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {canApprove
              ? "Review and approve employee challenge submissions"
              : "Track your challenge progress and submit proof"}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: <Filter className="h-4 w-4" />, color: "text-text-primary" },
          { label: "Pending Review", value: stats.pending, icon: <Clock className="h-4 w-4" />, color: "text-[#e8590c]" },
          { label: "Approved", value: stats.approved, icon: <CheckCircle className="h-4 w-4" />, color: "text-primary" },
          { label: "XP Awarded", value: stats.totalXp, icon: <Zap className="h-4 w-4" />, color: "text-[#6741d9]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-text-secondary font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card title="Participation Records" subtitle={`${filtered.length} entries`}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary/50" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={canApprove ? "Search by challenge or employee..." : "Search by challenge..."}
              className="w-full pl-9 pr-3 py-2 text-xs bg-base border border-border rounded-lg text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all capitalize ${
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-base text-text-secondary border-border hover:border-primary/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-secondary/50 text-sm">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold">No participation records found.</p>
            <p className="text-xs mt-1">
              {!canApprove ? "Join a challenge from the Challenges page to get started!" : "No submissions yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => {
              const isExpanded = expandedId === p.id;
              const isMyEntry = p.employee_id === profile?.id;

              return (
                <div key={p.id} className="py-4">
                  <div
                    className="flex items-start gap-4 cursor-pointer group"
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {p.approval_status === "approved" && <CheckCircle className="h-5 w-5 text-primary" />}
                      {p.approval_status === "pending" && <Clock className="h-5 w-5 text-[#e8590c]" />}
                      {p.approval_status === "rejected" && <XCircle className="h-5 w-5 text-danger" />}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-text-primary truncate">{p.challenge_title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${difficultyColor[p.challenge_difficulty] || ""}`}>
                          {p.challenge_difficulty}
                        </span>
                        <StatusBadge status={p.approval_status} />
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-text-secondary flex-wrap">
                        {canApprove && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {p.employee_name}
                            {p.department_name && ` · ${p.department_name}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-[#6741d9]" />
                          {p.approval_status === "approved" ? `${p.xp_awarded} XP awarded` : `${p.challenge_xp} XP on approval`}
                        </span>
                        {p.created_at && (
                          <span className="text-text-secondary/50">
                            {format(new Date(p.created_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-text-secondary font-bold shrink-0">{p.progress}%</span>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <div className="shrink-0 text-text-secondary/40 group-hover:text-text-secondary transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 ml-9 space-y-4">
                      {/* Proof section */}
                      {p.proof_url ? (
                        <div className="bg-surface/60 border border-border rounded-xl p-3 text-xs">
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Upload className="h-3 w-3" /> Submitted Proof
                          </p>
                          <p className="text-text-primary leading-relaxed">{p.proof_url}</p>
                        </div>
                      ) : (
                        <div className="bg-surface/30 border border-dashed border-border rounded-xl p-3 text-xs text-text-secondary/60 text-center">
                          No proof submitted yet.
                        </div>
                      )}

                      {/* Employee: submit proof if not yet submitted / still pending */}
                      {isMyEntry && (p.approval_status === "pending" || !p.proof_url) && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                            {p.proof_url ? "Update your proof" : "Submit your proof"}
                          </p>
                          <textarea
                            rows={3}
                            value={proofText[p.id] || ""}
                            onChange={(e) => setProofText((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="Describe what you did, include links or evidence..."
                            className="w-full text-xs bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/50 resize-none"
                          />
                          <button
                            onClick={() => handleSubmitProof(p.id)}
                            disabled={submitting === p.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {submitting === p.id ? "Submitting..." : "Submit Proof"}
                          </button>
                        </div>
                      )}

                      {/* Admin/Dept Head: approve or reject */}
                      {canApprove && p.approval_status === "pending" && p.proof_url && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => handleApprove(p.id, p.challenge_xp)}
                            disabled={approving === p.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {approving === p.id ? "Processing..." : `Approve (+${p.challenge_xp} XP)`}
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={approving === p.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ParticipationPage;
