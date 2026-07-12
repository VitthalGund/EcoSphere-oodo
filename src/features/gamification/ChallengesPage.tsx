import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import { getChallenges, createChallenge } from "../../lib/db/challenges";
import { getCategories } from "../../lib/db/categories";
import { Challenge, Category } from "../../lib/types";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Trophy,
  Calendar,
  Eye,
  Sparkles,
  ShieldAlert,
  Award,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export const ChallengesPage: React.FC = () => {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "under_review" | "completed"
  >("active");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "Easy" | "Medium" | "Hard"
  >("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [xp, setXp] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Medium",
  );
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [deadline, setDeadline] = useState("");

  const isAdmin = profile?.role === "admin";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [challengesData, categoriesData] = await Promise.all([
        getChallenges(),
        getCategories(),
      ]);
      setChallenges(challengesData);
      setCategories(
        categoriesData.filter(
          (c) => c.status === "active" && c.type === "challenge",
        ),
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setCategoryId("");
    setXp(150);
    setDifficulty("Medium");
    setEvidenceRequired(true);
    setDeadline(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ); // Default 7 days from now
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId || xp <= 0 || !deadline) {
      toast.error("Please enter all required fields.");
      return;
    }

    const payload = {
      title,
      description,
      category_id: categoryId,
      xp: Number(xp),
      difficulty,
      evidence_required: evidenceRequired,
      deadline,
      status: "active" as any, // Auto-publish for hackathon ease
      created_by: profile?.id || "",
    };

    try {
      await createChallenge(payload);
      toast.success("Challenge created and published successfully!");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create challenge.");
    }
  };

  const getDifficultyColor = (diff: Challenge["difficulty"]) => {
    switch (diff) {
      case "Easy":
        return "bg-primary/10 text-primary border-primary/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "Hard":
        return "bg-danger/10 text-danger border-danger/20";
    }
  };

  // Client-side filters
  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || c.difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  if (loading)
    return <LoadingSpinner message="Loading challenges catalog..." />;
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
            <span>Sustainability Challenges</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Participate in challenges, submit proof, and earn XP towards badge
            milestones.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-[#f08c00] hover:bg-[#d97c00] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-warning/20 active:scale-[0.98] transition-all text-xs border border-transparent"
          >
            <Plus className="h-4 w-4" />
            <span>Create Challenge</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-base p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search challenges by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Difficulty:
          </label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Hard">Hard Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="all">All Challenges</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-12 bg-base rounded-xl border border-border space-y-3">
          <div className="text-4xl text-text-secondary/30">🏆</div>
          <p className="text-sm font-bold text-text-secondary">
            No challenges found matching filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((c) => (
            <div key={c.id} className="flex flex-col h-full">
              <Card
                accent="gamification"
                className="flex-grow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Category and Difficulty Tag Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-[#6741d9]/10 text-[#6741d9] border border-[#6741d9]/10 px-2 py-0.5 rounded">
                      {c.category_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold border px-2 py-0.5 rounded ${getDifficultyColor(c.difficulty)}`}
                    >
                      {c.difficulty}
                    </span>
                  </div>

                  {/* Header info */}
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-extrabold text-text-primary m-0 tracking-tight leading-tight">
                      {c.title}
                    </h3>
                    <p className="text-xs text-text-secondary/80 line-clamp-3 leading-relaxed mt-2">
                      {c.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  {/* XP Reward info */}
                  <div className="flex items-center space-x-1.5 text-[#f08c00]">
                    <Sparkles className="h-4 w-4 fill-[#f08c00]/15" />
                    <span className="text-sm font-black tracking-wide">
                      +{c.xp}{" "}
                      <span className="text-[10px] font-medium text-text-secondary">
                        XP
                      </span>
                    </span>
                  </div>

                  {/* Deadline info */}
                  <div className="flex items-center space-x-1 text-text-secondary text-[11px] font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Due {c.deadline}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <StatusBadge status={c.status} className="text-[10px]" />
                  <Link
                    to={`/gamification/challenges/${c.id}`}
                    className="inline-flex items-center space-x-1 justify-center rounded-lg border border-border bg-base px-3 py-1.5 text-xs font-bold text-text-primary hover:bg-surface hover:text-text-primary active:scale-95 transition-all text-center"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Details & Join</span>
                  </Link>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                Create New Challenge
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
              onSubmit={handleFormSubmit}
              className="p-5 space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Challenge Title*
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cycle to Work Week"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-[#f08c00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Description*
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about what activities are required to complete this challenge..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-[#f08c00] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Category*
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  >
                    <option value="">-- Select --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    End Deadline*
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    XP Reward Points*
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Difficulty*
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Evidence Upload Required
                  </label>
                  <p className="text-[10px] text-text-secondary">
                    Requires users to upload image proof before approval.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={evidenceRequired}
                    onChange={(e) => setEvidenceRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f08c00]"></div>
                </label>
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
                  Publish Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
