import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { 
  getEmissionFactors, 
  createEmissionFactor, 
  updateEmissionFactor, 
  deleteEmissionFactor 
} from '../../lib/db/emissionFactors';
import { EmissionFactor } from '../../lib/types';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, Leaf } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const EmissionFactorsPage: React.FC = () => {
  const { profile } = useAuth();
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'Scope 1' | 'Scope 2' | 'Scope 3'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'create' | 'edit'>('create');
  const [selectedFactor, setSelectedFactor] = useState<EmissionFactor | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Scope 3');
  const [factorValue, setFactorValue] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [source, setSource] = useState('');

  const isAdmin = profile?.role === 'admin';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmissionFactors();
      setFactors(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load emission factors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalAction('create');
    setSelectedFactor(null);
    setName('');
    setCategory('Scope 3');
    setFactorValue(0);
    setUnit('kgCO2e/unit');
    setSource('');
    setIsModalOpen(true);
  };

  const openEditModal = (factor: EmissionFactor) => {
    setModalAction('edit');
    setSelectedFactor(factor);
    setName(factor.name);
    setCategory(factor.category);
    setFactorValue(factor.factor_value);
    setUnit(factor.unit);
    setSource(factor.source || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !unit || factorValue < 0) {
      toast.error('Please fill in all required fields and verify values.');
      return;
    }

    const payload = {
      name,
      category,
      factor_value: Number(factorValue),
      unit,
      source: source || null
    };

    try {
      if (modalAction === 'create') {
        await createEmissionFactor(payload);
        toast.success('Emission factor created successfully!');
      } else if (modalAction === 'edit' && selectedFactor) {
        await updateEmissionFactor(selectedFactor.id, payload);
        toast.success('Emission factor updated successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save emission factor.');
    }
  };

  const handleDeleteFactor = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this emission factor? This might affect existing calculations.')) {
      return;
    }

    try {
      await deleteEmissionFactor(id);
      toast.success('Emission factor deleted.');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete emission factor.');
    }
  };

  // Filters
  const filteredFactors = factors.filter(factor => {
    const matchesSearch = factor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = scopeFilter === 'all' || factor.category === scopeFilter;

    return matchesSearch && matchesScope;
  });

  if (loading) return <LoadingSpinner message="Loading emission factors..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-primary"><Leaf className="h-6 w-6" /></span>
            <span>Emission Factors Ledger</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">Configure carbon multipliers (CO₂e) per emission category (Scope 1/2/3).</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-[#2b8a3e] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-primary/20 active:scale-[0.98] transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Factor</span>
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
            placeholder="Search emission factors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        
        {/* Scope Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Classification:</label>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Scopes</option>
            <option value="Scope 1">Scope 1 (Direct Emissions)</option>
            <option value="Scope 2">Scope 2 (Indirect - Purchased Energy)</option>
            <option value="Scope 3">Scope 3 (Value Chain / Other)</option>
          </select>
        </div>
      </div>

      {/* Main Grid/Table */}
      <Card accent="primary">
        {filteredFactors.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl text-text-secondary/30">🌿</div>
            <p className="text-sm font-bold text-text-secondary">No emission factors found matching filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary uppercase font-bold tracking-widest bg-surface/30">
                  <th className="py-3.5 px-4">Factor Description</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4 text-right">Value (CO₂e)</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4">Data Source</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredFactors.map((factor) => (
                  <tr key={factor.id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-text-primary">
                      {factor.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        factor.category === 'Scope 1' 
                          ? 'bg-danger/10 text-danger border-danger/10'
                          : factor.category === 'Scope 2'
                          ? 'bg-[#1971c2]/10 text-[#1971c2] border-[#1971c2]/10'
                          : 'bg-primary/10 text-primary border-primary/10'
                      }`}>
                        {factor.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-text-primary">
                      {factor.factor_value}
                    </td>
                    <td className="py-4 px-4 font-medium text-text-secondary">
                      {factor.unit}
                    </td>
                    <td className="py-4 px-4 text-text-secondary/60 font-medium italic">
                      {factor.source || 'Standard Reference'}
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(factor)}
                          title="Edit"
                          className="p-1.5 rounded bg-surface border border-border hover:bg-primary/5 hover:text-primary transition-all active:scale-90 inline-flex"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFactor(factor.id)}
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
                {modalAction === 'create' ? 'Add New Emission Factor' : 'Edit Emission Factor'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Factor Name*
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grid Electricity (India)"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Scope Classification
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Scope 1">Scope 1 (Direct)</option>
                    <option value="Scope 2">Scope 2 (Indirect)</option>
                    <option value="Scope 3">Scope 3 (Value Chain)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Unit*
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. kgCO2e/kWh"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Factor Value (CO₂e)*
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    value={factorValue}
                    onChange={(e) => setFactorValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Data Source
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. IPCC 2024"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
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
                  {modalAction === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
