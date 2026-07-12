import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Atom, 
  Trophy, 
  FileSearch, 
  ArrowRight, 
  Mail, 
  MapPin, 
  Globe
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export const AboutPage: React.FC = () => {
  const values = [
    {
      title: "Radical Transparency",
      desc: "Every data point in the carbon ledger, policy sign-off, or reward claim should be verifiable and traced back to its origin.",
      icon: <ShieldCheck className="h-6 w-6 text-[#10b981]" />
    },
    {
      title: "Scientific Rigor",
      desc: "We align our emission calculations with globally accepted frameworks like the GHG Protocol, EPA, and DEFRA factors.",
      icon: <Atom className="h-6 w-6 text-[#1971c2]" />
    },
    {
      title: "Gamified Engagement",
      desc: "Real change happens when everyone participates. We turn boring corporate mandates into fun, rewarding challenges.",
      icon: <Trophy className="h-6 w-6 text-[#6741d9]" />
    },
    {
      title: "Continuous Auditing",
      desc: "Sustainability is not a static audit report. We monitor corporate compliance in real-time, 365 days a year.",
      icon: <FileSearch className="h-6 w-6 text-[#8b5cf6]" />
    }
  ];

  const team = [
    {
      name: "Vitthal Gund",
      role: "Lead Full-Stack Developer",
      bio: "Software Engineer specializing in full-stack architecture, React engines, and database systems integration.",
      github: "VitthalGund",
      initials: "VG"
    },
    {
      name: "Abhishek Pandey",
      role: "Systems Architect & Developer",
      bio: "Backend developer focused on scalable relational schemas, security policies, and analytics workflows.",
      github: "Abhishek3102",
      initials: "AP"
    }
  ];

  return (
    <div className="min-h-screen bg-[#060e20] text-slate-100 font-sans selection:bg-[#10b981]/30 selection:text-[#4edea3] overflow-x-hidden">
      
      {/* Background radial highlights */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#6741d9]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <nav className="border-b border-white/5 bg-[#060e20]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90">
            <img src={logoImg} alt="EcoSphere Logo" className="h-8 w-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-white font-mono">
              EcoSphere
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/#features" className="hover:text-white transition-colors">Features</Link>
            <span className="text-white">About Us</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#057a55] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 active:scale-95 transition-all"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Mission / Header Section */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <span className="text-xs font-black uppercase text-[#10b981] tracking-widest bg-[#10b981]/15 px-3 py-1 rounded">
          Our Mission
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Merging corporate carbon bookkeeping with daily employee action.
        </h1>
        <p className="text-sm md:text-base text-slate-400 leading-relaxed">
          We believe the path to carbon neutrality cannot reside solely in spreadsheet reports generated once a year. EcoSphere was built to democratize ESG compliance, making daily carbon logging, policy reading, and community challenges a natural, gamified part of every employee's workday.
        </p>
      </header>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">Our Core Values</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">The principles driving every feature and algorithm inside the EcoSphere platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v, idx) => (
            <div 
              key={idx}
              className="bg-[#0f172a]/30 border border-white/10 p-6 rounded-2xl flex items-start space-x-4 hover:border-slate-700 transition-colors text-left"
            >
              <span className="p-3 bg-white/5 border border-white/10 rounded-xl shrink-0">
                {v.icon}
              </span>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-white text-base">{v.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 space-y-16 bg-[#0b1326]/30">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight">The EcoSphere Team</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Built by a remote-first team of climate scientists, designers, and behavioral engineers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((t, idx) => (
            <div 
              key={idx}
              className="bg-[#0f172a]/50 border border-white/10 p-6 rounded-2xl space-y-4 text-left hover:border-[#10b981]/30 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#6741d9] flex items-center justify-center text-white font-black text-xl shadow-md">
                    {t.initials}
                  </div>
                  <a 
                    href={`https://github.com/${t.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95"
                    title="View GitHub Profile"
                  >
                    <GithubIcon className="h-5 w-5" />
                  </a>
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-white text-lg leading-none">{t.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-[#10b981] tracking-wider">{t.role}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{t.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Commitments & Sustainability */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <span className="text-xs font-black uppercase text-[#6741d9] tracking-widest bg-[#6741d9]/15 px-3 py-1 rounded">
              Our Commitments
            </span>
            <h2 className="text-3xl font-black text-white leading-tight">
              Leading by example with carbon neutral operations
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We practice what we preach. EcoSphere is certified carbon neutral. We measure our entire server hosting footprint, remote employees' household power usages, and business travels. Every kg of CO₂e emitted by our operations is doubly offset through gold-standard certified forestry and renewable energy programs.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <Globe className="h-5 w-5 text-[#10b981]" />
                <span>100% Green Server Hosting</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                <MapPin className="h-5 w-5 text-[#1971c2]" />
                <span>Remote-first Carbon Offset</span>
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-8 bg-[#0f172a]/60 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/10 rounded-full blur-xl" />
            <h4 className="font-extrabold text-sm text-white">Join Our Journey</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We're always looking for climate-focused developers, designers, and scientists who want to build the future of corporate responsibility.
            </p>
            <a 
              href="mailto:careers@ecosphere.com"
              className="inline-flex items-center justify-center space-x-2 text-xs font-bold text-[#10b981] hover:underline"
            >
              <span>Email careers@ecosphere.com</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer Block */}
      <footer className="border-t border-white/5 bg-[#030712] py-16">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center space-x-3">
            <img src={logoImg} alt="EcoSphere Logo" className="h-6 w-6 object-contain" />
            <span className="text-base font-black tracking-tight text-white font-mono">
              EcoSphere
            </span>
          </div>
          
          <div className="pt-6 border-t border-white/5 text-[10px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} EcoSphere Corp. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/" className="hover:text-slate-400 transition-colors">Home</Link>
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
