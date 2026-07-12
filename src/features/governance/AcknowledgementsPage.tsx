import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { getPolicyAcknowledgements } from '../../lib/db/policies';
import { PolicyAcknowledgement } from '../../lib/types';
import { Shield, ArrowLeft, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AcknowledgementsPage: React.FC = () => {
  const [acks, setAcks] = useState<PolicyAcknowledgement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPolicyAcknowledgements();
      setAcks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load policy acknowledgements feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading sign-off audits..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="text-left">
        <Link
          to="/governance/policies"
          className="inline-flex items-center space-x-1.5 text-xs text-text-secondary hover:text-text-primary font-bold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Policies</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-left">
        <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
          <span className="text-[#6741d9]"><Shield className="h-6 w-6" /></span>
          <span>Compliance Sign-off Ledger</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">Audit log of all corporate policy acknowledgements and ethical code bindings.</p>
      </div>

      {/* Sign-offs Ledger */}
      <Card accent="primary">
        {acks.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-secondary/50">
            No compliance policy sign-off records registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-secondary font-bold uppercase tracking-widest bg-surface/30">
                  <th className="py-3 px-4">Sign-off Date</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Policy Document Title</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {acks.map((ack) => (
                  <tr key={ack.id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-secondary/40" />
                        <span>
                          {new Date(ack.acknowledged_at).toLocaleDateString()} {new Date(ack.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">{ack.employee_name}</td>
                    <td className="py-3.5 px-4 font-medium text-text-primary flex items-center space-x-1.5">
                      <FileText className="h-4 w-4 text-text-secondary/50" />
                      <span>{ack.policy_title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/10 tracking-wider">
                        Signed & Bound
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
