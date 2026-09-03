import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { getCurrentUser, resetMasterPin } from '../services/auth';
import { getCookiePreferences, saveCookiePreferences, sanitizeAndCheckSql } from '../services/security';
import { getMeetings } from '../services/storage';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'profile' | 'cookies' | 'export'>('security');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState('');

  const [cookiePrefs, setCookiePrefs] = useState(getCookiePreferences());
  const currentUser = getCurrentUser();

  if (!isOpen) return null;

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess(false);

    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 characters long.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN confirmation does not match.');
      return;
    }

    const check = sanitizeAndCheckSql(newPin);
    if (!check.isSafe) {
      setPinError('Malicious patterns detected.');
      return;
    }

    try {
      await resetMasterPin(newPin);
      setPinSuccess(true);
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinSuccess(false), 3000);
    } catch (err) {
      setPinError('Could not update Master PIN: ' + err);
    }
  };

  const handleExportData = async () => {
    const meetings = await getMeetings();
    const dataStr = JSON.stringify(meetings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-ghost-vault-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-zinc-900" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Privacy, Security & Vault Center</h2>
              <p className="text-xs text-zinc-500">Manage encryption keys, profile credentials & cookies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Vault PIN & Security
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            User Profile
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'cookies'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Cookie Options
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Data Portability
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6 flex-1 overflow-y-auto space-y-6 text-xs pr-1">
          {/* 1. Security & Master PIN Reset */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-900">
                  <Activity className="w-4 h-4 text-zinc-900" />
                  <span>Active SQL Injection & XSS Shielding</span>
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  All text inputs, meeting titles, and transcript annotations pass through automated SQL token
                  neutralization (`sanitizeAndCheckSql`) to eliminate command injection vulnerabilities.
                </p>
              </div>

              <form onSubmit={handleResetPin} className="p-5 border border-zinc-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-zinc-900" />
                  <h3 className="font-bold text-zinc-900 text-sm">Reset Master Vault PIN</h3>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">New Master PIN</label>
                  <input
                    type="password"
                    placeholder="Enter new 4+ digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Confirm New PIN</label>
                  <input
                    type="password"
                    placeholder="Confirm new PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono tracking-widest"
                  />
                </div>

                {pinError && (
                  <p className="text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}

                {pinSuccess && (
                  <p className="text-zinc-900 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Master Vault PIN successfully updated!
                  </p>
                )}

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save New PIN
                </button>
              </form>
            </div>
          )}

          {/* 2. User Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-5 border border-zinc-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200 font-bold text-base">
                    {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'V'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">
                      {currentUser?.displayName || 'Vault Owner'}
                    </h3>
                    <p className="text-zinc-500">{currentUser?.email || 'local@meetingghost.app'}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 mt-1">
                      Provider: {currentUser?.authProvider || 'Local Vault'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Cookie Options */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div className="p-4 border border-zinc-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900">Essential Vault Storage</div>
                    <div className="text-zinc-500 text-[11px]">Enables PBKDF2/AES-GCM-256 encrypted storage</div>
                  </div>
                  <span className="font-bold text-zinc-400 uppercase text-[10px]">Strictly Required</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                  <div>
                    <div className="font-bold text-zinc-900">Functional Preset Storage</div>
                    <div className="text-zinc-500 text-[11px]">Stores selected template & noise filter choices</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookiePrefs.functional}
                    onChange={(e) => {
                      const updated = saveCookiePreferences({ functional: e.target.checked });
                      setCookiePrefs(updated);
                    }}
                    className="accent-zinc-900 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                  <div>
                    <div className="font-bold text-zinc-900">Anonymous Diagnostics</div>
                    <div className="text-zinc-500 text-[11px]">Hardware WebGPU vs WASM inference latency metrics</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookiePrefs.analytics}
                    onChange={(e) => {
                      const updated = saveCookiePreferences({ analytics: e.target.checked });
                      setCookiePrefs(updated);
                    }}
                    className="accent-zinc-900 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Data Portability & GDPR Right to Delete */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-5 border border-zinc-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-zinc-900" />
                  <h3 className="font-bold text-zinc-900">Export Decrypted Vault (JSON)</h3>
                </div>
                <p className="text-zinc-600">
                  Download a complete backup of all meeting transcripts, decisions, and action items in structured JSON.
                </p>
                <button
                  onClick={handleExportData}
                  className="py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Download Vault Backup
                </button>
              </div>

              <div className="p-5 border border-red-200 bg-red-50/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-red-700">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <h3 className="font-bold">Permanent Device Data Purge (Right to be Forgotten)</h3>
                </div>
                <p className="text-zinc-600">
                  Permanently wipe all IndexedDB records, audio buffers, encryption keys, and credentials from this browser.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Permanently purge all data from this device? This action cannot be undone.')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Purge All Vault Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
