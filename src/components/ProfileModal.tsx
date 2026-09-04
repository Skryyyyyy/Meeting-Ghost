import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Camera,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import {
  getCurrentUser,
  updateUserProfile,
  updateMasterPin,
  UserProfile,
} from '../services/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (user: UserProfile) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'vault'>('profile');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [authProvider, setAuthProvider] = useState('local');

  // Password / PIN Form State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = getCurrentUser();
      setDisplayName(user?.displayName || 'Vault Owner');
      setEmail(user?.email || 'local@meetingghost.app');
      setPhotoURL(user?.photoURL || '');
      setAuthProvider(user?.authProvider || 'local');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setIsProcessing(true);

    try {
      const updated = await updateUserProfile({
        displayName: displayName.trim() || 'Vault Owner',
        email: email.trim(),
        photoURL: photoURL.trim(),
      });
      onProfileUpdated?.(updated);
      setFeedbackMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!currentPin) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your current Master PIN.' });
      return;
    }

    if (newPin.length < 4) {
      setFeedbackMsg({ type: 'error', text: 'New Master PIN must be at least 4 digits.' });
      return;
    }

    if (newPin !== confirmPin) {
      setFeedbackMsg({ type: 'error', text: 'New PIN confirmation does not match.' });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await updateMasterPin(currentPin, newPin);
      if (result.success) {
        setFeedbackMsg({ type: 'success', text: 'Master PIN changed successfully!' });
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else {
        setFeedbackMsg({ type: 'error', text: result.error || 'Failed to change PIN.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error changing PIN.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Profile & Account Settings</h2>
              <p className="text-xs text-zinc-500">Manage identity, username, and vault password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-zinc-200 flex space-x-2 bg-white text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('profile');
              setFeedbackMsg(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-zinc-900 text-zinc-900 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Identity & Username
          </button>

          <button
            onClick={() => {
              setActiveTab('security');
              setFeedbackMsg(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-zinc-900 text-zinc-900 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Password & Master PIN
          </button>

          <button
            onClick={() => {
              setActiveTab('vault');
              setFeedbackMsg(null);
            }}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'border-zinc-900 text-zinc-900 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Vault Encryption
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Feedback Message */}
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium animate-fade-in ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-2">Profile Avatar</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {photoURL ? (
                      <img
                        src={photoURL}
                        alt={displayName}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zinc-900 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                        {displayName.charAt(0).toUpperCase() || '👻'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <p className="text-[11px] text-zinc-500">Pick an avatar preset or enter image URL</p>
                    <div className="flex items-center space-x-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt="Avatar preset"
                          onClick={() => setPhotoURL(preset)}
                          className={`w-7 h-7 rounded-full object-cover cursor-pointer transition-all ${
                            photoURL === preset ? 'ring-2 ring-zinc-900 scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setPhotoURL('')}
                        className="text-[10px] text-zinc-600 hover:text-zinc-900 px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 cursor-pointer font-medium"
                      >
                        Default
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Display Name / Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-medium"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-medium"
                  />
                </div>
              </div>

              {/* Account Type info */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-medium">Authentication Type</span>
                <span className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] px-2.5 py-1 bg-white rounded-full border border-zinc-200">
                  {authProvider === 'local' ? '🔒 Local On-Device Vault' : authProvider}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {isProcessing ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* TAB 2: Password & Master PIN */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePin} className="space-y-4">
              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs text-zinc-600 space-y-1">
                <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Master Vault Password / PIN</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Your Master PIN is used to derive the AES-GCM-256 encryption key via PBKDF2 with 100,000 iterations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Current Master PIN / Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">New Master PIN / Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Min 4 characters/digits"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Confirm New Master PIN</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Re-type new PIN"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer mt-2"
              >
                {isProcessing ? 'Updating PIN...' : 'Update Master PIN'}
              </button>
            </form>
          )}

          {/* TAB 3: Vault Encryption */}
          {activeTab === 'vault' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">Cipher Specification</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-zinc-900 text-white rounded-md">
                    AES-GCM-256
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Key Derivation Function</span>
                  <span className="font-mono text-zinc-900">PBKDF2 SHA-256</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Hashing Iteration Count</span>
                  <span className="font-mono text-zinc-900">100,000 rounds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Storage Layer</span>
                  <span className="font-mono text-zinc-900">IndexedDB Encrypted Sandbox</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero plaintext audio or transcripts are ever written to unencrypted storage.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
