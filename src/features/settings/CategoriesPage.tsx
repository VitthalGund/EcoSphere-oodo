import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../lib/db/categories";
import { Category } from "../../lib/types";
import { toast } from "react-hot-toast";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const CategoriesPage: React.FC = () => {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "csr_activity" | "challenge"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"create" | "edit">("create");
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState<"csr_activity" | "challenge">("challenge");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const isAdmin = profile?.role === "admin";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalAction("create");
    setSelectedCat(null);
    setName("");
    setType("challenge");
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setModalAction("edit");
    setSelectedCat(cat);
    setName(cat.name);
    setType(cat.type);
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    const payload = {
      name,
      type,
      status,
    };

    try {
      if (modalAction === "create") {
        await createCategory(payload);
        toast.success("Category created successfully!");
      } else if (modalAction === "edit" && selectedCat) {
        await updateCategory(selectedCat.id, payload);
        toast.success("Category updated successfully!");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save category.");
    }
  };

  const handleDeleteCat = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this category?")) {
      return;
    }

    try {
      await deleteCategory(id);
      toast.success("Category status updated to inactive.");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to deactivate category.");
    }
  };

  // Filters
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || cat.type === typeFilter;
    const matchesStatus = statusFilter === "all" || cat.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading categories..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight">
            Sustainability Categories
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Configure active types for CSR activities and gamified challenges.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-[#2b8a3e] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-primary/20 active:scale-[0.98] transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
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
            placeholder="Search by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Type:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="challenge">Challenges</option>
            <option value="csr_activity">CSR Activities</option>
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
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Categories</option>
          </select>
        </div>
      </div>

      {/* Categories List Card */}
      <Card>
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl text-text-secondary/30">🏷️</div>
            <p className="text-sm font-bold text-text-secondary">
              No categories found matching filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary uppercase font-bold tracking-widest text-left bg-surface/30">
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Pillar Type</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {isAdmin && (
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-surface/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-text-primary">
                      {cat.name}
                    </td>
                    <td className="py-4 px-4">
                      {cat.type === "challenge" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#f08c00]/10 text-[#f08c00] border border-[#f08c00]/10">
                          🏆 Challenge
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#1971c2]/10 text-[#1971c2] border border-[#1971c2]/10">
                          👥 CSR Activity
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={cat.status} />
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Edit"
                          className="p-1.5 rounded bg-surface border border-border hover:bg-primary/5 hover:text-primary transition-all active:scale-90 inline-flex"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {cat.status === "active" && (
                          <button
                            onClick={() => handleDeleteCat(cat.id)}
                            title="Deactivate"
                            className="p-1.5 rounded bg-surface border border-border hover:bg-danger/5 hover:text-danger transition-all active:scale-90 inline-flex"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
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
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                {modalAction === "create"
                  ? "Add New Category"
                  : "Edit Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Category Name*
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Energy Conservation"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Pillar Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="challenge">
                    🏆 Challenge (Gamified Action)
                  </option>
                  <option value="csr_activity">
                    👥 CSR Activity (Social pillar)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Active</span>
                  </label>
                  <label className="inline-flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "inactive"}
                      onChange={() => setStatus("inactive")}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Inactive</span>
                  </label>
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
                  {modalAction === "create" ? "Create" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
