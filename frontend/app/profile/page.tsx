"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import DashboardShell from '../components/DashboardShell';
import Button from '../components/Button';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300d4ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237c3aed;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='140' height='140'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='56' font-weight='bold' fill='white'%3EU%3C/text%3E%3C/svg%3E";

type TabType = 'personal' | 'work' | 'security';

const PROFILE_STYLES = `
  .prof-card { background: linear-gradient(160deg, rgba(22,22,22,0.95) 0%, rgba(14,14,14,0.98) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; overflow: hidden; }
  .prof-tab { display: flex; align-items: center; gap: 8px; padding: 12px 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #6b7f97; transition: all 0.18s; white-space: nowrap; letter-spacing: -0.01em; font-family: inherit; border-bottom: 2px solid transparent; }
  .prof-tab:hover { color: #c7d3e3; background: rgba(255,255,255,0.03); }
  .prof-tab.active { color: #a5b4fc; border-bottom-color: #6366f1; background: rgba(99,102,241,0.06); }
  .prof-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #e6eef8; font-size: 13px; padding: 11px 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; font-family: inherit; }
  .prof-input::placeholder { color: #6b7f97; }
  .prof-input:focus { border-color: rgba(99,102,241,0.45); background: rgba(99,102,241,0.035); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .prof-input:read-only { opacity: 0.5; cursor: not-allowed; }
  .prof-label { font-size: 11px; font-weight: 600; color: #9caec2; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 7px; display: block; }
  .prof-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 22px; }
  .skel { background: linear-gradient(90deg, rgba(255,255,255,0.012) 25%, rgba(255,255,255,0.028) 50%, rgba(255,255,255,0.012) 75%); background-size: 900px 100%; animation: shimmer 3.6s ease infinite; border-radius: 10px; }
  @keyframes shimmer { 0%{background-position:-900px 0} 100%{background-position:900px 0} }
`;

export default function ProfilePage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [twoFAUri, setTwoFAUri] = useState<string | null>(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFAMode, setTwoFAMode] = useState<'idle'|'setup'|'verifying'>('idle');
  const [twoFAMessage, setTwoFAMessage] = useState<string | null>(null);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json();
        const u = data.user;
        setProfile({
          name: u.name || '', email: u.email || '', userId: u.userId || '',
          phone: u.phone || '', bio: u.bio || '', avatar: u.avatar || DEFAULT_AVATAR,
          company: u.company || '', jobTitle: u.jobTitle || '', location: u.location || '',
          skills: u.skills || '', membershipStatus: u.membershipStatus || 'free',
          twoFactorAuth: u.settings?.twoFactorAuth ?? false,
          role: u.role || 'user',
        });
      } catch { /* stay loading */ }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [BACKEND_URL, router]);

  const handleChange = (key: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be <5MB'); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BACKEND_URL}/api/user/upload/avatar`, { method: 'POST', credentials: 'include', body: formData });
      const data = await res.json();
      if (data.success && data.avatar) {
        handleChange('avatar', data.avatar);
        localStorage.setItem('userAvatar', data.avatar);
        await saveAvatar(data.avatar);
        router.push('/profile/avatar');
      } else { alert('Failed to upload avatar. Please try again.'); }
    } catch { alert('Failed to upload avatar. Please try again.'); }
  };

  const handleRemoveAvatar = async () => {
    handleChange('avatar', DEFAULT_AVATAR);
    localStorage.setItem('userAvatar', DEFAULT_AVATAR);
    await saveAvatar(DEFAULT_AVATAR);
    router.push('/profile/avatar');
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const json = await api('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone, bio: profile.bio, avatar: profile.avatar, company: profile.company, jobTitle: profile.jobTitle, location: profile.location, skills: profile.skills }),
      });
      if (json.user) {
        const u = json.user;
        setProfile((prev: any) => ({ ...prev, name: u.name || '', email: u.email || '', phone: u.phone || '', bio: u.bio || '', avatar: u.avatar || DEFAULT_AVATAR, company: u.company || '', jobTitle: u.jobTitle || '', location: u.location || '', skills: u.skills || '' }));
      }
      alert('Profile saved successfully!');
    } catch (err: any) { alert('Save failed: ' + (err.message || 'Unable to save profile right now.')); }
    finally { setSaving(false); }
  };

  const saveAvatar = async (avatar: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/profile`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar }) });
    } catch { /* non-critical */ }
  };

  const handleChangePassword = async () => {
    setPwdMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) { setPwdMessage('Please fill all password fields.'); return; }
    if (newPassword !== confirmPassword) { setPwdMessage('New passwords do not match.'); return; }
    setPwdLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || 'Change failed');
      setPwdMessage('Password updated successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { setPwdMessage(err.message || 'Error changing password'); }
    finally { setPwdLoading(false); }
  };

  const start2FA = async () => {
    setTwoFAMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/2fa/setup`, { method: 'POST', credentials: 'include' });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || '2FA setup failed');
      setTwoFASecret(js.secret || null); setTwoFAUri(js.otpauth_url || null); setTwoFAMode('setup');
    } catch (err: any) { setTwoFAMessage(err.message || 'Failed to start 2FA'); }
  };

  const verify2FA = async () => {
    setTwoFAMessage(null); setTwoFAMode('verifying');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/2fa/verify`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: twoFAToken, secret: twoFASecret }) });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || 'Verification failed');
      setProfile((prev: any) => ({ ...prev, twoFactorAuth: true }));
      setTwoFAMessage('Two-factor authentication enabled');
      setTwoFASecret(null); setTwoFAToken(''); setTwoFAMode('idle');
    } catch (err: any) { setTwoFAMessage(err.message || 'Invalid code'); setTwoFAMode('setup'); }
  };

  const disable2FA = async () => {
    setTwoFAMessage(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/2fa/disable`, { method: 'POST', credentials: 'include' });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || 'Disable failed');
      setProfile((prev: any) => ({ ...prev, twoFactorAuth: false }));
      setTwoFAMessage('Two-factor disabled');
    } catch (err: any) { setTwoFAMessage(err.message || 'Failed to disable 2FA'); }
  };

  const handleDeleteAccount = async () => {
    setDeleteMessage(null);
    if (!deletePassword) { setDeleteMessage('Please enter your password to confirm'); return; }
    if (!confirm('This will permanently delete your account. Are you sure?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/delete-account`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: deletePassword }) });
      const js = await res.json();
      if (!res.ok) throw new Error(js.message || 'Delete failed');
      window.location.href = '/';
    } catch (err: any) { setDeleteMessage(err.message || 'Failed to delete account'); }
    finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <DashboardShell activePath="/profile">
        <style>{PROFILE_STYLES}</style>
        <div style={{ padding: '40px 32px' }}>
          <div className="skel" style={{ width: 180, height: 32, marginBottom: 28 }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0,1,2].map(i => <div key={i} className="skel" style={{ height: 80 }}/>)}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!profile) {
    return (
      <DashboardShell activePath="/profile">
        <style>{PROFILE_STYLES}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#f87171', fontSize: 18, fontWeight: 700 }}>Authentication Required</p>
            <p style={{ color: '#6b7f97', fontSize: 13, marginTop: 6 }}>Please log in to access your profile</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activePath="/profile" userRole={profile.role}>
      <style>{PROFILE_STYLES}</style>
      <div style={{ padding: '40px 40px 80px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#e6eef8', marginBottom: 6 }}>
            Your <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Profile</span>
          </h1>
          <p style={{ fontSize: 13, color: '#6b7f97' }}>Manage your personal information and preferences</p>
        </div>

        {/* Card */}
        <div className="prof-card" style={{ width: '100%' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', overflowX: 'auto' as const }}>
            {(['personal', 'work', 'security'] as TabType[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`prof-tab${activeTab === tab ? ' active' : ''}`}>
                {tab === 'personal' && <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                {tab === 'work' && <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                {tab === 'security' && <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}{tab === 'personal' ? ' Details' : tab === 'work' ? ' Details' : ''}
              </button>
            ))}
          </div>

          <div style={{ padding: '28px' }}>
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={profile.avatar || DEFAULT_AVATAR} alt={profile.name || 'User'} referrerPolicy="no-referrer"
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.3)' }}
                      onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                    />
                    <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, background: '#34d399', borderRadius: '50%', border: '2px solid #0a0a0a' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#e6eef8', marginBottom: 2 }}>{profile.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7f97', marginBottom: 12 }}>{profile.email}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }}/>
                      <button onClick={() => avatarInputRef.current?.click()}
                        style={{ padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #4f4fdc, #6366f1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                        Change Photo
                      </button>
                      <button onClick={handleRemoveAvatar}
                        style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', color: '#9caec2', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <label>
                    <span className="prof-label">Full Name</span>
                    <input className="prof-input" value={profile.name} onChange={e => handleChange('name', e.target.value)} placeholder="Enter your full name"/>
                  </label>
                  <label>
                    <span className="prof-label">Email Address</span>
                    <input className="prof-input" type="email" value={profile.email} onChange={e => handleChange('email', e.target.value)} placeholder="Enter your email"/>
                  </label>
                  <label>
                    <span className="prof-label">User ID <span style={{ opacity: 0.5 }}>(readonly)</span></span>
                    <input className="prof-input" value={profile.userId} readOnly/>
                  </label>
                  <label>
                    <span className="prof-label">Phone Number</span>
                    <input className="prof-input" value={profile.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="Enter your phone number"/>
                  </label>
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span className="prof-label">Bio</span>
                    <textarea className="prof-input" value={profile.bio} onChange={e => handleChange('bio', e.target.value)} rows={4} placeholder="Tell us about yourself..." style={{ resize: 'none' as const }}/>
                  </label>
                </div>
              </div>
            )}

            {/* Work Tab */}
            {activeTab === 'work' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <label>
                  <span className="prof-label">Company</span>
                  <input className="prof-input" value={profile.company || ''} onChange={e => handleChange('company', e.target.value)} placeholder="Enter your company name"/>
                </label>
                <label>
                  <span className="prof-label">Job Title</span>
                  <input className="prof-input" value={profile.jobTitle || ''} onChange={e => handleChange('jobTitle', e.target.value)} placeholder="e.g., Data Scientist, ML Engineer"/>
                </label>
                <label>
                  <span className="prof-label">Location</span>
                  <input className="prof-input" value={profile.location || ''} onChange={e => handleChange('location', e.target.value)} placeholder="e.g., San Francisco, CA"/>
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  <span className="prof-label">Skills</span>
                  <textarea className="prof-input" value={profile.skills || ''} onChange={e => handleChange('skills', e.target.value)} rows={3} placeholder="e.g., Python, TensorFlow, Machine Learning" style={{ resize: 'none' as const }}/>
                </label>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Change Password */}
                <div className="prof-section">
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6eef8', marginBottom: 4 }}>Change Password</div>
                  <div style={{ fontSize: 12, color: '#6b7f97', marginBottom: 16 }}>Update your password regularly to keep your account secure.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="prof-input" type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}/>
                    <input className="prof-input" type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                    <input className="prof-input" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                    {pwdMessage && <div style={{ fontSize: 12, color: pwdMessage.includes('success') ? '#34d399' : '#f87171' }}>{pwdMessage}</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={handleChangePassword} disabled={pwdLoading}
                        style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #4f4fdc, #6366f1)', color: '#fff', border: 'none', cursor: pwdLoading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: pwdLoading ? 0.6 : 1 }}>
                        {pwdLoading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdMessage(null); }}
                        style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', color: '#9caec2', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2FA */}
                <div className="prof-section">
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e6eef8', marginBottom: 4 }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: 12, color: '#6b7f97', marginBottom: 16 }}>Add an extra layer of security using TOTP (e.g., Google Authenticator).</div>
                  {profile?.twoFactorAuth ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12, color: '#34d399' }}>Two-factor is enabled on your account.</div>
                      <Button onClick={disable2FA} variant="danger" size="sm">Disable 2FA</Button>
                    </div>
                  ) : twoFAMode === 'setup' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        {twoFAUri ? (
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(twoFAUri)}`} alt="2FA QR" style={{ background: '#fff', padding: 8, borderRadius: 8 }}/>
                        ) : (
                          <div style={{ width: 160, height: 160, background: 'rgba(255,255,255,0.03)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7f97', fontSize: 12 }}>QR unavailable</div>
                        )}
                        {twoFASecret && <div style={{ fontSize: 10, color: '#6b7f97', wordBreak: 'break-all' as const }}>Secret: {twoFASecret}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input className="prof-input" placeholder="Enter code from authenticator" value={twoFAToken} onChange={e => setTwoFAToken(e.target.value)}/>
                        {twoFAMessage && <div style={{ fontSize: 12, color: '#f59e0b' }}>{twoFAMessage}</div>}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button onClick={verify2FA} size="sm">Verify &amp; Enable</Button>
                          <Button onClick={() => { setTwoFAMode('idle'); setTwoFASecret(null); setTwoFAUri(null); setTwoFAToken(''); setTwoFAMessage(null); }} variant="outline" size="sm">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12, color: '#9caec2' }}>Two-factor is not enabled.</div>
                      <Button onClick={start2FA} size="sm">Enable 2FA</Button>
                    </div>
                  )}
                  {twoFAMessage && twoFAMode === 'idle' && <div style={{ fontSize: 12, color: '#34d399', marginTop: 10 }}>{twoFAMessage}</div>}
                </div>

                {/* Delete Account */}
                <div className="prof-section" style={{ borderColor: 'rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.03)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>Delete Account</div>
                  <div style={{ fontSize: 12, color: '#6b7f97', marginBottom: 16 }}>Permanently delete your account. This cannot be undone.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="prof-input" type="password" placeholder="Enter your password to confirm" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}/>
                    {deleteMessage && <div style={{ fontSize: 12, color: '#f87171' }}>{deleteMessage}</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button onClick={handleDeleteAccount} disabled={deleting} variant="danger" size="sm">{deleting ? 'Deleting...' : 'Delete Account'}</Button>
                      <Button onClick={() => { setDeletePassword(''); setDeleteMessage(null); }} variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {activeTab !== 'security' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 400 }}>
                <button onClick={save} disabled={saving}
                  style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'linear-gradient(140deg, #4f4fdc, #6366f1, #8b5cf6)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => window.location.reload()}
                  style={{ padding: '11px 20px', borderRadius: 10, background: 'transparent', color: '#9caec2', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
