import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Check, FileText, RefreshCw, Save, Upload, Eye, ScrollText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentTemplateConfig, InternshipDomain } from '../../types';
import { RetroWindow } from '../../components/RetroWindow';
import { RetroButton } from '../../components/RetroButton';
import { NotificationDialog } from '../../components/NotificationDialog';
import { OfferLetterPreview } from '../../components/OfferLetterPreview';
import { CertificatePreview } from '../../components/CertificatePreview';
import { LORPreview } from '../../components/LORPreview';
import { initialSeedState } from '../../data/seedData';

export const DocumentCustomization: React.FC = () => {
  const { docType } = useParams<{ docType?: string }>();
  const navigate = useNavigate();
  const { state, saveDocumentTemplate } = useApp();

  const activeTab: 'offer_letter' | 'certificate' | 'lor' =
    docType === 'certificate' || docType === 'lor' ? docType : 'offer_letter';

  const defaultTemplates = initialSeedState.documentTemplates;
  const currentSaved =
    state.documentTemplates.find((d) => d.id === activeTab) ||
    defaultTemplates.find((d) => d.id === activeTab) || {
      id: activeTab,
      title: 'Document Template',
      heading: 'OFFICIAL DOCUMENT',
      bodyText: 'Document body content...',
      primaryColor: '#082A4D',
      secondaryColor: '#57B8B2',
      fontSize: '11',
      fontFamily: 'helvetica',
      textAlign: 'left',
      logoUrl: '',
      signatureName: 'Aditya Jain',
      signatureTitle: 'Chief Executive Officer',
      footerText: 'Issued by Skillora Technologies',
      updatedAt: new Date().toISOString(),
    };

  const [formState, setFormState] = useState<DocumentTemplateConfig>({ ...currentSaved });
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [activePreviewMode, setActivePreviewMode] = useState<'visual' | 'code'>('visual');

  // Sync form when tab changes
  React.useEffect(() => {
    const found =
      state.documentTemplates.find((d) => d.id === activeTab) ||
      defaultTemplates.find((d) => d.id === activeTab);
    if (found) {
      setFormState({ ...found });
    }
  }, [activeTab, state.documentTemplates]);

  const handleTabChange = (tab: 'offer_letter' | 'certificate' | 'lor') => {
    navigate(`/admin/documents/${tab}`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormState((prev) => ({
          ...prev,
          logoUrl: uploadEvent.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: DocumentTemplateConfig = {
        ...formState,
        updatedAt: new Date().toISOString(),
      };
      const res = await saveDocumentTemplate(updated);
      if (res.ok) {
        setToastType('success');
        setToastMessage(`Successfully saved changes for ${formState.title} to Supabase!`);
      } else {
        setToastType('error');
        setToastMessage(`Failed to save to Supabase: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setToastType('error');
      setToastMessage(`Error: ${err.message || 'Failed to save document template'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const original = defaultTemplates.find((d) => d.id === activeTab);
    if (original) {
      setFormState({ ...original });
      setToastType('success');
      setToastMessage('Reset template to default version.');
    }
  };

  // Dummy student & record for preview
  const sampleStudent = state.students[0] || {
    id: 'SKL-2026-1001',
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@example.edu',
    mobile: '9876543210',
    college: 'National Institute of Technology',
    course: 'B.Tech Computer Science',
    semester: '6th Semester',
    domain: 'Web Development' as InternshipDomain,
    password: '',
    registrationDate: new Date().toISOString(),
    internshipStartDate: '2026-10-15',
    internshipEndDate: '2026-11-26',
    internshipDuration: '6 Weeks',
    projectDeadline: '2026-11-22',
    offerLetterDate: 'October 12, 2026',
    offerLetterNumber: 'OL-SKL-2026-1001',
    offerLetterStatus: 'GENERATED',
    internshipStatus: 'Internship Completed',
  };

  const sampleOfferRecord = state.offerLetters[0] || {
    id: 'OLR-SAMPLE',
    offerLetterNumber: 'OL-SKL-2026-1001',
    version: 1,
    studentId: sampleStudent.id,
    studentName: sampleStudent.fullName,
    domain: sampleStudent.domain,
    issueDate: sampleStudent.offerLetterDate,
    createdAt: new Date().toISOString(),
    isCurrent: true,
  };

  const sampleCertRecord = state.certificates[0] || {
    id: 'C-SAMPLE',
    certificateId: 'CERT-SKL-2026-0001',
    studentId: sampleStudent.id,
    studentName: sampleStudent.fullName,
    domain: sampleStudent.domain,
    completionDate: 'November 4, 2026',
    issuedAt: new Date().toISOString(),
    status: 'ISSUED' as const,
  };

  const sampleLorRecord = state.lors[0] || {
    id: 'L-SAMPLE',
    lorId: 'LOR-SKL-2026-0001',
    studentId: sampleStudent.id,
    studentName: sampleStudent.fullName,
    domain: sampleStudent.domain,
    completionDate: 'November 4, 2026',
    issuedAt: new Date().toISOString(),
    status: 'ISSUED' as const,
  };

  return (
    <div className="space-y-6">
      {/* Header & Subsections Navigation */}
      <RetroWindow title="DOCUMENT_CUSTOMIZATION_HUB.EXE" headerColor="navy">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              ADMIN DOCUMENT CUSTOMIZATION &amp; APPROVAL
            </h1>
            <p className="text-sm text-[#303030] mt-1">
              Customize templates, upload branding assets, edit typography and layout, and persist changes securely in Supabase.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <RetroButton
              size="sm"
              variant={activeTab === 'offer_letter' ? 'primary' : 'neutral'}
              onClick={() => handleTabChange('offer_letter')}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Offer Letter</span>
            </RetroButton>
            <RetroButton
              size="sm"
              variant={activeTab === 'certificate' ? 'success' : 'neutral'}
              onClick={() => handleTabChange('certificate')}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </RetroButton>
            <RetroButton
              size="sm"
              variant={activeTab === 'lor' ? 'primary' : 'neutral'}
              onClick={() => handleTabChange('lor')}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>LOR</span>
            </RetroButton>
          </div>
        </div>

        {/* Customization Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Editor Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#F4EBD0] border-2 border-[#303030] p-3">
              <span className="font-pixel text-[9px] text-[#4169E1] uppercase">
                EDITING: {formState.title}
              </span>
              <p className="text-xs text-[#303030] mt-0.5">
                Last updated: {new Date(formState.updatedAt).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 bg-white border-2 border-[#303030] p-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-xs font-bold text-[#182747]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Document Heading
                </label>
                <input
                  type="text"
                  value={formState.heading}
                  onChange={(e) => setFormState({ ...formState, heading: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-xs font-bold text-[#182747]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Body Text &amp; Paragraphs (Supports [StudentName], [Domain], [StudentId])
                </label>
                <textarea
                  rows={4}
                  value={formState.bodyText}
                  onChange={(e) => setFormState({ ...formState, bodyText: e.target.value })}
                  className="w-full px-3 py-2 bg-white border-2 border-[#303030] text-xs text-[#182747]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formState.primaryColor}
                      onChange={(e) => setFormState({ ...formState, primaryColor: e.target.value })}
                      className="w-10 h-8 border-2 border-[#303030] cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={formState.primaryColor}
                      onChange={(e) => setFormState({ ...formState, primaryColor: e.target.value })}
                      className="w-full px-2 py-1.5 border-2 border-[#303030] font-mono-data text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formState.secondaryColor}
                      onChange={(e) => setFormState({ ...formState, secondaryColor: e.target.value })}
                      className="w-10 h-8 border-2 border-[#303030] cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={formState.secondaryColor}
                      onChange={(e) => setFormState({ ...formState, secondaryColor: e.target.value })}
                      className="w-full px-2 py-1.5 border-2 border-[#303030] font-mono-data text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Font Size
                  </label>
                  <select
                    value={formState.fontSize}
                    onChange={(e) => setFormState({ ...formState, fontSize: e.target.value })}
                    className="w-full px-2 py-2 border-2 border-[#303030] text-xs bg-white"
                  >
                    <option value="10">10pt</option>
                    <option value="10.5">10.5pt</option>
                    <option value="11">11pt</option>
                    <option value="12">12pt</option>
                    <option value="13">13pt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Font Family
                  </label>
                  <select
                    value={formState.fontFamily}
                    onChange={(e) => setFormState({ ...formState, fontFamily: e.target.value })}
                    className="w-full px-2 py-2 border-2 border-[#303030] text-xs bg-white"
                  >
                    <option value="helvetica">Helvetica / Sans</option>
                    <option value="times">Times / Serif</option>
                    <option value="courier">Courier / Mono</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Text Align
                  </label>
                  <select
                    value={formState.textAlign}
                    onChange={(e) => setFormState({ ...formState, textAlign: e.target.value as any })}
                    className="w-full px-2 py-2 border-2 border-[#303030] text-xs bg-white"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Signature Name
                  </label>
                  <input
                    type="text"
                    value={formState.signatureName}
                    onChange={(e) => setFormState({ ...formState, signatureName: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#303030] text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                    Signature Title
                  </label>
                  <input
                    type="text"
                    value={formState.signatureTitle}
                    onChange={(e) => setFormState({ ...formState, signatureTitle: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#303030] text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Footer / Disclaimer Text
                </label>
                <input
                  type="text"
                  value={formState.footerText}
                  onChange={(e) => setFormState({ ...formState, footerText: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#303030] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#182747] mb-1">
                  Upload / Replace Logo / Stamp Asset
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-[#FFF8E7] border-2 border-[#303030] text-xs font-bold hover:bg-[#F4EBD0] cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image / Stamp</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {formState.logoUrl && (
                    <span className="text-xs font-mono-data text-[#4E8B62] font-bold">Logo Uploaded ✓</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t-2 border-dotted border-[#303030]/40">
                <RetroButton type="button" variant="neutral" size="sm" onClick={handleReset}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </RetroButton>

                <RetroButton type="submit" variant="success" size="lg" disabled={saving}>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'SAVING TO SUPABASE...' : 'SAVE CHANGES'}</span>
                </RetroButton>
              </div>
            </form>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between bg-[#182747] text-[#FFF8E7] px-3 py-2 border-2 border-[#303030]">
              <span className="font-mono-data text-xs font-bold flex items-center gap-1.5 text-[#F4C542]">
                <Eye className="w-4 h-4" />
                <span>LIVE PREVIEW: {formState.title}</span>
              </span>
              <span className="text-[11px] font-mono-data bg-[#F4C542] text-[#182747] px-2 py-0.5 font-bold">
                REAL-TIME
              </span>
            </div>

            <div className="border-2 border-[#303030] bg-[#f0f0f0] p-4 max-h-[750px] overflow-y-auto retro-bevel-in">
              {activeTab === 'offer_letter' && (
                <OfferLetterPreview student={sampleStudent} offerLetter={sampleOfferRecord} />
              )}
              {activeTab === 'certificate' && (
                <CertificatePreview certificate={sampleCertRecord} />
              )}
              {activeTab === 'lor' && (
                <LORPreview lor={sampleLorRecord} college={sampleStudent.college} />
              )}
            </div>
          </div>
        </div>
      </RetroWindow>

      <NotificationDialog
        open={Boolean(toastMessage)}
        title="SUPABASE_SYNC.EXE"
        message={toastMessage || ''}
        type={toastType}
        confirmLabel="OK"
        onConfirm={() => setToastMessage(null)}
      />
    </div>
  );
};
