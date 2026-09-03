import React, { useState, useEffect } from 'react';
import { Cookie, Sliders } from 'lucide-react';
import { getCookiePreferences, saveCookiePreferences } from '../services/security';

interface CookieBannerProps {
  onOpenPrivacyModal?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsOpt, setAnalyticsOpt] = useState(false);
  const [functionalOpt, setFunctionalOpt] = useState(true);

  useEffect(() => {
    const current = getCookiePreferences();
    setShowBanner(!current.consentGiven);
    setAnalyticsOpt(current.analytics);
    setFunctionalOpt(current.functional);
  }, []);

  const handleAcceptAll = () => {
    saveCookiePreferences({ essential: true, analytics: true, functional: true });
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    saveCookiePreferences({ essential: true, analytics: false, functional: false });
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences({ essential: true, analytics: analyticsOpt, functional: functionalOpt });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-2xl bg-zinc-100 text-zinc-900 shrink-0 border border-zinc-200">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 tracking-tight">
            Privacy & Cookie Preferences
          </h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Meeting Ghost stores encrypted meeting notes locally on your device. We use strictly zero tracking cookies.
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <div className="font-bold text-zinc-900">Essential Vault Storage</div>
              <div className="text-[11px] text-zinc-500">IndexedDB AES-GCM Encrypted Notes</div>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Required</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <div className="font-bold text-zinc-900">Functional Preferences</div>
              <div className="text-[11px] text-zinc-500">Audio filter & template presets</div>
            </div>
            <input
              type="checkbox"
              checked={functionalOpt}
              onChange={(e) => setFunctionalOpt(e.target.checked)}
              className="accent-zinc-900 cursor-pointer w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div>
              <div className="font-bold text-zinc-900">Anonymous Diagnostics</div>
              <div className="text-[11px] text-zinc-500">WebGPU / WASM performance logs</div>
            </div>
            <input
              type="checkbox"
              checked={analyticsOpt}
              onChange={(e) => setAnalyticsOpt(e.target.checked)}
              className="accent-zinc-900 cursor-pointer w-4 h-4"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {showDetails ? (
          <button
            onClick={handleSaveCustom}
            className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        ) : (
          <>
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Accept All
            </button>
            <button
              onClick={handleAcceptEssential}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              title="Customize"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
