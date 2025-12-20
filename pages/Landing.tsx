import React from 'react';
import { ArrowRight, CheckCircle, Smartphone, Shield, Users } from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header - Clean Version */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="text-2xl font-heading font-bold text-primary-600 flex items-center gap-2">
            <Users className="w-8 h-8" />
            SCMS
          </div>
          {/* Removed Login button from here per request */}
          <div className="hidden sm:block text-slate-500 font-medium text-sm italic">
            Secure Academic Administration
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-6 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Enterprise Classroom Management
        </div>
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 tracking-tight mb-8">
          Smart Classroom <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
            Command Center
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          The definitive platform for school administrators and educators to automate operations and drive student success.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onLoginClick}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-4 rounded-xl font-semibold shadow-xl shadow-primary-600/30 transition-transform hover:-translate-y-1"
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>
          <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg px-8 py-4 rounded-xl font-semibold transition-colors">
            View Platform Docs
          </button>
        </div>
        
        {/* Hero Image Mockup */}
        <div className="mt-16 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200" 
            alt="Dashboard Preview" 
            className="w-full h-auto object-cover opacity-90"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">Centralized Command</h2>
            <p className="text-lg text-slate-600">Purpose-built tools for every level of your institution.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-primary-600" />}
              title="Admin Command Center"
              desc="Full control over user access, system health, and institutional-wide announcements."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-emerald-600" />}
              title="Educator Portal"
              desc="Simplified tools for attendance marking, assignment creation, and performance tracking."
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-indigo-600" />}
              title="Student Suite"
              desc="Engaging gamified experience for assignment submissions and resource access."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2024 Smart Classroom Command. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
    <div className="mb-6 p-4 rounded-xl bg-white shadow-sm inline-block group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);