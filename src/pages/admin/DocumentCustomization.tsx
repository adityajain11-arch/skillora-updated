import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, FileText, RefreshCw, Save, Upload, Eye, ScrollText, CheckCircle2, FileCheck } from 'lucide-react';
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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    const found =
      state.documentTemplates.find((d) => d.id === activeTab) ||
      defaultTemplates.find((d) => d.id === activeTab);
    if (found) {
      setFormState({ ...found });
      setUploadedFileName(found.logoUrl ? 'Customized_Document_Template' : null);
    }
  }, [activeTab, state.documentTemplates]);

  const handleTabChange = (tab: 'offer_letter' | 'certificate' | 'lor') => {
    navigate(`/admin/documents/${tab}`);
  };

  const handleDocumentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setToastType('error');
        setToastMessage('File size exceeds 15MB limit. Please upload a smaller PDF or image.');
        return;
      }
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setFormState((prev) => ({
          ...prev,
          logoUrl: result,
          updatedAt: new Date().toISOString(),
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
        setToastMessage(`Successfully saved uploaded document template for ${formState.title} to Supabase!`);
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
      setUploadedFileName(null);
      setToastType('success');
      setToastMessage('Reset document template to default version.');
    }
  };

  // Sample records for live preview
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
      <RetroWindow title="DOCUMENT_CUSTOMIZATION_HUB" headerColor="navy">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-dotted border-[#303030]/40">
          <div>
            <h1 className="font-pixel text-xs sm:text-sm text-[#182747]">
              ADMIN DOCUMENT TEMPLATE UPLOAD (PDF / IMAGE ONLY)
            </h1>
            <p className="text-sm text-[#303030] mt-1">
              Upload or replace official PDF documents or image design templates. Changes persist securely in Supabase.
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

        {/* Upload & Preview Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: PDF & Image Upload Space Only */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#F4EBD0] border-2 border-[#303030] p-4">
              <span className="font-pixel text-[9px] text-[#4169E1] uppercase">
                ACTIVE TEMPLATE: {formState.title}
              </span>
              <p className="text-xs text-[#303030] mt-1 leading-relaxed">
                Upload your official PDF document or high-resolution design image template. This replaces the active template and persists in Supabase.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 bg-white border-2 border-[#303030] p-5">
              <div className="border-2 border-dashed border-[#303030] p-8 text-center bg-[#FFF8E7] hover:bg-[#F4EBD0]/40 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-[#182747] mb-3" />
                <label className="block text-xs font-bold uppercase text-[#182747] cursor-pointer">
                  <span className="px-4 py-2 bg-[#182747] text-[#FFF8E7] border-2 border-[#303030] inline-block hover:bg-[#22355e] transition-colors">
                    BROWSE PDF OR IMAGE
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleDocumentFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-600 mt-3">Supports PDF, PNG, JPG (Max 15MB)</p>
                {uploadedFileName && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#4E8B62] text-white text-xs font-mono-data font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Uploaded: {uploadedFileName}</span>
                  </div>
                )}
                {formState.logoUrl && !uploadedFileName && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#4169E1] text-white text-xs font-mono-data font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>Active Template Loaded from Supabase ✓</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t-2 border-dotted border-[#303030]/40">
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
          <div className="lg:col-span-7 space-y-4">
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
              {formState.logoUrl && formState.logoUrl.startsWith('data:image/') ? (
                <div className="p-4 bg-white border-2 border-[#303030] text-center">
                  <p className="text-xs font-bold text-[#182747] mb-2">Custom Uploaded Image Template Preview:</p>
                  <img src={formState.logoUrl} alt="Uploaded Template" className="max-w-full h-auto mx-auto border border-gray-300 shadow-sm" />
                </div>
              ) : formState.logoUrl && formState.logoUrl.startsWith('data:application/pdf') ? (
                <div className="p-6 bg-white border-2 border-[#303030] text-center space-y-3">
                  <FileText className="w-16 h-16 mx-auto text-[#4169E1]" />
                  <p className="text-sm font-bold text-[#182747]">Custom PDF Document Template Loaded</p>
                  <p className="text-xs text-gray-600">The PDF is stored and ready for issuance &amp; downloading.</p>
                </div>
              ) : (
                <>
                  {activeTab === 'offer_letter' && (
                    <OfferLetterPreview student={sampleStudent} offerLetter={sampleOfferRecord} />
                  )}
                  {activeTab === 'certificate' && (
                    <CertificatePreview certificate={sampleCertRecord} />
                  )}
                  {activeTab === 'lor' && (
                    <LORPreview lor={sampleLorRecord} college={sampleStudent.college} />
                  )}
                </>
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
