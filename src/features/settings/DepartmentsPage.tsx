import React, { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorState } from "../../components/ErrorState";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../lib/db/departments";
import { getUsers } from "../../lib/db/users";
import { Department, UserProfile } from "../../lib/types";
import { toast } from "react-hot-toast";
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const DepartmentsPage: React.FC = () => {
  const { profile } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"create" | "edit">("create");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [headId, setHeadId] = useState("");
  const [parentDeptId, setParentDeptId] = useState("");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const isAdmin = profile?.role === "admin";

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptsData, usersData] = await Promise.all([
        getDepartments(),
        getUsers(),
      ]);
      setDepartments(deptsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load departments data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalAction("create");
    setSelectedDept(null);
    setName("");
    setCode("");
    setHeadId("");
    setParentDeptId("");
    setEmployeeCount(0);
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setModalAction("edit");
    setSelectedDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHeadId(dept.head_id || "");
    setParentDeptId(dept.parent_department_id || "");
    setEmployeeCount(dept.employee_count);
    setStatus(dept.status);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error("Department name and code are required.");
      return;
    }

    const payload = {
      name,
      code: code.toUpperCase(),
      head_id: headId || null,
      parent_department_id: parentDeptId || null,
      employee_count: Number(employeeCount),
      status,
    };

    try {
      if (modalAction === "create") {
        await createDepartment(payload);
        toast.success("Department created successfully!");
      } else if (modalAction === "edit" && selectedDept) {
        await updateDepartment(selectedDept.id, payload);
        toast.success("Department updated successfully!");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save department.");
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to make this department inactive? This soft-deletes the record.",
      )
    ) {
      return;
    }

    try {
      await deleteDepartment(id);
      toast.success("Department status updated to inactive.");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete department.");
    }
  };

  // Filters
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || dept.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading departments..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Title block with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight">
            Departments Directory
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Manage organization structures, department heads, and counts.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-[#2b8a3e] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-primary/20 active:scale-[0.98] transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-base p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search by department name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
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
            <option value="all">All Departments</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl text-text-secondary/30">🏢</div>
            <p className="text-sm font-bold text-text-secondary">
              No departments found matching search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary uppercase font-bold tracking-widest text-left bg-surface/30">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Department Name</th>
                  <th className="py-3.5 px-4">Dept Head</th>
                  <th className="py-3.5 px-4 text-center">Employees</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {isAdmin && (
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredDepartments.map((dept) => {
                  const headUser = users.find((u) => u.id === dept.head_id);
                  return (
                    <tr
                      key={dept.id}
                      className="hover:bg-surface/30 transition-colors"
                    >
                      <td className="py-4 px-4 font-black text-text-primary tracking-wide">
                        <span className="bg-surface border border-border px-2 py-0.5 rounded">
                          {dept.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-text-primary">
                        {dept.name}
                      </td>
                      <td className="py-4 px-4 text-text-secondary font-medium">
                        {headUser ? (
                          <div className="flex items-center space-x-2">
                            <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-bold">
                              {headUser.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{headUser.name}</span>
                          </div>
                        ) : (
                          <span className="text-text-secondary/40 italic">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-text-primary">
                        {dept.employee_count}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={dept.status} />
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(dept)}
                            title="Edit"
                            className="p-1.5 rounded bg-surface border border-border hover:bg-primary/5 hover:text-primary transition-all active:scale-90 inline-flex"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {dept.status === "active" && (
                            <button
                              onClick={() => handleDeleteDept(dept.id)}
                              title="Deactivate"
                              className="p-1.5 rounded bg-surface border border-border hover:bg-danger/5 hover:text-danger transition-all active:scale-90 inline-flex"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                {modalAction === "create"
                  ? "Add New Department"
                  : "Edit Department"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleFormSubmit}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Department Name*
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sales & Accounts"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Code (Unique)*
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SAL"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    disabled={modalAction === "edit"} // Code shouldn't change
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Employee Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Department Head
                </label>
                <select
                  value={headId}
                  onChange={(e) => setHeadId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Select Department Head --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Parent Department (Hierarchical)
                </label>
                <select
                  value={parentDeptId}
                  onChange={(e) => setParentDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">
                    -- Select Parent Department (Optional) --
                  </option>
                  {departments
                    .filter((d) => !selectedDept || d.id !== selectedDept.id) // Avoid self-reference
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
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

              {/* Modal Footer */}
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
