import React, { useState } from 'react';
import {
  CloudUpload,
  Database,
  HardDrive,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  loadRememberedAdminEmail,
  saveRememberedAdminEmail,
} from '../../services/storageService';
import { SUPABASE_PROJECT_ID, SUPABASE_URL } from '../../services/supabaseClient';
import { checkSupabaseHealth, SupabaseHealthResult } from '../../services/supabaseSyncService';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { NotificationDialog } from '../../components/NotificationDialog';

export const AdminSettings: React.FC = () => {
  const { state, resetDemoData, refreshFromSupabase, syncDemoDataToSupabase } = useApp();
  const { session } = useAuth();

  const [rememberedEmail, setRememberedEmail] = useState<string>(() =>
    loadRememberedAdminEmail()
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetDoneOpen, setResetDoneOpen] = useState(false);

  const [supaStatus, setSupaStatus] = useState<SupabaseHealthResult | null>(null);
  const [checkingSupa, setCheckingSupa] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncingUp, setSyncingUp] = useState(false);

  const handleToggleRemembered = () => {
    if (rememberedEmail) {
      saveRememberedAdminEmail(null);
      setRememberedEmail('');
    } else if (session.adminEmail) {
      saveRememberedAdminEmail(session.adminEmail);
      setRememberedEmail(session.adminEmail);
    }
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    setResetDoneOpen(true);
  };

  const handleCheckSupabase = async () => {
    setCheckingSupa(true);
    setSyncMsg(null);
    try {
      const res = await checkSupabaseHealth();
      setSupaStatus(res);
    } finally {
      setCheckingSupa(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingUp(true);
    setSyncMsg(null);
    try {
      const res = await syncDemoDataToSupabase();
      if (res.ok) {
        setSyncMsg('All current portal records have been synced to your Supabase tables.');
        const health = await checkSupabaseHealth();
        setSupaStatus(health);
      } else {
        setSyncMsg(`Sync note: ${res.error || 'Ensure schema.sql has been executed in Supabase.'}`);
      }
    } finally {
      setSyncingUp(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setCheckingSupa(true);
    setSyncMsg(null);
    try {
      const ok = await refreshFromSupabase();
      setSyncMsg(
        ok
          ? 'Fetched latest student & internship records from Supabase.'
          : 'Could not read tables yet. Ensure schema.sql has been executed in Supabase SQL Editor.'
      );
    } finally {
      setCheckingSupa(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Administrator Session & Security Settings */}
        <RetroWindow title="ADMIN_SESSION_CONFIG.EXE" headerColor="navy">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-[#F4EBD0] border-2 border-[#303030]">
              <ShieldCheck className="w-5 h-5 text-[#4169E1] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#182747]">
                <p className="font-bold uppercase text-xs text-[#4169E1]">
                  Active Administrator Session
                </p>
                <p className="font-mono-data font-bold mt-1">{session.adminEmail}</p>
                <p className="text-xs text-[#303030] mt-1">
                  Admin authentication is stored separately from student portal sessions in{' '}
                  <code className="font-mono-data bg-white px-1 border border-[#303030]/40">
                    localStorage
                  </code>
                  .
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-2 border-[#303030] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#182747]">
                    Remember Me Preference (Demo)
                  </h3>
                  <p className="text-xs text-[#303030] mt-0.5">
                    Pre-fills your administrator email on the <code>/admin/login</code> screen.
                  </p>
                </div>
                <RetroButton
                  type="button"
                  size="sm"
                  variant={rememberedEmail ? 'neutral' : 'primary'}
                  onClick={handleToggleRemembered}
                >
                  {rememberedEmail ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Remembered</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Remember Email</span>
                    </>
                  )}
                </RetroButton>
              </div>
              <div className="text-xs font-mono-data text-[#4169E1]">
                Status: {rememberedEmail ? `Remembering ${rememberedEmail}` : 'Not saved'}
              </div>
            </div>
          </div>
        </RetroWindow>

        {/* LocalStorage Snapshot & Demo Reset */}
        <RetroWindow title="PORTAL_STORAGE_SETTINGS.EXE" headerColor="blue">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-[#FFF8E7] border-2 border-[#303030]">
              <HardDrive className="w-5 h-5 text-[#4E8B62] shrink-0 mt-0.5" />
              <div className="text-xs text-[#182747]">
                <p className="font-bold uppercase text-[#4E8B62]">Portal Records Inventory</p>
                <p className="mt-1 text-[#303030]">
                  Records synchronize with your Supabase backend tables alongside local browser
                  caching.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border-2 border-[#303030]">
                <div className="text-[#303030] uppercase font-bold text-[10px]">Students</div>
                <div className="font-mono-data text-lg font-bold text-[#182747]">
                  {state.students.length}
                </div>
              </div>
              <div className="p-3 bg-white border-2 border-[#303030]">
                <div className="text-[#303030] uppercase font-bold text-[10px]">Offer Versions</div>
                <div className="font-mono-data text-lg font-bold text-[#182747]">
                  {state.offerLetters.length}
                </div>
              </div>
              <div className="p-3 bg-white border-2 border-[#303030]">
                <div className="text-[#303030] uppercase font-bold text-[10px]">Tasks</div>
                <div className="font-mono-data text-lg font-bold text-[#182747]">
                  {state.tasks.length}
                </div>
              </div>
              <div className="p-3 bg-white border-2 border-[#303030]">
                <div className="text-[#303030] uppercase font-bold text-[10px]">Projects</div>
                <div className="font-mono-data text-lg font-bold text-[#182747]">
                  {state.projectSubmissions.length}
                </div>
              </div>
              <div className="p-3 bg-white border-2 border-[#303030]">
                <div className="text-[#303030] uppercase font-bold text-[10px]">Certificates</div>
                <div className="font-mono-data text-lg font-bold text-[#182747]">
                  {state.certificates.length}
                </div>
              </div>
              <div className="p-3 bg-white border-2 border-[#303030]">
                <div className="text-[#303030] uppercase font-bold text-[10px]">Change Logs</div>
                <div className="font-mono-data text-lg font-bold text-[#182747]">
                  {state.changeLogs.length}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#C94C4C]/10 border-2 border-[#C94C4C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Database className="w-5 h-5 text-[#C94C4C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#8a2323]">Restore Demo Dataset</h3>
                  <p className="text-xs text-[#303030]">
                    Reset local portal records back to the initial demonstration snapshot.
                  </p>
                </div>
              </div>
              <RetroButton
                type="button"
                variant="danger"
                size="md"
                onClick={() => setConfirmResetOpen(true)}
                className="shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </RetroButton>
            </div>
          </div>
        </RetroWindow>
      </div>

      {/* Supabase Backend Sync Settings */}
      <RetroWindow title="SUPABASE_BACKEND_SYNC.EXE" headerColor="navy">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border-2 border-[#303030] space-y-1.5 text-xs">
              <div className="font-bold uppercase text-[#4169E1]">Connected Supabase Project</div>
              <div className="font-mono-data text-sm font-bold text-[#182747]">
                Project ID: {SUPABASE_PROJECT_ID}
              </div>
              <div className="font-mono-data text-[#303030] break-all">{SUPABASE_URL}</div>
              <p className="text-[#303030] pt-1">
                New student registrations, offer letters, internship edits, tasks, submissions,
                certificates, and LORs automatically sync to your Supabase tables.
              </p>
            </div>

            <div className="p-4 bg-[#F4EBD0] border-2 border-[#303030] flex flex-col justify-between gap-3">
              <div className="text-xs text-[#182747]">
                <p className="font-bold uppercase text-[#182747]">Database Schema Verification</p>
                <p className="mt-1 text-[#303030]">
                  Ensure the SQL tables in <code className="font-mono-data">supabase/schema.sql</code>{' '}
                  are created in your Supabase SQL Editor, then verify or sync below.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RetroButton
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleCheckSupabase}
                  disabled={checkingSupa}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{checkingSupa ? 'Checking...' : 'Check Tables'}</span>
                </RetroButton>
                <RetroButton
                  type="button"
                  size="sm"
                  variant="success"
                  onClick={handleSyncToSupabase}
                  disabled={syncingUp}
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>{syncingUp ? 'Syncing...' : 'Sync Local Data to Supabase'}</span>
                </RetroButton>
                <RetroButton
                  type="button"
                  size="sm"
                  variant="neutral"
                  onClick={handlePullFromSupabase}
                  disabled={checkingSupa}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pull from Supabase</span>
                </RetroButton>
              </div>
            </div>
          </div>

          {supaStatus && (
            <div
              className={`p-3 border-2 text-xs font-semibold ${
                supaStatus.tablesReady
                  ? 'bg-[#4E8B62]/15 border-[#4E8B62] text-[#1e4d2b]'
                  : 'bg-[#C94C4C]/15 border-[#C94C4C] text-[#8a2323]'
              }`}
            >
              {supaStatus.tablesReady
                ? `Supabase tables verified! Found ${supaStatus.studentCount ?? 0} student record(s) in public.students.`
                : `Tables not ready yet: ${supaStatus.errorMessage}. Run supabase/schema.sql in your Supabase SQL Editor.`}
            </div>
          )}

          {syncMsg && (
            <div className="p-3 bg-[#FFF8E7] border-2 border-[#303030] text-xs font-semibold text-[#182747]">
              {syncMsg}
            </div>
          )}
        </div>
      </RetroWindow>

      <NotificationDialog
        open={confirmResetOpen}
        title="CONFIRM_DEMO_RESET.EXE"
        message="Are you sure you want to reset all local portal records back to the initial Skillora demo dataset?"
        type="info"
        confirmLabel="Reset Demo Data"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <NotificationDialog
        open={resetDoneOpen}
        title="DEMO_RESET_COMPLETE.EXE"
        message="Local Skillora portal data has been restored to the initial demonstration snapshot."
        type="success"
        confirmLabel="OK"
        onConfirm={() => setResetDoneOpen(false)}
      />
    </div>
  );
};
