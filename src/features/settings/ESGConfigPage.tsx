import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { 
  getESGConfig, 
  updateESGConfig, 
  createESGConfig 
} from '../../lib/db/esgConfig';
import { ESGConfig } from '../../lib/types';
import { toast } from 'react-hot-toast';
import { Save, ShieldAlert, Sparkles, Scale } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const ESGConfigPage: React.FC = () => {
  const { profile } = useAuth();
  const [config, setConfig] = useState<ESGConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [orgName, setOrgName] = useState('EcoSphere Corp');
  const [envWeight, setEnvWeight] = useState(40);
  const [socWeight, setSocWeight] = useState(30);
  const [govWeight, setGovWeight] = useState(30);
  const [evidenceRequired, setEvidenceRequired] = useState(true);

  const isAdmin = profile?.role === 'admin';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getESGConfig();
      if (data) {
        setConfig(data);
        setOrgName(data.org_name);
        setEnvWeight(data.environmental_weight);
        setSocWeight(data.social_weight);
        setGovWeight(data.governance_weight);
        setEvidenceRequired(data.evidence_required);
      } else {
        // No config row exists (e.g. database cleared), seed a default local state
        setConfig(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load ESG configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only administrators can modify ESG configurations.');
      return;
    }

    // Weight sum validation
    const sum = Number(envWeight) + Number(socWeight) + Number(govWeight);
    if (sum !== 100) {
      toast.error(`Weights must sum to exactly 100%. Current sum: ${sum}%`);
      return;
    }

    setSaving(true);
    const payload = {
      org_name: orgName,
      environmental_weight: Number(envWeight),
      social_weight: Number(socWeight),
      governance_weight: Number(govWeight),
      evidence_required: evidenceRequired
    };

    try {
      if (config) {
        const updated = await updateESGConfig(config.id, payload);
        setConfig(updated);
        toast.success('ESG Configuration updated successfully!');
      } else {
        // Create singleton row
        const created = await createESGConfig(payload);
        setConfig(created);
        toast.success('ESG Configuration created and saved!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading configuration..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const sumOfWeights = Number(envWeight) + Number(socWeight) + Number(govWeight);
  const isWeightInvalid = sumOfWeights !== 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
          <span>⚙</span>
          <span>ESG Global Configuration</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">Set corporate parameters, ESG score weighting formulas, and CSR evidence rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Settings */}
        <Card title="Corporate Identity" subtitle="Configure organization scope details." accent="primary">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Organization Display Name
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin || saving}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. EcoSphere Corp"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>
          </div>
        </Card>

        {/* ESG Pillar Score Weights */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-primary" />
              <span>ESG Score Formula Weights</span>
            </div>
          }
          subtitle="Determine the mathematical weight (%) contributing to the composite ESG score." 
          accent="governance"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Env Weight */}
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Environmental (E) %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    disabled={!isAdmin || saving}
                    value={envWeight}
                    onChange={(e) => setEnvWeight(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 border border-border rounded-lg bg-base text-xs text-text-primary font-black focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-text-secondary/50 font-bold">%</span>
                </div>
              </div>

              {/* Soc Weight */}
              <div>
                <label className="block text-xs font-bold text-governance uppercase tracking-wider mb-2">
                  Social (S) %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    disabled={!isAdmin || saving}
                    value={socWeight}
                    onChange={(e) => setSocWeight(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 border border-border rounded-lg bg-base text-xs text-text-primary font-black focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-text-secondary/50 font-bold">%</span>
                </div>
              </div>

              {/* Gov Weight */}
              <div>
                <label className="block text-xs font-bold text-[#6741d9] uppercase tracking-wider mb-2">
                  Governance (G) %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    disabled={!isAdmin || saving}
                    value={govWeight}
                    onChange={(e) => setGovWeight(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 border border-border rounded-lg bg-base text-xs text-text-primary font-black focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-text-secondary/50 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Sum indicator */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
              isWeightInvalid 
                ? 'bg-danger/5 border-danger/20 text-danger' 
                : 'bg-primary/5 border-primary/20 text-primary'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wide">
                {isWeightInvalid ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Score Composition Formula Sum</span>
              </div>
              <span className="text-sm font-black">{sumOfWeights}% / 100%</span>
            </div>
          </div>
        </Card>

        {/* Validation & Security Rules */}
        <Card title="CSR Compliance Rule" subtitle="Configure challenge and activity validation parameters." accent="warning">
          <div className="flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider m-0">Evidence Requirement Toggle</h4>
              <p className="text-xs text-text-secondary">When active, employees cannot be approved for challenges or CSR points without attaching a proof file (e.g. photo upload).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isAdmin || saving}
                checked={evidenceRequired}
                onChange={(e) => setEvidenceRequired(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </Card>

        {/* Action Button */}
        {isAdmin && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving || isWeightInvalid}
              className="inline-flex items-center space-x-2 bg-primary hover:bg-[#2b8a3e] disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg shadow-md shadow-primary/10 active:scale-[0.98] transition-all text-xs"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving Configurations...' : 'Save Configuration'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
