import React, { useState } from 'react';
import { useAppState } from '../context/AppContext.tsx';
import { UserCheck, Lock } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, changePassword } = useAppState();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profMsg, setProfMsg] = useState({ text: '', type: '' });
  const [profLoading, setProfLoading] = useState(false);

  // Security fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secMsg, setSecMsg] = useState({ text: '', type: '' });
  const [secLoading, setSecLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfMsg({ text: '', type: '' });
    setProfLoading(true);

    if (!name.trim() || !email.trim()) {
      setProfMsg({ text: 'Name and email are required', type: 'error' });
      setProfLoading(false);
      return;
    }

    const ok = await updateProfile(name.trim(), email.trim());
    if (ok) {
      setProfMsg({ text: 'Client profile attributes successfully synched!', type: 'success' });
    } else {
      setProfMsg({ text: 'Email already registered or synch boundary mismatch', type: 'error' });
    }
    setProfLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecMsg({ text: '', type: '' });
    setSecLoading(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setSecMsg({ text: 'All password parameters are required', type: 'error' });
      setSecLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecMsg({ text: 'Confirm boundaries password mismatch', type: 'error' });
      setSecLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setSecMsg({ text: 'New password must have at least 6 tokens', type: 'error' });
      setSecLoading(false);
      return;
    }

    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setSecMsg({ text: 'Account password changed securely!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setSecMsg({ text: res.error || 'Password update failed', type: 'error' });
    }
    setSecLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight text-white animate-fade-in">
          Client Profile
        </h2>
        <p className="text-sm text-slate-405 mt-1 font-sans">
          Adjust profile details, security boundaries, and hashes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDIT PROFILE CARD */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-l-full blur-xl pointer-events-none" />
          
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white font-display text-base">Metadata Settings</h3>
            </div>

            {profMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-semibold text-center mb-4 border ${
                profMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                {profMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="prof-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Display Name</label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#10b981] font-sans"
                />
              </div>

              <div>
                <label htmlFor="prof-email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Audited Email</label>
                <input
                  id="prof-email"
                  type="email"
                  required
                  value={email}
                  disabled
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-400 focus:outline-none pointer-events-none font-sans"
                />
                <span className="text-[9px] text-slate-400 block mt-1.5 italic font-sans">Emails are locked within demo sandboxes.</span>
              </div>

              <button
                id="prof-save-btn"
                type="submit"
                disabled={profLoading}
                className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95 transition-all outline-none border border-emerald-500/30 font-sans"
              >
                {profLoading ? 'Connecting...' : 'Update Attributes Mapping'}
              </button>
            </form>
          </div>
        </div>

        {/* SECURITY CHANGE PASSWORD CARD */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-l-full blur-xl pointer-events-none" />

          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white font-display text-base">Credentials Boundary</h3>
            </div>

            {secMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-semibold text-center mb-4 border ${
                secMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                {secMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="old-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Current Password</label>
                <input
                  id="old-pass"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label htmlFor="new-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">New Password</label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label htmlFor="confirm-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Confirm New Password</label>
                <input
                  id="confirm-pass"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <button
                id="sec-save-btn"
                type="submit"
                disabled={secLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-95 transition-all outline-none border border-indigo-500/30 font-sans"
              >
                {secLoading ? 'Synching Boundary...' : 'Adjust Credentials Key'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
