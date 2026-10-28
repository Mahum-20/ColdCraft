import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExecutiveFinder from './components/ExecutiveFinder';
import InputForm from './components/InputForm';
import EmailDiscovery from './components/EmailDiscovery';
import PitchStudio from './components/PitchStudio';
import EmailPreviewModal from './components/EmailPreviewModal';
import SettingsModal from './components/SettingsModal';
import { verifyEmailAddress, generatePitches } from './utils/api';

const DEMO_DATA = {
  ctoName: 'Alex Rivera',
  companyName: 'ScaleFlow',
  domain: 'scaleflow.io',
  linkedinUrl: 'https://linkedin.com/in/alex-rivera-cto',
  jobSnippet: "We're scaling our data pipelines and struggling with Celery queues backing up during peak traffic hours. Looking for a Python/Django engineer to optimize our PostgreSQL queries.",
  senderName: 'Mahum',
  senderTitle: 'Senior Backend Engineer',
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
    fetch('/api/health')
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

  const handleSelectExecutive = (execData) => {
    let cleanDom = execData.domain || formData.domain || '';
    cleanDom = cleanDom.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];

    setFormData((prev) => ({
      ...prev,
      ctoName: execData.ctoName,
      companyName: execData.companyName || prev.companyName,
      domain: cleanDom || prev.domain,
      linkedinUrl: execData.linkedinUrl || prev.linkedinUrl
    }));
  };

  const handleRunEmailFinder = async () => {
    setErrorMessage(null);
    if (!formData.domain || !formData.ctoName) {
      setErrorMessage("Please enter target officer name and company domain.");
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
      setErrorMessage(err.message || "Failed to complete email discovery.");
    } finally {
      setIsLoadingDiscovery(false);
    }
  };

  const handleGeneratePitches = async () => {
    setErrorMessage(null);
    if (!formData.jobSnippet) {
      setErrorMessage("Please enter a job description snippet or technical pain point.");
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
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-[#1c1917]">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onLoadDemo={handleLoadDemo}
        isBackendLive={isBackendLive}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-5">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-[#f5f4ef] border border-[#d6d3d1] flex items-center justify-between text-xs text-[#1c1917]">
            <span>Error: {errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="font-mono text-xs text-[#78716c] hover:text-[#1c1917] px-1"
            >
              [Dismiss]
            </button>
          </div>
        )}

        {/* Section Context Strip */}
        <div className="p-4 bg-white border border-[#e7e5e4] flex flex-col md:flex-row md:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-serif font-bold text-[#1c1917]">
              Technical Outreach & Intelligence Workbook
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              Structured four-part research workflow: Personnel indexing, parameter mapping, MX handshake validation, and customized engineering memorandums.
            </p>
          </div>

          <div className="font-mono text-[11px] text-[#78716c] self-start md:self-baseline shrink-0">
            Protocol: RFC 5321 SMTP / Direct Mail Handshake
          </div>
        </div>

        {/* 2-Column Workbook Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Personnel Directory & Parameters */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section I: Personnel Directory */}
            <ExecutiveFinder
              companyName={formData.companyName}
              domain={formData.domain}
              geminiApiKey={geminiApiKey}
              onSelectExecutive={handleSelectExecutive}
            />

            {/* Section II: Target Form */}
            <InputForm
              formData={formData}
              setFormData={setFormData}
              onRunEmailFinder={handleRunEmailFinder}
              onGeneratePitches={handleGeneratePitches}
              isLoadingDiscovery={isLoadingDiscovery}
              isLoadingPitch={isLoadingPitch}
            />
          </div>

          {/* Right Column: Address Matrix & Pitch Studio */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section III: Email Discovery */}
            <EmailDiscovery
              discoveryData={discoveryData}
              selectedEmail={selectedEmail}
              onSelectEmail={(email) => setSelectedEmail(email)}
            />

            {/* Section IV: Pitch Studio */}
            <PitchStudio
              pitchData={pitchData}
              targetEmail={selectedEmail}
              onPreviewEmail={handleOpenPreview}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e7e5e4] py-4 px-4 text-center text-xs font-mono text-[#78716c]">
        <p>ColdCraft: Technical Outreach Platform and Personnel Directory</p>
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
