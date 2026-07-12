import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Heart, 
  Shield, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { PublicNavBar } from '../components/PublicNavBar';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is an ESG Score and how is it calculated?",
      a: "An ESG (Environmental, Social, Governance) score measures a company's collective performance on sustainability and ethical issues. EcoSphere calculates this in real-time by combining weighted factors: Environmental emissions (carbon logging), Social indicators (sustainability challenges & CSR volunteering), and Governance metrics (compliance policy sign-offs)."
    },
    {
      q: "How does the AI Emission Classifier work?",
      a: "Our built-in AI classifier leverages Google Gemini (with local Ollama offline fallbacks) to read raw text invoices, utility bills, or fuel receipts. It automatically categorizes the emission source, extracts the quantity, matches it to standard emission factor databases, and logs the calculated CO₂e directly to your carbon ledger."
    },
    {
      q: "Can we customize the ESG pillar weights?",
      a: "Yes! Administrators can configure the exact percentage weights for Environmental, Social, and Governance pillars via the Settings dashboard to align with industry standards or specific compliance frameworks."
    },
    {
      q: "How do employees earn XP and rewards?",
      a: "Employees enroll in sustainability challenges (e.g. 'Green Commute', 'Zero Paper Day') and submit verification notes. Once approved by managers, employees are awarded XP and points which can be redeemed in the Eco-Store for physical or impact rewards (like planting trees)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#060e20] text-slate-100 font-sans selection:bg-[#10b981]/30 selection:text-[#4edea3] overflow-x-hidden">
      
      {/* Background radial highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#6741d9]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <PublicNavBar />

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 relative">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-[#4edea3] tracking-wide">
          <Sparkles className="h-4 w-4 text-[#4edea3]" />
          <span>Real-time Enterprise ESG Scorecard</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
          ESG data, employee action, & <span className="bg-gradient-to-r from-[#4edea3] to-[#8b5cf6] bg-clip-text text-transparent">gamified engagement</span> — in one system of record.
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          EcoSphere turns corporate carbon accounting and CSR initiatives into a real-time, explainable dashboard that connects employee daily actions directly to company-wide compliance index goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#10b981] to-[#057a55] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[#10b981]/25 hover:shadow-xl hover:shadow-[#10b981]/30 active:scale-[0.98] transition-all text-sm"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a 
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-xl transition-all text-sm"
          >
            Explore Platform
          </a>
        </div>

        {/* Visual Mockup Frame */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-white/10 bg-[#0f172a]/60 backdrop-blur-md p-4 shadow-2xl shadow-black/80">
            {/* Window bar */}
            <div className="flex items-center space-x-2 pb-4 border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-[10px] text-slate-500 font-mono pl-4">app.ecosphere.com/dashboard</span>
            </div>
            
            {/* Visual Gauge Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 px-4 text-left">
              <div className="md:col-span-2 space-y-6">
                <div className="h-10 w-48 bg-white/5 rounded-lg border border-white/5 animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-28 bg-gradient-to-br from-[#10b981]/5 to-transparent border border-[#10b981]/10 rounded-xl p-4 space-y-3">
                    <Leaf className="h-5 w-5 text-[#10b981]" />
                    <span className="block text-2xl font-black">84</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Environmental</span>
                  </div>
                  <div className="h-28 bg-gradient-to-br from-[#1971c2]/5 to-transparent border border-[#1971c2]/10 rounded-xl p-4 space-y-3">
                    <Heart className="h-5 w-5 text-[#1971c2]" />
                    <span className="block text-2xl font-black">78</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Social Index</span>
                  </div>
                  <div className="h-28 bg-gradient-to-br from-[#6741d9]/5 to-transparent border border-[#6741d9]/10 rounded-xl p-4 space-y-3">
                    <Shield className="h-5 w-5 text-[#6741d9]" />
                    <span className="block text-2xl font-black">90</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Governance</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#0b1326] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-56">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Index Score</span>
                  <p className="text-4xl font-black text-white">84 / 100</p>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] w-[84%] rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest">Level 1 - advanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 space-y-16 border-t border-white/5">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Enterprise Pillars & Automation</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Seamless tracking and team gamification modules to achieve your sustainability goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0f172a]/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between h-64 text-left hover:border-[#10b981]/40 transition-colors">
            <div className="space-y-4">
              <span className="h-10 w-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center text-primary border border-[#10b981]/25">
                <Leaf className="h-5 w-5 text-[#10b981]" />
              </span>
              <h3 className="font-extrabold text-base text-white">Carbon Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log Scope 1, 2, and 3 emissions against real factors. Maintain a verified audit ledger automatically.
              </p>
            </div>
            <span className="text-[10px] uppercase font-black text-[#10b981] tracking-wider">Environmental</span>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0f172a]/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between h-64 text-left hover:border-[#1971c2]/40 transition-colors">
            <div className="space-y-4">
              <span className="h-10 w-10 bg-[#1971c2]/10 rounded-xl flex items-center justify-center text-governance border border-[#1971c2]/25">
                <Heart className="h-5 w-5 text-[#1971c2]" />
              </span>
              <h3 className="font-extrabold text-base text-white">Employee Challenges</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engage teams with gamified commute, waste, and energy challenges. Reward green actions.
              </p>
            </div>
            <span className="text-[10px] uppercase font-black text-[#1971c2] tracking-wider">Social Pillar</span>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0f172a]/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between h-64 text-left hover:border-[#6741d9]/40 transition-colors">
            <div className="space-y-4">
              <span className="h-10 w-10 bg-[#6741d9]/10 rounded-xl flex items-center justify-center text-[#6741d9] border border-[#6741d9]/25">
                <Shield className="h-5 w-5 text-[#6741d9]" />
              </span>
              <h3 className="font-extrabold text-base text-white">Compliance Policies</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automate ESG disclosures and capture employee sign-offs for whistleblower, ethics, and sustainability codes.
              </p>
            </div>
            <span className="text-[10px] uppercase font-black text-[#6741d9] tracking-wider">Governance</span>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0f172a]/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between h-64 text-left hover:border-[#8b5cf6]/40 transition-colors">
            <div className="space-y-4">
              <span className="h-10 w-10 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center text-[#a78bfa] border border-[#8b5cf6]/25">
                <BrainCircuit className="h-5 w-5 text-[#a78bfa]" />
              </span>
              <h3 className="font-extrabold text-base text-white">AI Classifier</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan billing invoices using Google Gemini and Ollama fallback integrations. Classify CO₂e values instantly.
              </p>
            </div>
            <span className="text-[10px] uppercase font-black text-[#a78bfa] tracking-wider">AI Intelligence</span>
          </div>
        </div>
      </section>

      {/* Solutions / How it Works Section */}
      <section id="solutions" className="max-w-7xl mx-auto px-6 py-20 bg-[#0b1326]/50 border-t border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <span className="text-xs font-black uppercase text-[#10b981] tracking-widest bg-[#10b981]/15 px-3 py-1 rounded">
              Solutions Workflow
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              A single dashboard connecting daily actions to board-level reporting
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Managing corporate sustainability index is no longer just about yearly audits. EcoSphere provides a continuous, audited ESG ledger that updates dynamically as factors are recorded or employee volunteer programs approve logs.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  <strong>Audited Carbon Accounting:</strong> Standard EPA/DEFRA calculations automated.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  <strong>Active Gamified Incentives:</strong> Redeem XP for real tree plantations.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                  <strong>Boardroom Compliance:</strong> Export verified policy compliance ledgers.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981]/10 to-[#6741d9]/10 rounded-2xl blur-xl" />
            <div className="relative border border-white/10 rounded-2xl p-6 bg-[#0f172a]/70 space-y-4 shadow-xl">
              <h4 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-[#4edea3]" />
                <span>AI Assist Invoice Parsing</span>
              </h4>
              <div className="bg-[#0b1326] border border-white/5 p-4 rounded-lg text-[11px] font-mono text-slate-300 leading-relaxed">
                "We consumed 15,000 kWh of grid electricity in our HQ this month. Total billing amount was $3,200."
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase">AI Classified Result</span>
                <span className="text-[10px] text-[#10b981] font-black uppercase bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/15">
                  98% Match
                </span>
              </div>
              <div className="bg-[#060e20] p-3 rounded border border-white/5 text-[10px] space-y-1.5">
                <p className="text-slate-300 font-semibold">Matched Factor: Grid Electricity (Scope 2)</p>
                <p className="text-slate-400">Amount: 15,000 kWh × 0.45 = <strong>6,750 kg CO₂e</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Trusted by ESG Champions</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Hear how sustainability directors use EcoSphere to build green cultures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0f172a]/30 border border-white/5 p-6 rounded-2xl space-y-4 text-left">
            <MessageSquare className="h-6 w-6 text-[#10b981]" />
            <p className="text-xs text-slate-300 leading-relaxed">
              "Before EcoSphere, gathering Scope 3 employee commute data took months of surveys. Now, our employees log it as a weekly gamified challenge, and it rolls up directly to our carbon accounting."
            </p>
            <div className="border-t border-white/5 pt-4 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                SM
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500">Director of Sustainability, LogiCorp</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a]/30 border border-white/5 p-6 rounded-2xl space-y-4 text-left">
            <MessageSquare className="h-6 w-6 text-[#1971c2]" />
            <p className="text-xs text-slate-300 leading-relaxed">
              "The AI Classifier is a life-saver. We drop in our utility invoice text, it parses the kWh metrics, and logs them instantly. The local Ollama offline backup means we can keep working during travel."
            </p>
            <div className="border-t border-white/5 pt-4 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                MK
              </div>
              <div>
                <p className="text-xs font-bold text-white">Michael K.</p>
                <p className="text-[10px] text-slate-500">Operations Manager, CleanEnergy</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a]/30 border border-white/5 p-6 rounded-2xl space-y-4 text-left">
            <MessageSquare className="h-6 w-6 text-[#6741d9]" />
            <p className="text-xs text-slate-300 leading-relaxed">
              "Having a single score gauge centerpiece that we can segment-click on has changed our boardroom meetings. We can drill down into the Anti-Bribery policy sign-offs and explain ESG grades instantly."
            </p>
            <div className="border-t border-white/5 pt-4 flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                DL
              </div>
              <div>
                <p className="text-xs font-bold text-white">Diana Lee</p>
                <p className="text-[10px] text-slate-500">Chief Compliance Officer, TechFlow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faqs" className="max-w-3xl mx-auto px-6 py-20 space-y-12 border-t border-white/5">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about the EcoSphere platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-[#0f172a]/40 border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-[#10b981]" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-[#0b1326]/30 text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Block */}
      <footer className="border-t border-white/5 bg-[#030712] py-16">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <h3 className="text-3xl font-black text-white tracking-tight">
            Ready to track, gamify, and report your ESG?
          </h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
            Join sustainability leaders who are turning passive compliance targets into active employee participation.
          </p>
          <div className="pt-2">
            <Link 
              to="/login"
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#10b981] to-[#057a55] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#10b981]/20 active:scale-95 transition-all text-xs uppercase tracking-wider"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="pt-10 border-t border-white/5 text-[10px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} EcoSphere Corp. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/about" className="hover:text-slate-400 transition-colors">About Us</Link>
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
