import React, { useState } from 'react';
import {
  Database,
  HardDrive,
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
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { NotificationDialog } from '../../components/NotificationDialog';

export const AdminSettings: React.FC = () => {
  const { state, resetDemoData } = useApp();
  const { session } = useAuth();

  const [rememberedEmail, setRememberedEmail] = useState<string>(() =>
    loadRememberedAdminEmail()
  );
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetDoneOpen, setResetDoneOpen] = useState(false);

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
                <p className="font-bold uppercase text-[#4E8B62]">
                  Browser Storage Inventory
                </p>
                <p className="mt-1 text-[#303030]">
                  All portal updates sync immediately across Student and Admin portals via React
                  state and browser localStorage.
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
                    Reset all students, tasks, offer letters, submissions, certificates, LORs, and
                    logs back to the initial demonstration snapshot.
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

      <NotificationDialog
        open={confirmResetOpen}
        title="CONFIRM_DEMO_RESET.EXE"
        message="Are you sure you want to reset all portal records back to the initial Skillora demo dataset?"
        type="info"
        confirmLabel="Reset Demo Data"
        cancelLabel="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <NotificationDialog
        open={resetDoneOpen}
        title="DEMO_RESET_COMPLETE.EXE"
        message="All Skillora portal data has been restored to the initial demonstration snapshot."
        type="success"
        confirmLabel="OK"
        onConfirm={() => setResetDoneOpen(false)}
      />
    </div>
  );
};
