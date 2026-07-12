import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import {
  getEnvironmentalGoals,
  createEnvironmentalGoal,
  updateEnvironmentalGoal,
  deleteEnvironmentalGoal,
} from "../../lib/db/environmentalGoals";
import { getDepartments } from "../../lib/db/departments";
import { EnvironmentalGoal, Department } from "../../lib/types";
import { toast } from "react-hot-toast";
import { Plus, Search, Edit2, Trash2, X, Target } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const EnvironmentalGoalsPage: React.FC = () => {
  const { profile } = useAuth();
  const [goals, setGoals] = useState<
    (EnvironmentalGoal & { department_name?: string })[]
  >([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"create" | "edit">("create");
  const [selectedGoal, setSelectedGoal] = useState<EnvironmentalGoal | null>(
    null,
  );

  // Form Fields
  const [departmentId, setDepartmentId] = useState("");
  const [targetMetric, setTargetMetric] = useState("");
  const [targetValue, setTargetValue] = useState<number>(0);
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"active" | "completed" | "missed">(
    "active",
  );

  const isAdmin = profile?.role === "admin";
  const isDeptHead = profile?.role === "department_head";
  const canWrite = isAdmin || isDeptHead;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalsData, deptsData] = await Promise.all([
        getEnvironmentalGoals(),
        getDepartments(),
      ]);
      setGoals(goalsData);
      setDepartments(deptsData.filter((d) => d.status === "active"));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load environmental goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalAction("create");
    setSelectedGoal(null);
    setDepartmentId(profile?.department_id || "");
    setTargetMetric("");
    setTargetValue(0);
    setDeadline(
      new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
    ); // Default to Dec 31 of current year
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (goal: EnvironmentalGoal) => {
    setModalAction("edit");
    setSelectedGoal(goal);
    setDepartmentId(goal.department_id);
    setTargetMetric(goal.target_metric);
    setTargetValue(goal.target_value);
    setDeadline(goal.deadline);
    setStatus(goal.status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId || !targetMetric || targetValue <= 0 || !deadline) {
      toast.error("Please enter all required fields.");
      return;
    }

    const payload = {
      department_id: departmentId,
      target_metric: targetMetric,
      target_value: Number(targetValue),
      deadline,
      status,
    };

    try {
      if (modalAction === "create") {
        await createEnvironmentalGoal(payload);
        toast.success("Environmental Goal created successfully!");
      } else if (modalAction === "edit" && selectedGoal) {
        await updateEnvironmentalGoal(selectedGoal.id, payload);
        toast.success("Environmental Goal updated.");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save environmental goal.");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this goal?")
    ) {
      return;
    }

    try {
      await deleteEnvironmentalGoal(id);
      toast.success("Goal deleted.");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete goal.");
    }
  };

  // Filters
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.target_metric
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDept =
      deptFilter === "all" || goal.department_id === deptFilter;

    return matchesSearch && matchesDept;
  });

  if (loading)
    return <LoadingSpinner message="Loading environmental goals..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-primary">
              <Target className="h-6 w-6" />
            </span>
            <span>Environmental Goals & Targets</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Set, track, and audit carbon reduction goals per department.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-[#2b8a3e] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-primary/20 active:scale-[0.98] transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Goal</span>
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
            placeholder="Search goals by metric keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Department:
          </label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals Card */}
      <Card accent="primary">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl text-text-secondary/30">🎯</div>
            <p className="text-sm font-bold text-text-secondary">
              No environmental goals defined matching criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary uppercase font-bold tracking-widest bg-surface/30">
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Target Metric</th>
                  <th className="py-3.5 px-4 text-right">Target Value</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {canWrite && (
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredGoals.map((goal) => (
                  <tr
                    key={goal.id}
                    className="hover:bg-surface/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-text-primary">
                      {goal.department_name}
                    </td>
                    <td className="py-4 px-4 font-medium text-text-primary">
                      {goal.target_metric}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-text-primary">
                      {goal.target_value.toLocaleString()}{" "}
                      <span className="text-[10px] text-text-secondary/50 font-normal">
                        kgCO₂e
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-text-secondary">
                      {goal.deadline}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={goal.status} />
                    </td>
                    {canWrite && (
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(goal)}
                          title="Edit"
                          className="p-1.5 rounded bg-surface border border-border hover:bg-primary/5 hover:text-primary transition-all active:scale-90 inline-flex"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          title="Delete"
                          className="p-1.5 rounded bg-surface border border-border hover:bg-danger/5 hover:text-danger transition-all active:scale-90 inline-flex"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                {modalAction === "create"
                  ? "Add Environmental Goal"
                  : "Edit Goal Details"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Department*
                  </label>
                  <select
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Select --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Deadline*
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Target Metric*
                </label>
                <input
                  type="text"
                  required
                  value={targetMetric}
                  onChange={(e) => setTargetMetric(e.target.value)}
                  placeholder="e.g. Reduce electricity footprint by 15%"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Target Limit (kgCO₂e)*
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetValue || ""}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed (Goal Met)</option>
                    <option value="missed">Missed (Goal Failed)</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-primary hover:bg-[#2b8a3e] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                >
                  {modalAction === "create" ? "Save Goal" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
