import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { 
  getPolicies, 
  createPolicy, 
  acknowledgePolicy, 
  getPolicyAcknowledgements 
} from '../../lib/db/policies';
import { recalculateAllScores } from '../../lib/rules/scoreCalculator';
import { EsgPolicy, PolicyAcknowledgement } from '../../lib/types';
import { toast } from 'react-hot-toast';
import { Shield, Plus, X, BookOpen, Signature, CheckSquare, Eye } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export const PoliciesPage: React.FC = () => {
  const { profile } = useAuth();
  const [policies, setPolicies] = useState<EsgPolicy[]>([]);
  const [acks, setAcks] = useState<PolicyAcknowledgement[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<EsgPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0');

  const isAdmin = profile?.role === 'admin';
  const isEmployee = profile?.role === 'employee';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [policiesData, acksData] = await Promise.all([
        getPolicies(),
        profile ? getPolicyAcknowledgements({ employeeId: profile.id }) : Promise.resolve([])
      ]);
      setPolicies(policiesData);
      setAcks(acksData);
      
      if (policiesData.length > 0 && !selectedPolicy) {
        setSelectedPolicy(policiesData[0]);
      } else if (selectedPolicy) {
        // Refresh selected policy state
        const refreshed = policiesData.find(p => p.id === selectedPolicy.id);
        if (refreshed) setSelectedPolicy(refreshed);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load policy documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !version) {
      toast.error('Please enter all required fields.');
      return;
    }

    const payload = {
      title,
      content,
      version,
      status: 'published' as any, // Auto-publish for hackathon ease
      created_by: profile?.id || ''
    };

    try {
      await createPolicy(payload);
      toast.success('ESG Policy published successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to publish policy.');
    }
  };

  const handleAcknowledge = async () => {
    if (!selectedPolicy || !profile) return;
    try {
      await acknowledgePolicy(selectedPolicy.id, profile.id);
      toast.success('Policy acknowledged successfully. Signed compliance ledger.');
      
      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to sign compliance policy.');
    }
  };

  const isPolicyAcknowledged = (policyId: string) => {
    return acks.some(a => a.policy_id === policyId);
  };

  if (loading) return <LoadingSpinner message="Opening compliance library..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 text-left">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-[#6741d9]"><Shield className="h-6 w-6" /></span>
            <span>ESG Policies & Compliance</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">Review governance directives and record mandatory policy sign-offs.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link
              to="/governance/acknowledgements"
              className="inline-flex items-center space-x-1.5 border border-border bg-base px-3.5 py-2.5 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary active:scale-95 transition-all"
            >
              <Eye className="h-4 w-4" />
              <span>Review Sign-offs Ledger</span>
            </Link>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#6741d9] hover:bg-[#522eb0] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm active:scale-95 transition-all text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Policy</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Policies List Selector */}
        <div className="space-y-4">
          <Card title="Compliance Catalog" subtitle="Mandatory directives folder.">
            {policies.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-secondary/50">
                No compliance policy documents published.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {policies.map((p) => {
                  const isAck = isPolicyAcknowledged(p.id);
                  const isSelected = selectedPolicy?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPolicy(p)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between ${
                        isSelected 
                          ? 'border-[#6741d9] bg-[#6741d9]/5' 
                          : 'border-border bg-surface/50 hover:bg-surface'
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <h4 className="font-extrabold text-xs text-text-primary leading-tight flex items-center">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5 shrink-0 text-text-secondary/60" />
                          <span>{p.title}</span>
                        </h4>
                        <p className="text-[10px] text-text-secondary">Version: {p.version}</p>
                      </div>
                      
                      {isEmployee && (
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          isAck 
                            ? 'bg-primary/15 text-primary' 
                            : 'bg-danger/15 text-danger border border-danger/10 animate-pulse'
                        }`}>
                          {isAck ? 'Signed' : 'Pending'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Policy detail reader panel */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <Card 
              title={selectedPolicy.title} 
              subtitle={`Version: ${selectedPolicy.version} | Published: ${new Date(selectedPolicy.created_at).toLocaleDateString()}`}
              accent="secondary"
            >
              <div className="space-y-6 text-left">
                {/* Content body */}
                <div className="bg-surface border border-border p-5 rounded-xl text-xs leading-relaxed text-text-secondary whitespace-pre-wrap font-medium font-mono min-h-[250px]">
                  {selectedPolicy.content}
                </div>

                {/* Acknowledgement trigger for employee */}
                {isEmployee && (
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                    {isPolicyAcknowledged(selectedPolicy.id) ? (
                      <div className="flex items-center space-x-2 text-primary font-bold text-xs">
                        <CheckSquare className="h-5 w-5" />
                        <span>You signed and acknowledged this document. Compliance complete.</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-text-secondary leading-relaxed max-w-md font-semibold">
                          Signing represents acknowledgement that you have read and will abide by this governance directive.
                        </p>
                        
                        <button
                          onClick={handleAcknowledge}
                          className="inline-flex items-center space-x-2 bg-[#6741d9] hover:bg-[#522eb0] text-white font-bold py-2.5 px-5 rounded-xl shadow-md active:scale-95 transition-all text-xs border border-transparent whitespace-nowrap shrink-0"
                        >
                          <Signature className="h-4 w-4" />
                          <span>Sign Policy</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center text-text-secondary/50 text-xs border border-border border-dashed rounded-xl bg-surface/30">
              Select a policy document from the list to read.
            </div>
          )}
        </div>

      </div>

      {/* Publish Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                Publish ESG Compliance Directive
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-5 space-y-4 text-left">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Policy Document Title*
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Whistleblower & Ethics Code"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#6741d9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Version Code*
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Mandatory Directive content Text*
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the official text contents of the policy here..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#6741d9] resize-none font-mono"
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
                  className="px-4 py-2 bg-[#6741d9] hover:bg-[#522eb0] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-governance/10"
                >
                  Publish & Request Sign-offs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
