import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import EmailDiscovery from './components/EmailDiscovery';
import PitchStudio from './components/PitchStudio';
import EmailPreviewModal from './components/EmailPreviewModal';
import SettingsModal from './components/SettingsModal';
import { verifyEmailAddress, generatePitches } from './utils/api';
import { AlertCircle, Zap, ShieldCheck } from 'lucide-react';

const DEMO_DATA = {
  ctoName: 'Alex Rivera',
  companyName: 'ScaleFlow',
  domain: 'scaleflow.io',
  linkedinUrl: 'https://linkedin.com/in/cto-profile',
  jobSnippet: "We're scaling our data pipelines and struggling with Celery queues backing up during peak traffic hours. Looking for a Python/Django engineer to optimize our PostgreSQL queries.",
  senderName: 'Mahum',
  senderTitle: 'CS Gold Medalist & Senior Backend Engineer',
  senderSpecialty: 'high-throughput Django/Celery architectures & PostgreSQL optimization',
  availability: 'Available for up to 20 hours/week with zero onboarding lag'
};

export default function App() {
  const [formData, setFormData] = useState(DEMO_DATA);
  const [discoveryData, setDiscoveryData] = useState(null);
  const [pitchData, setPitchData] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState('alex.rivera@scaleflow.io');
  
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [isLoadingPitch, setIsLoadingPitch] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBackendLive, setIsBackendLive] = useState(true);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPreviewPitch, setCurrentPreviewPitch] = useState(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    fetch('/api/')
      .then((res) => res.json())
      .then(() => setIsBackendLive(true))
      .catch(() => setIsBackendLive(false));

    runInitialDemo();
  }, []);

  const runInitialDemo = async () => {
    try {
      setIsLoadingDiscovery(true);
      setIsLoadingPitch(true);
      
      const discRes = await verifyEmailAddress('Alex', 'Rivera', 'scaleflow.io').catch(() => null);
      if (discRes && discRes.data) {
        setDiscoveryData(discRes.data);
        if (discRes.data.best_match) {
          setSelectedEmail(discRes.data.best_match.email);
        }
      }

      const pitchRes = await generatePitches({
        ...DEMO_DATA,
        verifiedEmail: 'alex.rivera@scaleflow.io'
      }).catch(() => null);

      if (pitchRes) {
        setPitchData(pitchRes);
      }
    } finally {
      setIsLoadingDiscovery(false);
      setIsLoadingPitch(false);
    }
  };

  const handleRunEmailFinder = async () => {
    setErrorMessage(null);
    if (!formData.domain || !formData.ctoName) {
      setErrorMessage("Please enter CTO Name and Company Domain.");
      return;
    }

    setIsLoadingDiscovery(true);
    try {
      const nameParts = formData.ctoName.trim().split(' ');
      const firstName = nameParts[0] || 'cto';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const res = await verifyEmailAddress(firstName, lastName, formData.domain);
      if (res.success) {
        setDiscoveryData(res.data);
        if (res.data.best_match) {
          setSelectedEmail(res.data.best_match.email);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to verify email permutations.");
    } finally {
      setIsLoadingDiscovery(false);
    }
  };

  const handleGeneratePitches = async () => {
    setErrorMessage(null);
    if (!formData.jobSnippet) {
      setErrorMessage("Please enter a Job Snippet or pain point context.");
      return;
    }

    setIsLoadingPitch(true);
    try {
      const res = await generatePitches({
        ...formData,
        verifiedEmail: selectedEmail,
        geminiApiKey: geminiApiKey
      });
      if (res.success) {
        setPitchData(res);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to generate pitch variations.");
    } finally {
      setIsLoadingPitch(false);
    }
  };

  const handleLoadDemo = () => {
    setFormData(DEMO_DATA);
    runInitialDemo();
  };

  const handleOpenPreview = (pitch) => {
    setCurrentPreviewPitch(pitch);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onLoadDemo={handleLoadDemo}
        isBackendLive={isBackendLive}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-5">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-slate-700 font-bold text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Workflow Banner */}
        <div className="clean-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                3-Step Simple Flow
              </span>
              <h2 className="text-sm md:text-base font-bold text-slate-900">
                CTO Cold Email Permutations & Pitch Generator
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Auto-generate email candidates, verify mail servers, extract tech bottlenecks, and draft customized pitch emails.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-600 self-start md:self-center font-medium">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-indigo-600" /> Free MX Verification</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-600" /> 0 Paid APIs Required</span>
          </div>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <InputForm
              formData={formData}
              setFormData={setFormData}
              onRunEmailFinder={handleRunEmailFinder}
              onGeneratePitches={handleGeneratePitches}
              isLoadingDiscovery={isLoadingDiscovery}
              isLoadingPitch={isLoadingPitch}
            />
          </div>

          {/* Right Column: Outputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 2: Email Discovery */}
            <EmailDiscovery
              discoveryData={discoveryData}
              selectedEmail={selectedEmail}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />

            {/* Step 3: Pitch Studio */}
            <PitchStudio
              pitchData={pitchData}
              targetEmail={selectedEmail}
              onPreviewEmail={handleOpenPreview}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>ColdCraft AI — Simple Light Mode UI • Powered by FastAPI & Vite</p>
      </footer>

      {/* Modals */}
      <EmailPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pitch={currentPreviewPitch}
        targetEmail={selectedEmail}
        senderName={formData.senderName}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={geminiApiKey}
        setApiKey={setGeminiApiKey}
      />
    </div>
  );
}
