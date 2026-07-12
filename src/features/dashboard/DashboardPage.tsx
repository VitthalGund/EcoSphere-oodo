import React, { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { supabase } from '../../lib/supabase';
import type { DepartmentScore, ESGConfig } from '../../lib/types';
import { recalculateAllScores } from '../../lib/rules/scoreCalculator';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { Scale, Leaf, Heart, Shield, Sparkles, TrendingUp, ChevronRight, BrainCircuit, X, MessageSquareQuote } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [orgScore, setOrgScore] = useState<DepartmentScore | null>(null);
  const [weights, setWeights] = useState<Omit<ESGConfig, 'id' | 'updated_at'> | null>(null);
  const [departmentScores, setDepartmentScores] = useState<(DepartmentScore & { department_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected gauge segment
  const [selectedPillar, setSelectedPillar] = useState<'env' | 'soc' | 'gov' | 'total'>('total');

  // Copilot Advisory State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);

  // Just fetch pre-calculated scores — NO recalculation (3 API calls total)
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const period = '2026-07';

      // 1. Fetch org score (already calculated)
      const { data: orgData, error: orgErr } = await supabase
        .from('department_scores')
        .select('*')
        .is('department_id', null)
        .eq('period', period)
        .maybeSingle();

      if (orgErr) throw orgErr;
      setOrgScore(orgData as DepartmentScore || null);

      // 2. Fetch weights
      const { data: wData } = await supabase
        .from('esg_config')
        .select('*')
        .limit(1);

      if (wData && wData.length > 0) {
        setWeights(wData[0]);
      } else {
        setWeights({
          org_name: 'EcoSphere Corp',
          environmental_weight: 40,
          social_weight: 30,
          governance_weight: 30,
          evidence_required: true
        });
      }

      // 3. Fetch department breakdowns
      const { data: deptData, error: deptErr } = await supabase
        .from('department_scores')
        .select(`*, departments:department_id(name)`)
        .eq('period', period)
        .not('department_id', 'is', null);

      if (deptErr) throw deptErr;

      const mappedDepts = (deptData || []).map((item: any) => ({
        ...item,
        department_name: item.departments?.name || 'Unknown Department'
      }));
      setDepartmentScores(mappedDepts);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load ESG scoring data.');
    } finally {
      setLoading(false);
    }
  };

  // Full recalculation — only triggered by button click
  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      toast.loading('Recalculating ESG scores...', { id: 'recalc' });
      await recalculateAllScores('2026-07');
      await loadData();
      toast.success('ESG scores recalculated!', { id: 'recalc' });
    } catch (err: any) {
      toast.error('Recalculation failed.', { id: 'recalc' });
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const askEsgCopilot = async () => {
    try {
      setCopilotLoading(true);
      setCopilotResponse(null);
      setIsCopilotOpen(true);

      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const prompt = `You are a corporate ESG Advisor.
Analyze the following score changes for our organization:
- Last Month Index (Baseline): Env: 72, Soc: 80, Gov: 75, Total: 75
- This Month Index: Env: ${envScore}, Soc: ${socScore}, Gov: ${govScore}, Total: ${totalScore}
- Active weights: Env: ${envW}%, Soc: ${socW}%, Gov: ${govW}%

Explain in 3 short, professional paragraphs:
1. Why the composite total score changed.
2. The specific driver (e.g. carbon log changes or compliance sign-offs).
3. Two actionable recommendations to improve scores next month.

Format in clean bullet points where appropriate. Use concise corporate language.`;

      let responseText = "";

      // Try Gemini first
      try {
        if (geminiKey?.trim()) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          if (res.ok) {
            const data = await res.json();
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          } else {
             throw new Error("Gemini API non-ok status: " + res.status);
          }
        } else {
          throw new Error("Gemini API key not found");
        }
      } catch (e: any) {
        console.warn("Gemini failed or not configured, falling back to Ollama...", e);
        try {
          const url = 'http://localhost:11434/api/generate';
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'qwen2.5:3b',
              prompt: prompt,
              stream: false
            }),
            signal: AbortSignal.timeout(120000) // 120s timeout
          });
          if (res.ok) {
            const data = await res.json();
            responseText = data.response || "";
          } else {
            console.warn("Ollama returned non-ok status:", res.status);
          }
        } catch (e2: any) {
          if (e2.name === 'TimeoutError') {
            responseText = "⚠️ Ollama timed out. Make sure `ollama serve` is running and `qwen2.5:3b` is pulled.";
          } else {
             console.warn("Ollama also failed:", e2);
          }
        }
      }

      setCopilotResponse(responseText || "⚠️ AI Copilot is offline. Make sure Ollama is running locally (`ollama serve`) and the qwen2.5:3b model is pulled (`ollama pull qwen2.5:3b`).");
    } catch (err: any) {
      console.error(err);
      setCopilotResponse("AI Copilot is currently offline. Please verify that your local Ollama server is running at localhost:11434.");
    } finally {
      setCopilotLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating organization ESG indexes..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const envScore = orgScore?.environmental_score || 0;
  const socScore = orgScore?.social_score || 0;
  const govScore = orgScore?.governance_score || 0;
  const totalScore = orgScore?.total_score || 0;

  const envW = weights?.environmental_weight || 40;
  const socW = weights?.social_weight || 30;
  const govW = weights?.governance_weight || 30;

  const getEsgGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', label: 'Leader', color: 'text-primary' };
    if (score >= 80) return { grade: 'A', label: 'Advanced', color: 'text-primary' };
    if (score >= 70) return { grade: 'B', label: 'Robust', color: 'text-governance' };
    if (score >= 50) return { grade: 'C', label: 'Average', color: 'text-[#e8590c]' };
    return { grade: 'D', label: 'Underperforming', color: 'text-danger' };
  };

  const { grade, label, color: gradeColor } = getEsgGrade(totalScore);

  const donutData = [
    { name: 'Environmental', value: envScore, weight: envW, color: '#2f9e44', key: 'env' },
    { name: 'Social', value: socScore, weight: socW, color: '#1971c2', key: 'soc' },
    { name: 'Governance', value: govScore, weight: govW, color: '#6741d9', key: 'gov' }
  ];

  const handleSegmentClick = (data: any) => {
    if (data && data.key) {
      setSelectedPillar(data.key);
      toast.success(`Focused detail panel on ${data.name} Pillar.`);
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold: **text**
      const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Bullet points: lines starting with - or *
      const isBullet = /^\s*[-*]\s/.test(line);
      const content = boldParsed.replace(/^\s*[-*]\s/, '');
      if (isBullet) {
        return <li key={i} className="ml-4 text-text-secondary" dangerouslySetInnerHTML={{ __html: content }} />;
      }
      if (line.trim() === '') return <br key={i} />;
      // Heading: lines starting with ###
      if (/^###\s/.test(line)) {
        return <p key={i} className="font-black text-text-primary mt-3 mb-1" dangerouslySetInnerHTML={{ __html: boldParsed.replace(/^###\s/, '') }} />;
      }
      return <p key={i} className="text-text-secondary" dangerouslySetInnerHTML={{ __html: boldParsed }} />;
    });
  };

  return (
    <div className="space-y-6">

      {/* Upper overview bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-left">
        <div>
          <h2 className="text-2xl font-black text-text-primary m-0 tracking-tight flex items-center space-x-2">
            <span className="text-primary"><Scale className="h-6 w-6" /></span>
            <span>Corporate ESG Control Center</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">Real-time aggregate performance index of Environmental, Social, and Governance pillars.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={askEsgCopilot}
            className="inline-flex items-center space-x-2 bg-[#6741d9] hover:bg-[#522eb0] text-white font-bold py-2 px-4 rounded-lg shadow-md active:scale-95 transition-all text-xs"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>ESG Copilot</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-border bg-base text-xs font-bold text-text-secondary hover:text-text-primary rounded-lg active:scale-95 transition-all shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalculating...' : 'Recalculate Index'}</span>
          </button>
        </div>
      </div>

      {/* Main centerpiece split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols: Centerpiece Donut Gauge */}
        <div className="lg:col-span-2">
          <Card
            title="Composite ESG Donut Gauge"
            subtitle="Click on segments (Env, Soc, Gov) to inspect weighted indexes."
            accent="primary"
          >
            <div className="flex flex-col md:flex-row items-center justify-around py-6">

              {/* Donut graphic */}
              <div className="h-64 w-64 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      onClick={handleSegmentClick}
                      className="cursor-pointer"
                    >
                      {donutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={selectedPillar === 'total' || selectedPillar === entry.key ? 1 : 0.4}
                          stroke={selectedPillar === entry.key ? '#fff' : 'none'}
                          strokeWidth={selectedPillar === entry.key ? 3 : 0}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Score indicators in center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center select-none">
                  <span className={`text-4xl font-black ${gradeColor}`}>{totalScore}</span>
                  <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary/50 mt-1">Grade {grade}</p>
                  <p className="text-[9px] font-bold text-text-secondary opacity-80 mt-0.5">{label}</p>
                </div>
              </div>

              {/* Legends & Details list */}
              <div className="space-y-4 md:w-72 mt-6 md:mt-0 text-left">
                <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">ESG Weights Formula</h4>

                <div className="space-y-3">
                  {donutData.map((item) => (
                    <div
                      key={item.key}
                      onClick={() => setSelectedPillar(item.key as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPillar === item.key
                          ? 'border-border bg-surface'
                          : 'border-transparent hover:bg-surface/50'
                        }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <div>
                          <p className="font-bold text-xs text-text-primary leading-none">{item.name}</p>
                          <p className="text-[10px] text-text-secondary mt-1">Weight: {item.weight}%</p>
                        </div>
                      </div>
                      <span className="font-black text-sm text-text-primary">{item.value}/100</span>
                    </div>
                  ))}

                  {/* Reset view */}
                  {selectedPillar !== 'total' && (
                    <button
                      onClick={() => setSelectedPillar('total')}
                      className="text-xs text-governance font-bold hover:underline"
                    >
                      Clear Pillar Filter
                    </button>
                  )}
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right 1 col: Dynamic inspector card */}
        <div>
          <Card
            title={selectedPillar === 'total' ? 'Organization Summary' : `${selectedPillar === 'env' ? 'Environmental' : selectedPillar === 'soc' ? 'Social' : 'Governance'} Inspection`}
            subtitle="Details and formula aggregates."
            accent={selectedPillar === 'env' ? 'primary' : selectedPillar === 'soc' ? 'secondary' : selectedPillar === 'gov' ? 'gamification' : undefined}
          >
            {selectedPillar === 'total' && (
              <div className="space-y-6 text-xs text-left leading-relaxed">
                <div className="bg-surface/40 p-3 rounded-lg border border-border">
                  <p className="font-bold text-text-primary mb-2">Calculation Formula:</p>
                  <div className="flex items-center text-sm font-medium text-text-secondary">
                    <span className="mr-2">Score =</span>
                    <div className="flex flex-col items-center">
                      <span className="border-b border-text-secondary/50 px-2 pb-0.5">
                        Env &times; {envW} + Soc &times; {socW} + Gov &times; {govW}
                      </span>
                      <span className="pt-0.5">100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-text-secondary font-medium">Environmental Score</span>
                    <span className="font-black text-primary">{envScore}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-text-secondary font-medium">Social Score</span>
                    <span className="font-black text-governance">{socScore}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-text-secondary font-medium">Governance Score</span>
                    <span className="font-black text-[#6741d9]">{govScore}</span>
                  </div>
                  <div className="flex justify-between font-black text-text-primary text-sm pt-2">
                    <span>Composite Total</span>
                    <span>{totalScore}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl text-[10px] text-primary flex items-start space-x-2 font-semibold">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span>Your company's ESG score ranks as <strong>{label}</strong>. Click any segment on the chart to inspect ways to improve your scores.</span>
                </div>
              </div>
            )}

            {/* Environmental Inspector */}
            {selectedPillar === 'env' && (
              <div className="space-y-5 text-xs text-left">
                <div className="bg-[#2f9e44]/5 p-3.5 rounded-xl border border-[#2f9e44]/15 flex items-start space-x-2">
                  <Leaf className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h5 className="font-bold text-text-primary">Environmental Pillar</h5>
                    <p className="text-text-secondary text-[11px] mt-1 leading-relaxed">
                      Determined by carbon transaction logs (Scope 1, 2, and 3 activities) against target goals.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-text-secondary uppercase text-[10px] tracking-wider">How to improve:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-text-secondary">
                    <li>Log electricity usage, fuel and travel receipts in the <Link to="/environmental/transactions" className="text-primary hover:underline font-bold">Ledger</Link>.</li>
                    <li>Define active reduction goals under <Link to="/environmental/goals" className="text-primary hover:underline font-bold">Goals</Link>.</li>
                    <li>Optimize emission multiplier profiles.</li>
                  </ul>
                </div>

                <Link
                  to="/environmental/dashboard"
                  className="w-full mt-4 inline-flex items-center justify-between py-2 px-3 bg-[#2f9e44]/10 hover:bg-[#2f9e44]/15 text-primary border border-transparent rounded-lg font-bold text-xs transition-all active:scale-[0.98]"
                >
                  <span>Environmental Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Social Inspector */}
            {selectedPillar === 'soc' && (
              <div className="space-y-5 text-xs text-left">
                <div className="bg-[#1971c2]/5 p-3.5 rounded-xl border border-[#1971c2]/15 flex items-start space-x-2">
                  <Heart className="h-5 w-5 text-governance shrink-0" />
                  <div>
                    <h5 className="font-bold text-text-primary">Social Pillar</h5>
                    <p className="text-text-secondary text-[11px] mt-1 leading-relaxed">
                      Aggregated from employee sustainability challenge completions, CSR participations, and volunteering hours.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-text-secondary uppercase text-[10px] tracking-wider">How to improve:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-text-secondary">
                    <li>Have employees join and submit proof for active <Link to="/gamification/challenges" className="text-governance hover:underline font-bold">Sustainability Challenges</Link>.</li>
                    <li>Promote volunteering programs and CSR events.</li>
                    <li>Redeem rewards to boost team gamification engagement.</li>
                  </ul>
                </div>

                <Link
                  to="/gamification/leaderboards"
                  className="w-full mt-4 inline-flex items-center justify-between py-2 px-3 bg-[#1971c2]/10 hover:bg-[#1971c2]/15 text-governance border border-transparent rounded-lg font-bold text-xs transition-all active:scale-[0.98]"
                >
                  <span>Gamification Standings</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Governance Inspector */}
            {selectedPillar === 'gov' && (
              <div className="space-y-5 text-xs text-left">
                <div className="bg-[#6741d9]/5 p-3.5 rounded-xl border border-[#6741d9]/15 flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-[#6741d9] shrink-0" />
                  <div>
                    <h5 className="font-bold text-text-primary">Governance Pillar</h5>
                    <p className="text-text-secondary text-[11px] mt-1 leading-relaxed">
                      Evaluates corporate policy publication metrics and total employee acknowledgement ratios.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-text-secondary uppercase text-[10px] tracking-wider">How to improve:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-text-secondary">
                    <li>Publish and disseminate compliance policies under Governance routes.</li>
                    <li>Track policy sign-off rates per department.</li>
                    <li>Enforce evidence audits.</li>
                  </ul>
                </div>

                <div className="p-3 bg-base border border-border rounded-lg text-text-secondary text-[11px]">
                  <strong>Current sign-off rate:</strong> {govScore}% of published policies signed.
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Benchmarks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Department Rankings */}
        <Card title="Department Leaderboard" subtitle="Benchmarking aggregate scores per department.">
          {departmentScores.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-secondary/50">
              No department score audits recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {departmentScores.slice(0, 4).map((dept, idx) => (
                <div key={dept.id} className="flex items-center justify-between border-b border-border/40 pb-2.5 last:border-0 last:pb-0 text-left text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-black text-text-secondary/50 w-4">#{idx + 1}</span>
                    <span className="font-bold text-text-primary">{dept.department_name}</span>
                  </div>
                  <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                    {dept.total_score} ESG
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dynamic Tips & Recommendations */}
        <Card title="ESG Improvement Insights" subtitle="AI recommendations to optimize your corporate footprint.">
          <div className="space-y-4 text-xs text-left leading-relaxed">
            <div className="p-3 rounded-lg bg-surface/50 border border-border flex items-start space-x-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="font-bold text-text-primary">Scope 2 Reduction Plan</p>
                <p className="text-text-secondary text-[11px] mt-0.5">Electricity accounts for 45% of emissions. Target a 10% reduction by promoting the 'Turn off screen' active challenge.</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-surface/50 border border-border flex items-start space-x-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="font-bold text-text-primary">Policy Sign-off Lag</p>
                <p className="text-text-secondary text-[11px] mt-0.5">Governance scores are capped due to incomplete acknowledgements on the 'Anti-Bribery Policy'. Send department-wide sign reminders.</p>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* ESG Advisor Copilot Slideover Modal */}
      {isCopilotOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in">
          <div className="bg-base border-l border-border h-full w-full max-w-md shadow-2xl flex flex-col justify-between animate-slide-in">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-[#6741d9] animate-pulse" />
                <span>ESG Advisor Copilot</span>
              </h3>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs text-left">

              {/* Question bubble */}
              <div className="flex items-start space-x-2.5 justify-end">
                <div className="bg-primary/10 text-primary border border-primary/10 p-3 rounded-xl max-w-xs font-semibold leading-relaxed">
                  Why did our ESG score change? Explain the drivers and suggest improvements.
                </div>
              </div>

              {/* AI Answer Bubble */}
              <div className="flex items-start space-x-2.5">
                <div className="h-8 w-8 bg-[#6741d9]/10 rounded-full flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-surface border border-border p-4 rounded-xl max-w-[320px] leading-relaxed space-y-3 font-medium">
                  {copilotLoading ? (
                    <div className="flex items-center space-x-2 py-4">
                      <div className="h-2 w-2 bg-[#6741d9] rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-[#6741d9] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 bg-[#6741d9] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      <span className="text-[10px] text-text-secondary/60 uppercase font-black ml-1.5">Analyzing indicators...</span>
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed space-y-1">
                      <ul className="list-disc space-y-1">
                        {renderMarkdown(copilotResponse || '')}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surface/20 flex items-center space-x-3">
              <button
                onClick={askEsgCopilot}
                disabled={copilotLoading}
                className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 bg-[#6741d9] hover:bg-[#522eb0] text-white border border-transparent font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
              >
                <MessageSquareQuote className="h-4 w-4" />
                <span>Re-Analyze Scores</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default DashboardPage;
