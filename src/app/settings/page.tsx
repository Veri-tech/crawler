'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  User,
  Mail,
  Lock,
  Zap,
  Bell,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Key,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'api', label: 'API & Integrations', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    display_name: 'Dev Veritech',
    email: 'dev@veritechdigital.co.za',
    plan: 'trial',
  });

  const [notifications, setNotifications] = useState({
    job_completed: true,
    job_failed: true,
    quota_warning: true,
    weekly_summary: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account, security, and notification preferences.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar nav */}
          <nav className="card-base flex flex-col w-48 flex-shrink-0 overflow-hidden">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors duration-150 text-left border-b border-border last:border-0 ${
                    isActive
                      ? s.id === 'danger' ?'bg-red-500/10 text-red-400' :'bg-primary/10 text-primary'
                      : s.id === 'danger' ?'text-red-400/70 hover:bg-red-500/5 hover:text-red-400' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="card-base flex flex-col">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Profile</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your public display name and account email.</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-5">
                  {/* Avatar placeholder */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">D</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          value={profile.display_name}
                          onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))}
                          className="input-base pl-9"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                          className="input-base pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Current Plan</label>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-primary/5 border border-primary/20 w-fit">
                      <Zap size={13} className="text-primary" />
                      <span className="text-sm font-medium text-primary capitalize">{profile.plan} Plan</span>
                      <button className="text-xs text-muted-foreground hover:text-foreground ml-2 transition-colors">
                        Upgrade →
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={handleSave} className="btn-primary text-sm px-4 py-2 gap-2">
                      {saved ? <Check size={14} /> : null}
                      {saved ? 'Saved' : 'Save Changes'}
                    </button>
                    {saved && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Check size={12} /> Changes saved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="card-base flex flex-col">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Security</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Update your password and manage account access.</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="input-base pl-9 pr-10"
                      />
                      <button
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">New Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="input-base pl-9 pr-10"
                      />
                      <button
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="input-base pl-9"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <button onClick={handleSave} className="btn-primary text-sm px-4 py-2">
                      {saved ? 'Password Updated' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API & Integrations */}
            {activeSection === 'api' && (
              <div className="card-base flex flex-col">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">API & Integrations</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your Crawl4AI worker connection and webhook settings.</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Crawl4AI Worker URL</label>
                    <input
                      type="text"
                      defaultValue="https://your-worker.railway.app"
                      className="input-base font-mono-data text-xs"
                    />
                    <p className="text-xs text-muted-foreground">The base URL of your self-hosted Crawl4AI worker on Railway.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">API Token</label>
                    <div className="relative">
                      <input
                        type="password"
                        defaultValue="placeholder-token"
                        className="input-base font-mono-data text-xs pr-10"
                      />
                      <Key size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground">Bearer token for authenticating requests to your worker.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Webhook Secret</label>
                    <div className="relative">
                      <input
                        type="password"
                        defaultValue="placeholder-secret"
                        className="input-base font-mono-data text-xs pr-10"
                      />
                      <Key size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground">Shared secret used to verify incoming webhook payloads from the worker.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Webhook Endpoint (read-only)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://vericrawl5637.builtwithrocket.new/api/jobs/webhook"
                        className="input-base font-mono-data text-xs bg-muted/50 cursor-default"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Configure this URL in your Crawl4AI worker as the webhook destination.</p>
                  </div>
                  <div className="pt-1">
                    <button onClick={handleSave} className="btn-primary text-sm px-4 py-2">
                      {saved ? 'Saved' : 'Save Integration Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="card-base flex flex-col">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Choose which events trigger email notifications.</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-1">
                  {[
                    { key: 'job_completed' as const, label: 'Job Completed', desc: 'Notify when a crawl job finishes successfully.' },
                    { key: 'job_failed' as const, label: 'Job Failed', desc: 'Notify when a crawl job encounters an error.' },
                    { key: 'quota_warning' as const, label: 'Quota Warning', desc: 'Alert when monthly page usage exceeds 80%.' },
                    { key: 'weekly_summary' as const, label: 'Weekly Summary', desc: 'Receive a weekly digest of crawl activity.' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-4 border-b border-border/60 last:border-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))
                        }
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                          notifications[item.key] ? 'bg-primary' : 'bg-muted'
                        }`}
                        role="switch"
                        aria-checked={notifications[item.key]}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button onClick={handleSave} className="btn-primary text-sm px-4 py-2">
                      {saved ? 'Saved' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="card-base flex flex-col border-red-500/30">
                <div className="px-6 py-4 border-b border-red-500/20 bg-red-500/5">
                  <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Danger Zone
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Irreversible actions. Proceed with caution.</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-md border border-border bg-muted/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Delete All Job History</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Permanently delete all crawl jobs and their associated page data. This cannot be undone.
                      </p>
                    </div>
                    <button className="btn-ghost text-xs px-3 py-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-400 border border-red-500/30 flex-shrink-0 gap-1.5">
                      <Trash2 size={13} />
                      Delete History
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4 rounded-md border border-red-500/30 bg-red-500/5">
                    <div>
                      <p className="text-sm font-medium text-red-400">Delete Account</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Permanently delete your VeriCrawl account, all jobs, pages, and usage data. This action is irreversible.
                      </p>
                    </div>
                    <button className="flex-shrink-0 text-xs px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
                      <Trash2 size={13} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
