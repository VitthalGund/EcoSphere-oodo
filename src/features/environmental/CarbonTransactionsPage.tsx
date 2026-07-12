import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import {
  getCarbonTransactions,
  createCarbonTransaction,
  updateCarbonTransaction,
  deleteCarbonTransaction,
} from "../../lib/db/carbonTransactions";
import { getDepartments } from "../../lib/db/departments";
import { getEmissionFactors } from "../../lib/db/emissionFactors";
import { recalculateAllScores } from "../../lib/rules/scoreCalculator";
import {
  classifyActivityDescription,
  type ClassificationResult,
} from "../../lib/ai/classifier";
import { CarbonTransaction, Department, EmissionFactor } from "../../lib/types";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Filter,
  Calendar,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const CarbonTransactionsPage: React.FC = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<CarbonTransaction[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [factorFilter, setFactorFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"create" | "edit">("create");
  const [selectedTx, setSelectedTx] = useState<CarbonTransaction | null>(null);

  // Form Fields
  const [departmentId, setDepartmentId] = useState("");
  const [emissionFactorId, setEmissionFactorId] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [co2e, setCo2e] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // AI Assist Classifier Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiModel, setAiModel] = useState("qwen2.5:3b");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<
    (ClassificationResult & { provider: "gemini" | "ollama" }) | null
  >(null);
  const [aiDeptId, setAiDeptId] = useState("");
  const [aiDate, setAiDate] = useState(new Date().toISOString().split("T")[0]);

  const isAdmin = profile?.role === "admin";
  const isDeptHead = profile?.role === "department_head";
  const canWrite = isAdmin || isDeptHead;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [txData, deptsData, factorsData] = await Promise.all([
        getCarbonTransactions(),
        getDepartments(),
        getEmissionFactors(),
      ]);
      setTransactions(txData);
      setDepartments(deptsData.filter((d) => d.status === "active"));
      setFactors(factorsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load carbon transactions ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle auto-calculation of CO2e when amount or emission factor changes
  useEffect(() => {
    const factorObj = factors.find((f) => f.id === emissionFactorId);
    if (factorObj && amount > 0) {
      const calculated = amount * Number(factorObj.factor_value);
      setCo2e(Number(calculated.toFixed(4)));
    } else {
      setCo2e(0);
    }
  }, [amount, emissionFactorId, factors]);

  const openCreateModal = () => {
    setModalAction("create");
    setSelectedTx(null);
    setDepartmentId(profile?.department_id || "");
    setEmissionFactorId("");
    setSourceType("");
    setDescription("");
    setAmount(0);
    setCo2e(0);
    setDate(new Date().toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const openAiModal = () => {
    setAiInput("");
    setAiResult(null);
    setAiDeptId(profile?.department_id || "");
    setAiDate(new Date().toISOString().split("T")[0]);
    setIsAiModalOpen(true);
  };

  const openEditModal = (tx: CarbonTransaction) => {
    setModalAction("edit");
    setSelectedTx(tx);
    setDepartmentId(tx.department_id);
    setEmissionFactorId(tx.emission_factor_id);
    setSourceType(tx.source_type);
    setDescription(tx.description);
    setAmount(tx.amount);
    setCo2e(tx.co2e);
    setDate(tx.date);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !departmentId ||
      !emissionFactorId ||
      !sourceType ||
      amount <= 0 ||
      !date
    ) {
      toast.error(
        "Please verify all required fields. Amount must be positive.",
      );
      return;
    }

    const payload = {
      department_id: departmentId,
      emission_factor_id: emissionFactorId,
      source_type: sourceType,
      description,
      amount: Number(amount),
      co2e,
      date,
      created_via: selectedTx?.created_via || ("manual" as any),
      created_by: profile?.id || "",
    };

    try {
      if (modalAction === "create") {
        await createCarbonTransaction(payload);
        toast.success("Carbon Transaction logged successfully!");
      } else if (modalAction === "edit" && selectedTx) {
        await updateCarbonTransaction(selectedTx.id, payload);
        toast.success("Carbon Transaction updated.");
      }
      setIsModalOpen(false);

      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save transaction.");
    }
  };

  const handleAiAnalyze = async () => {
    if (!aiInput.trim()) {
      toast.error("Please enter a description to classify.");
      return;
    }

    try {
      setAiLoading(true);
      setAiResult(null);
      const result = await classifyActivityDescription(aiInput, aiModel);
      setAiResult(result);

      if (result.provider === "ollama") {
        toast.success("Classified locally via Ollama.");
      } else {
        toast.success("Classified using Gemini API.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message || "AI Classification failed. Check Ollama server state.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiApproveAndLog = async () => {
    if (!aiResult) return;
    if (!aiDeptId) {
      toast.error("Please select a department.");
      return;
    }
    if (!aiResult.emission_factor_id) {
      toast.error("No matching emission factor selected.");
      return;
    }
    if (aiResult.amount <= 0) {
      toast.error("Amount must be positive.");
      return;
    }

    const factorObj = factors.find((f) => f.id === aiResult.emission_factor_id);
    if (!factorObj) {
      toast.error("Selected emission factor not found.");
      return;
    }

    const calculatedCo2e = Number(
      (aiResult.amount * Number(factorObj.factor_value)).toFixed(4),
    );

    const payload = {
      department_id: aiDeptId,
      emission_factor_id: aiResult.emission_factor_id,
      source_type: aiResult.source_type,
      description: `AI Classified Note: "${aiInput}"\n\nAI Explanation: ${aiResult.explanation}`,
      amount: Number(aiResult.amount),
      co2e: calculatedCo2e,
      date: aiDate,
      created_via: "ai_classifier" as any,
      created_by: profile?.id || "",
    };

    try {
      await createCarbonTransaction(payload);
      toast.success("AI classification approved and logged!");
      setIsAiModalOpen(false);

      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save transaction.");
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this transaction? Score records will be recomputed.",
      )
    ) {
      return;
    }

    try {
      await deleteCarbonTransaction(id);
      toast.success("Transaction deleted successfully.");
      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete transaction.");
    }
  };

  const selectedFactorObj = factors.find((f) => f.id === emissionFactorId);
  const unitLabel = selectedFactorObj ? selectedFactorObj.unit : "";

  const filteredTxs = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.source_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === "all" || tx.department_id === deptFilter;
    const matchesFactor =
      factorFilter === "all" || tx.emission_factor_id === factorFilter;

    const matchesStartDate = !startDate || tx.date >= startDate;
    const matchesEndDate = !endDate || tx.date <= endDate;

    return (
      matchesSearch &&
      matchesDept &&
      matchesFactor &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="text-left">
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight">
            Carbon Transactions Ledger
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Audit, edit, and log Scope 1, 2, and 3 carbon emission activities.
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center space-x-3">
            <button
              onClick={openAiModal}
              className="inline-flex items-center space-x-2 bg-[#6741d9] hover:bg-[#522eb0] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-[#6741d9]/25 active:scale-[0.98] transition-all text-xs"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>AI Assist Log</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 bg-primary hover:bg-[#2b8a3e] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-primary/20 active:scale-[0.98] transition-all text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Log Transaction</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-base p-4 rounded-xl border border-border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary/50" />
            <input
              type="text"
              placeholder="Search descriptions, vouchers, sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-56">
            <select
              value={factorFilter}
              onChange={(e) => setFactorFilter(e.target.value)}
              className="w-full border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1"
            >
              <option value="all">All Emission Factors</option>
              {factors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-border/40">
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-bold uppercase tracking-wider">
              Date Filters:
            </span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-border rounded-lg bg-base px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
            />
            <span className="text-text-secondary text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-border rounded-lg bg-base px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs text-governance font-bold hover:underline"
            >
              Reset Date Filter
            </button>
          )}
        </div>
      </div>

      {/* Ledger Card */}
      <Card accent="primary">
        {filteredTxs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl text-text-secondary/30">📊</div>
            <p className="text-sm font-bold text-text-secondary">
              No carbon transactions logged for this selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary uppercase font-bold tracking-widest bg-surface/30">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Source & Description</th>
                  <th className="py-3.5 px-4">Emission Factor</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">CO₂e (kg)</th>
                  <th className="py-3.5 px-4 text-center">Via</th>
                  {canWrite && (
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-surface/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-text-primary whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-secondary/50" />
                        <span>{tx.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-text-primary">
                      {tx.department_name}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-text-primary">
                        {tx.source_type}
                      </p>
                      <p
                        className="text-text-secondary/80 text-[11px] truncate max-w-xs mt-0.5"
                        title={tx.description}
                      >
                        {tx.description || "No description provided."}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-text-primary">
                        {tx.emission_factor_name}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-text-secondary whitespace-nowrap">
                      {tx.amount}{" "}
                      <span className="text-[10px] text-text-secondary/50">
                        {tx.emission_factor_unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-primary text-sm whitespace-nowrap">
                      {tx.co2e.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {tx.created_via === "ai_classifier" ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-[#6741d9]/15 text-[#6741d9] border border-[#6741d9]/10 shadow-xs uppercase tracking-wider"
                          title="Classified by Gemini AI"
                        >
                          <Sparkles className="h-2.5 w-2.5 mr-0.5 fill-[#6741d9]/25" />
                          <span>AI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-surface border border-border text-text-secondary uppercase tracking-wider">
                          Manual
                        </span>
                      )}
                    </td>
                    {canWrite && (
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(tx)}
                          title="Edit"
                          className="p-1.5 rounded bg-surface border border-border hover:bg-primary/5 hover:text-primary transition-all active:scale-90 inline-flex"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
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

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                {modalAction === "create"
                  ? "Log Carbon Activity"
                  : "Edit Carbon Entry"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
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
                    Log Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Emission Factor multiplier*
                </label>
                <select
                  required
                  value={emissionFactorId}
                  onChange={(e) => setEmissionFactorId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
                >
                  <option value="">-- Search Emission Factor --</option>
                  {factors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.category} — {f.factor_value} CO₂e)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Amount*
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={amount || ""}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                    />
                    {unitLabel && (
                      <span className="absolute right-3 top-2 text-xs text-text-secondary/50 font-semibold">
                        {unitLabel.split("/")[1] || unitLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Calculated CO₂e (kg)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={co2e}
                    className="w-full px-3 py-2 border border-primary/20 bg-primary/5 rounded-lg text-xs font-black text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Source Type*
                </label>
                <input
                  type="text"
                  required
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  placeholder="e.g. Fuel receipt, Electric meter, Air ticket voucher"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Notes & Details
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the carbon generating activity..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-text-secondary bg-base hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-[#2b8a3e] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-primary/10"
                >
                  {modalAction === "create"
                    ? "Save Transaction"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assist Classifier Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center space-x-2">
                <span className="text-[#6741d9]">
                  <BrainCircuit className="h-5 w-5 animate-pulse" />
                </span>
                <span>AI Emission Classifier</span>
              </h3>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[500px]">
              {/* Target Department & Date */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Log Department*
                  </label>
                  <select
                    required
                    value={aiDeptId}
                    onChange={(e) => setAiDeptId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1"
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
                    Entry Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={aiDate}
                    onChange={(e) => setAiDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Text Input area */}
              <div className="text-left">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Paste invoice text, purchase receipt description, or raw note*
                </label>
                <textarea
                  required
                  rows={3}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. Purchased 400 liters of gasoline for delivery vans. Total cost $600."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#6741d9] resize-none"
                />
              </div>

              {/* Local Fallback Settings */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-b border-border/40 py-3 gap-3 text-left">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Local Fallback Model
                  </span>
                  <p className="text-[10px] text-text-secondary">
                    Ollama fallback used if Gemini API fails or runs offline.
                  </p>
                </div>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="border border-border rounded-lg bg-base px-2.5 py-1.5 text-xs text-text-primary focus:outline-none"
                >
                  <option value="qwen2.5:3b">qwen2.5:3b (Recommended)</option>
                  <option value="gemma2:2b">gemma2:2b (Lightweight)</option>
                  <option value="llama3:8b">llama3:8b (Standard)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiLoading}
                  className="inline-flex items-center space-x-2 bg-[#6741d9] hover:bg-[#522eb0] text-white border border-transparent font-bold py-2.5 px-4 rounded-lg text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {aiLoading
                      ? "AI Classification in progress..."
                      : "Analyze with AI"}
                  </span>
                </button>
              </div>

              {/* Classification result preview */}
              {aiResult && (
                <div className="mt-4 border border-border rounded-xl bg-surface/30 p-4 space-y-4 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      AI Classification Review
                    </span>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          aiResult.confidence >= 0.8
                            ? "bg-primary/10 text-primary border-primary/10"
                            : "bg-warning/10 text-warning border-warning/10"
                        }`}
                      >
                        Match: {Math.round(aiResult.confidence * 100)}%
                        Confidence
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-surface border border-border text-text-secondary uppercase">
                        Via {aiResult.provider.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                        Matched Emission Factor
                      </label>
                      <select
                        value={aiResult.emission_factor_id || ""}
                        onChange={(e) =>
                          setAiResult({
                            ...aiResult,
                            emission_factor_id: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 border border-border rounded-lg bg-base text-xs font-semibold focus:outline-none"
                      >
                        <option value="">-- No Match --</option>
                        {factors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.factor_value} CO₂e)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                        Parsed Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={aiResult.amount}
                        onChange={(e) =>
                          setAiResult({
                            ...aiResult,
                            amount: Number(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1.5 border border-border rounded-lg bg-base text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                        Source Type title
                      </label>
                      <input
                        type="text"
                        value={aiResult.source_type}
                        onChange={(e) =>
                          setAiResult({
                            ...aiResult,
                            source_type: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 border border-border rounded-lg bg-base text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                        AI Reasoning & Explanation
                      </label>
                      <p className="text-[11px] text-text-secondary bg-base p-2.5 rounded-lg border border-border/60">
                        {aiResult.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Warning if confidence is low */}
                  {aiResult.confidence < 0.6 && (
                    <div className="p-3 bg-warning/5 border border-warning/10 rounded-lg flex items-start space-x-2 text-[10px] text-warning leading-relaxed font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Low confidence match. Please verify the matching factor
                        and parsed amount manually.
                      </span>
                    </div>
                  )}

                  {/* Confirm Log CTA */}
                  <div className="pt-2 border-t border-border flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setAiResult(null)}
                      className="px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-text-secondary hover:bg-surface transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleAiApproveAndLog}
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-primary hover:bg-[#2b8a3e] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve & Log</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CarbonTransactionsPage;
