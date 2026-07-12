import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import { getChallenges } from "../../lib/db/challenges";
import {
  getChallengeParticipations,
  joinChallenge,
  submitChallengeProof,
  approveChallengeParticipation,
  rejectChallengeParticipation,
} from "../../lib/db/challengeParticipations";
import { evaluateBadgeRules } from "../../lib/rules/ruleEvaluator";
import { recalculateAllScores } from "../../lib/rules/scoreCalculator";
import { Challenge, ChallengeParticipation } from "../../lib/types";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Sparkles,
  Trophy,
  ArrowLeft,
  Send,
  Check,
  X,
  ShieldAlert,
  Award,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participations, setParticipations] = useState<
    ChallengeParticipation[]
  >([]);
  const [myParticipation, setMyParticipation] =
    useState<ChallengeParticipation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const isAdmin = profile?.role === "admin";
  const isDeptHead = profile?.role === "department_head";
  const isApprover = isAdmin || isDeptHead;

  const loadData = async () => {
    if (!id || !profile) return;
    try {
      setLoading(true);
      setError(null);

      const challengesData = await getChallenges();
      const currentChallenge = challengesData.find((c) => c.id === id);

      if (!currentChallenge) {
        setError("Challenge not found.");
        return;
      }
      setChallenge(currentChallenge);

      // Fetch participations
      const partsData = await getChallengeParticipations({ challengeId: id });
      setParticipations(partsData);

      // Find my participation
      const myPart = partsData.find((p) => p.employee_id === profile.id);
      setMyParticipation(myPart || null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load challenge details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, profile]);

  const handleJoin = async () => {
    if (!challenge || !profile) return;
    try {
      await joinChallenge(challenge.id, profile.id);
      toast.success("Joined challenge! Get started on details below.");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to join challenge.");
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myParticipation || !proofUrl) {
      toast.error("Please enter a verification description or image URL.");
      return;
    }

    try {
      setIsSubmittingProof(true);
      await submitChallengeProof(myParticipation.id, proofUrl);
      toast.success("Proof submitted for review!");
      setIsSubmittingProof(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit proof.");
      setIsSubmittingProof(false);
    }
  };

  const handleApprove = async (part: ChallengeParticipation) => {
    if (!challenge || !profile) return;
    try {
      // 1. Approve participation and add points
      const result = await approveChallengeParticipation(
        part.id,
        challenge.id,
        part.employee_id,
        challenge.xp,
        profile.id,
      );

      toast.success(
        `Submission approved! +${challenge.xp} XP awarded to ${part.employee_name}.`,
      );

      // 2. Evaluate Badge rules for employee who completed challenge (Invariant #1)
      const newBadges = await evaluateBadgeRules(part.employee_id);
      if (newBadges && newBadges.length > 0) {
        newBadges.forEach((badge) => {
          toast.success(
            (t) => (
              <div className="flex items-center space-x-3 text-left">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-bold text-text-primary uppercase tracking-wide text-[10px]">
                    New Badge Unlocked!
                  </p>
                  <p className="font-extrabold text-sm text-[#f08c00]">
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    {badge.description}
                  </p>
                </div>
              </div>
            ),
            { duration: 6000 },
          );
        });
      }

      // 3. Recalculate scoring weights in background
      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to approve submission.");
    }
  };

  const handleReject = async (partId: string) => {
    if (!profile) return;
    try {
      await rejectChallengeParticipation(partId, profile.id);
      toast.error("Submission has been rejected.");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reject submission.");
    }
  };

  if (loading) return <LoadingSpinner message="Loading challenge details..." />;
  if (error || !challenge)
    return (
      <ErrorState message={error || "Challenge not found"} onRetry={loadData} />
    );

  const isJoined = !!myParticipation;
  const isPendingReview =
    myParticipation?.approval_status === "pending" &&
    myParticipation.progress === 100;
  const isApproved = myParticipation?.approval_status === "approved";
  const isRejected = myParticipation?.approval_status === "rejected";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/gamification/challenges"
          className="inline-flex items-center space-x-1.5 text-xs text-text-secondary hover:text-text-primary font-bold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Challenges</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Detail Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            accent="gamification"
            title={challenge.title}
            subtitle={
              <div className="flex items-center space-x-3 mt-1.5">
                <span className="text-[10px] font-bold uppercase bg-surface border border-border px-2 py-0.5 rounded text-text-secondary">
                  {challenge.category_name}
                </span>
                <span className="text-[10px] font-bold border border-[#f08c00]/20 bg-[#f08c00]/5 text-[#f08c00] px-2 py-0.5 rounded uppercase tracking-wider">
                  Difficulty: {challenge.difficulty}
                </span>
              </div>
            }
          >
            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Challenge Goals & Details
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl border border-border bg-surface/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">
                    Reward Points
                  </span>
                  <div className="flex items-center space-x-1.5 text-[#f08c00]">
                    <Sparkles className="h-5 w-5 fill-[#f08c00]/10" />
                    <span className="text-lg font-black tracking-wide">
                      +{challenge.xp} XP
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">
                    Deadline Date
                  </span>
                  <div className="flex items-center space-x-1.5 text-text-primary">
                    <Calendar className="h-5 w-5 text-text-secondary/60" />
                    <span className="text-sm font-bold">
                      {challenge.deadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert for Employee */}
              {isJoined && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isApproved
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : isPendingReview
                        ? "bg-warning/5 border-warning/20 text-warning"
                        : isRejected
                          ? "bg-danger/5 border-danger/20 text-danger"
                          : "bg-surface border-border text-text-secondary"
                  }`}
                >
                  <div className="space-y-0.5 text-xs text-left">
                    <p className="font-bold uppercase tracking-wider">
                      Your Participation Status
                    </p>
                    <p className="text-[11px] opacity-80">
                      {isApproved &&
                        `Approved! +${challenge.xp} XP has been added to your profile.`}
                      {isPendingReview &&
                        "Proof submitted. Awaiting manager review."}
                      {isRejected &&
                        "Your submission was declined. Please verify and submit new proof."}
                      {!isApproved &&
                        !isPendingReview &&
                        !isRejected &&
                        "You are enrolled. Complete the goals and submit proof below."}
                    </p>
                  </div>
                  <StatusBadge
                    status={myParticipation?.approval_status || "Enrolled"}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Employee actions block */}
          {profile?.role === "employee" && (
            <div className="space-y-6">
              {!isJoined ? (
                <button
                  onClick={handleJoin}
                  className="w-full py-4 bg-[#f08c00] hover:bg-[#d97c00] text-white border border-transparent rounded-xl text-sm font-bold shadow-md shadow-warning/20 transition-all active:scale-[0.98]"
                >
                  Join Challenge
                </button>
              ) : (
                /* Joined - Submit Proof block */
                !isApproved &&
                !isPendingReview && (
                  <Card
                    title="Submit Challenge Verification"
                    subtitle="Provide notes, URL, or code as proof of completion."
                    accent="gamification"
                  >
                    <form
                      onSubmit={handleFormSubmit}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                          Verification Details (URL, photo link, or logs)*
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="e.g. Uploaded tree plant image to http://imgur.com/myphoto or completed 15 miles of cycling."
                          className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-[#f08c00] resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingProof}
                          className="inline-flex items-center space-x-2 bg-[#f08c00] hover:bg-[#d97c00] text-white border border-transparent font-bold py-2 px-4 rounded-lg text-xs shadow-md active:scale-95 transition-all"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>
                            {isSubmittingProof
                              ? "Sending..."
                              : "Submit Verification"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </Card>
                )
              )}
            </div>
          )}
        </div>

        {/* Right: Approvals ledger (Managers / Admins only) */}
        <div className="lg:col-span-1">
          {isApprover ? (
            <Card
              title="Manage Submissions"
              subtitle="Review and approve employee submissions."
            >
              {participations.length === 0 ? (
                <div className="text-center py-12 text-xs text-text-secondary/50">
                  No participations recorded yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {participations.map((part) => (
                    <div
                      key={part.id}
                      className={`p-4 rounded-xl border border-border bg-surface/30 space-y-3 text-left transition-colors ${
                        part.approval_status === "approved"
                          ? "border-primary/10 bg-primary/5"
                          : part.approval_status === "rejected"
                            ? "border-danger/10 bg-danger/5"
                            : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary text-xs">
                          {part.employee_name}
                        </span>
                        <StatusBadge
                          status={part.approval_status}
                          className="text-[9px]"
                        />
                      </div>

                      {part.proof_url ? (
                        <div className="bg-base border border-border p-2.5 rounded-lg text-[11px] text-text-secondary font-medium whitespace-pre-wrap">
                          {part.proof_url}
                        </div>
                      ) : (
                        <p className="text-[10px] text-text-secondary/60 italic">
                          Joined challenge (no proof submitted yet).
                        </p>
                      )}

                      {/* Approval Buttons */}
                      {part.approval_status === "pending" && part.proof_url && (
                        <div className="flex items-center space-x-2 pt-1.5">
                          <button
                            onClick={() => handleApprove(part)}
                            className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-primary hover:bg-[#2b8a3e] text-white font-bold text-[10px] shadow-sm active:scale-95 transition-all"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(part.id)}
                            className="flex-1 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-danger hover:bg-[#c02626] text-white font-bold text-[10px] shadow-sm active:scale-95 transition-all"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            /* Employee Right Info card */
            <Card
              title="Challenge Progress"
              subtitle="Key metrics for this challenge."
            >
              <div className="space-y-4 text-xs text-left">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-text-secondary">Evidence Required</span>
                  <span className="font-bold text-text-primary">
                    {challenge.evidence_required ? "Yes (Photo/URL)" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-text-secondary">Difficulty Rank</span>
                  <span className="font-bold text-text-primary">
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">
                    Participants Enrolled
                  </span>
                  <span className="font-bold text-[#6741d9] bg-[#6741d9]/10 px-2 py-0.5 rounded-full">
                    {participations.length}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
