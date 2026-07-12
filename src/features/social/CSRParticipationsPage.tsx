import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { getCsrParticipations, approveCsrParticipation, rejectCsrParticipation } from '../../lib/db/csrActivities';
import { recalculateAllScores } from '../../lib/rules/scoreCalculator';
import { EmployeeParticipation } from '../../lib/types';
import { toast } from 'react-hot-toast';
import { Heart, Check, X, ArrowLeft, Calendar } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export const CSRParticipationsPage: React.FC = () => {
  const { profile } = useAuth();
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCsrParticipations();
      setParticipations(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load CSR participations feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (partId: string) => {
    if (!profile) return;
    try {
      await approveCsrParticipation(partId, profile.id);
      toast.success('Volunteering record approved successfully.');
      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to approve record.');
    }
  };

  const handleReject = async (partId: string) => {
    if (!profile) return;
    try {
      await rejectCsrParticipation(partId, profile.id);
      toast.error('Volunteering record rejected.');
      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to reject record.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading participations feed..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="text-left">
        <Link
          to="/social/activities"
          className="inline-flex items-center space-x-1.5 text-xs text-text-secondary hover:text-text-primary font-bold transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Activities</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-left">
        <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
          <span className="text-governance"><Heart className="h-6 w-6 font-black" /></span>
          <span>Volunteering Approvals</span>
        </h2>
        <p className="text-xs text-text-secondary mt-1">Audit, approve, and verify employee volunteering hours and CSR participations.</p>
      </div>

      {/* Audit ledger */}
      <Card accent="secondary">
        {participations.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-secondary/50">
            No employee participations submitted for volunteer review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-secondary font-bold uppercase tracking-widest bg-surface/30">
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Activity Title</th>
                  <th className="py-3 px-4 text-center">Volunteered Hours</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {participations.map((part) => (
                  <tr key={part.id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-text-secondary/40" />
                        <span>{part.activity_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">{part.employee_name}</td>
                    <td className="py-3.5 px-4 font-medium text-text-primary">{part.activity_title}</td>
                    <td className="py-3.5 px-4 text-center font-black text-[#1971c2]">
                      {part.volunteering_hours} <span className="text-[10px] text-text-secondary/50 font-normal">hrs</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={part.approval_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {part.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(part.id)}
                            className="p-1.5 rounded bg-primary hover:bg-[#2b8a3e] text-white transition-all active:scale-90 inline-flex shadow-sm"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(part.id)}
                            className="p-1.5 rounded bg-danger hover:bg-[#c02626] text-white transition-all active:scale-90 inline-flex shadow-sm"
                            title="Reject"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
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
