import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { 
  getCsrActivities, 
  createCsrActivity, 
  joinCsrActivity, 
  getCsrParticipations, 
  updateVolunteerHours 
} from '../../lib/db/csrActivities';
import { getCategories } from '../../lib/db/categories';
import { recalculateAllScores } from '../../lib/rules/scoreCalculator';
import { CsrActivity, Category, EmployeeParticipation } from '../../lib/types';
import { toast } from 'react-hot-toast';
import { Plus, Search, Heart, Calendar, Users, X, Clock, HelpCircle, UserPlus, Eye } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

export const CSRActivitiesPage: React.FC = () => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<CsrActivity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myParticipations, setMyParticipations] = useState<EmployeeParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(20);

  // Log Hours modal
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [logHoursVal, setLogHoursVal] = useState<number>(0);

  const isAdmin = profile?.role === 'admin';
  const isEmployee = profile?.role === 'employee';
  const canWrite = isAdmin;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [activitiesData, categoriesData] = await Promise.all([
        getCsrActivities(),
        getCategories()
      ]);
      setActivities(activitiesData);
      setCategories(categoriesData.filter(c => c.status === 'active' && c.type === 'csr'));

      if (profile) {
        const partsData = await getCsrParticipations({ employeeId: profile.id });
        setMyParticipations(partsData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load CSR activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setMaxParticipants(25);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId || !location || !date || maxParticipants <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload = {
      title,
      description,
      category_id: categoryId,
      location,
      date,
      max_participants: Number(maxParticipants),
      status: 'active' as any,
      created_by: profile?.id || ''
    };

    try {
      await createCsrActivity(payload);
      toast.success('CSR Activity created successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create activity.');
    }
  };

  const handleJoinActivity = async (activityId: string) => {
    if (!profile) return;
    try {
      await joinCsrActivity(activityId, profile.id);
      toast.success('Successfully registered for CSR activity!');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register.');
    }
  };

  const openHoursModal = (partId: string, currentHours: number) => {
    setSelectedPartId(partId);
    setLogHoursVal(currentHours);
    setIsHoursModalOpen(true);
  };

  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || logHoursVal < 0) return;

    try {
      await updateVolunteerHours(selectedPartId, Number(logHoursVal));
      toast.success('Volunteer hours logged successfully!');
      setIsHoursModalOpen(false);
      setSelectedPartId(null);
      
      await recalculateAllScores();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to log volunteer hours.');
    }
  };

  const getParticipationStatus = (activityId: string) => {
    return myParticipations.find(p => p.activity_id === activityId);
  };

  // Client-side filtering
  const filteredActivities = activities.filter(act => {
    const matchesSearch = 
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      act.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = catFilter === 'all' || act.category_id === catFilter;
    
    return matchesSearch && matchesCat;
  });

  if (loading) return <LoadingSpinner message="Loading CSR catalog..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="text-left">
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-governance"><Heart className="h-6 w-6" /></span>
            <span>CSR Volunteer Activities</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">Participate in corporate social responsibility programs and log volunteer hours.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link
              to="/social/participation"
              className="inline-flex items-center space-x-1.5 border border-border bg-base px-3.5 py-2.5 rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary active:scale-95 transition-all"
            >
              <Eye className="h-4 w-4" />
              <span>Review Participations</span>
            </Link>
          )}
          {canWrite && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 bg-governance hover:bg-[#1864ab] text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-governance/25 active:scale-[0.98] transition-all text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Host Activity</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-base p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search activities by title, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-base text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-[#1971c2]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category:</label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="border border-border rounded-lg bg-base px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-governance"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of CSR Activities */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-base rounded-xl border border-border space-y-3">
          <div className="text-4xl text-text-secondary/30">🌿</div>
          <p className="text-sm font-bold text-text-secondary">No CSR activities scheduled matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const part = getParticipationStatus(act.id);
            const isRegistered = !!part;

            return (
              <div key={act.id} className="flex flex-col h-full">
                <Card 
                  accent="secondary"
                  className="flex-grow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Category Label */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-[#1971c2]/10 text-[#1971c2] border border-[#1971c2]/10 px-2 py-0.5 rounded">
                        {act.category_name}
                      </span>
                      <StatusBadge status={act.status} className="text-[9px]" />
                    </div>

                    {/* Header Info */}
                    <div className="text-left space-y-1">
                      <h3 className="text-base font-extrabold text-text-primary m-0 tracking-tight leading-tight">{act.title}</h3>
                      <p className="text-[10px] text-text-secondary/70 font-semibold">{act.location}</p>
                      <p className="text-xs text-text-secondary/80 line-clamp-3 leading-relaxed mt-2">{act.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex flex-col space-y-4">
                    <div className="flex items-center justify-between text-xs text-text-secondary font-bold">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-[#1971c2]" />
                        <span>{act.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-[#1971c2]" />
                        <span>Max: {act.max_participants}</span>
                      </div>
                    </div>

                    {/* Join/Log Actions */}
                    {isEmployee && (
                      <div className="pt-2 border-t border-border/40">
                        {!isRegistered ? (
                          <button
                            onClick={() => handleJoinActivity(act.id)}
                            className="w-full inline-flex items-center justify-center space-x-1 py-2 px-3 rounded-lg bg-governance hover:bg-[#1864ab] text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                          >
                            <UserPlus className="h-4 w-4" />
                            <span>Sign Up for Event</span>
                          </button>
                        ) : (
                          /* Already joined */
                          <div className="space-y-2 text-left">
                            <div className="flex items-center justify-between bg-governance/5 p-2 rounded-lg border border-governance/10 text-[11px] text-governance font-bold">
                              <span>Registered</span>
                              <span>Hours: {part.volunteering_hours} hrs</span>
                            </div>
                            
                            {part.approval_status !== 'approved' && (
                              <button
                                onClick={() => openHoursModal(part.id, part.volunteering_hours)}
                                className="w-full inline-flex items-center justify-center space-x-1 py-1.5 px-2 border border-border hover:bg-surface rounded-lg text-text-primary font-bold text-[11px] transition-all"
                              >
                                <Clock className="h-3.5 w-3.5" />
                                <span>Log Volunteer Hours</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Host Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                Host CSR Volunteer Event
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Activity Title*
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Local Park Reforestation Drive"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#1971c2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Event Description*
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the CSR volunteering activities, assembly time, and guidelines..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-[#1971c2] resize-none"
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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  >
                    <option value="">-- Select --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Event Date*
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Location*
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. City Forest Park"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Max Volunteers count*
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2 bg-[#1971c2] hover:bg-[#1864ab] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-governance/10"
                >
                  Host Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log volunteer hours Modal */}
      {isHoursModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-base border border-border rounded-xl shadow-xl w-full max-w-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
                Log Volunteer Hours
              </h3>
              <button
                onClick={() => setIsHoursModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogHoursSubmit} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Total Volunteering Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={logHoursVal || ''}
                  onChange={(e) => setLogHoursVal(Number(e.target.value))}
                  placeholder="e.g. 3.5 hours"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-base text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsHoursModalOpen(false)}
                  className="px-3.5 py-1.5 border border-border rounded-lg text-xs font-bold text-text-secondary bg-base hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1971c2] text-white border border-transparent rounded-lg text-xs font-bold shadow-md shadow-governance/10"
                >
                  Log Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
