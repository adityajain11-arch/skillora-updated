import React from 'react';
import { Check } from 'lucide-react';

export interface JourneyProgressProps {
  hasOfferLetter: boolean;
  totalTasks: number;
  completedTasks: number; // approved tasks
  submittedTasks: number; // submitted or approved tasks
  projectStatus?: 'NONE' | 'SUBMITTED' | 'APPROVED' | 'NEEDS REVISION';
  certificateIssued: boolean;
  lorIssued: boolean;
}

interface StepDef {
  num: string;
  title: string;
  description: string;
}

const STEPS: StepDef[] = [
  {
    num: '01',
    title: 'REGISTER FREE ONLINE',
    description: 'Complete the Skillora registration form and create your student account.',
  },
  {
    num: '02',
    title: 'CHOOSE YOUR DOMAIN',
    description: 'Select your preferred internship domain from the available options.',
  },
  {
    num: '03',
    title: 'RECEIVE OFFICIAL OFFER LETTER',
    description: 'Receive your personalized Skillora internship offer letter automatically.',
  },
  {
    num: '04',
    title: 'COMPLETE PROJECT TASKS',
    description: 'Work on real-world project tasks, follow guidelines and submit your work.',
  },
  {
    num: '05',
    title: 'EARN VERIFIED CERTIFICATE & LOR',
    description:
      'After successful project review and admin approval, receive your Certificate of Completion and Letter of Recommendation.',
  },
];

export const ProgressTracker: React.FC<JourneyProgressProps> = ({
  hasOfferLetter,
  totalTasks,
  completedTasks,
  submittedTasks,
  projectStatus = 'NONE',
  certificateIssued,
  lorIssued,
}) => {
  const isProjectApproved = projectStatus === 'APPROVED';
  const docsIssued = certificateIssued || lorIssued;

  // Determine state for each of the 5 steps
  const getStepState = (index: number): 'completed' | 'active' | 'upcoming' => {
    if (index === 0) return 'completed'; // Registered
    if (index === 1) return 'completed'; // Domain selected
    if (index === 2) return hasOfferLetter ? 'completed' : 'active';
    if (index === 3) {
      if (isProjectApproved) return 'completed';
      return hasOfferLetter ? 'active' : 'upcoming';
    }
    if (index === 4) {
      if (docsIssued) return 'completed';
      if (isProjectApproved) return 'active';
      return 'upcoming';
    }
    return 'upcoming';
  };

  // Dynamic completion percentage
  let percentage = 60; // Steps 1, 2, 3 complete upon registration + offer letter
  if (!hasOfferLetter) {
    percentage = 40;
  } else if (docsIssued) {
    percentage = 100;
  } else if (isProjectApproved) {
    percentage = 90;
  } else {
    const taskFactor =
      totalTasks > 0
        ? Math.round(((completedTasks * 1 + (submittedTasks - completedTasks) * 0.5) / totalTasks) * 18)
        : 0;
    const projectFactor = projectStatus === 'SUBMITTED' ? 10 : projectStatus === 'NEEDS REVISION' ? 5 : 0;
    percentage = Math.min(88, 60 + taskFactor + projectFactor);
  }

  const currentStepIndex = docsIssued
    ? 5
    : isProjectApproved
    ? 5
    : hasOfferLetter
    ? 4
    : 3;

  const currentStepLabel = docsIssued
    ? 'STAGE 05 COMPLETE · INTERNSHIP CREDENTIALS ISSUED'
    : `CURRENT STAGE: STEP 0${currentStepIndex} · ${STEPS[currentStepIndex - 1].title}`;

  return (
    <div className="bg-[#FFF8E7] border-2 border-[#303030] retro-shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="font-pixel text-[11px] sm:text-xs text-[#182747]">
            5-STEP INTERNSHIP JOURNEY TRACKER
          </h3>
          <p className="font-mono-data text-xs text-[#303030] mt-1">
            {currentStepLabel}
          </p>
        </div>
        <div className="font-mono-data text-sm font-bold text-[#182747] bg-[#F4EBD0] border-2 border-[#303030] px-3 py-1.5 self-start sm:self-auto">
          PROGRESS: {percentage}%
        </div>
      </div>

      {/* Desktop Horizontal Tracker */}
      <div className="hidden lg:block">
        <div className="relative grid grid-cols-5 gap-4">
          {/* Connecting line */}
          <div
            className="absolute top-6 left-[10%] right-[10%] h-1.5 bg-[#D8D0BA] border-y border-[#303030] z-0"
            aria-hidden="true"
          />
          <div
            className="absolute top-6 left-[10%] h-1.5 bg-[#4E8B62] border-y border-[#303030] z-0 transition-all duration-300"
            style={{
              width: `${
                docsIssued
                  ? 80
                  : isProjectApproved
                  ? 80
                  : hasOfferLetter
                  ? 60
                  : 40
              }%`,
            }}
            aria-hidden="true"
          />

          {STEPS.map((step, idx) => {
            const state = getStepState(idx);
            const badgeStyle =
              state === 'completed'
                ? 'bg-[#4E8B62] text-[#FFF8E7] border-[#303030]'
                : state === 'active'
                ? 'bg-[#F4C542] text-[#182747] border-[#4169E1] ring-2 ring-[#4169E1]'
                : 'bg-[#E2DAC2] text-[#5C584F] border-[#303030]';

            const cardHighlight =
              state === 'active'
                ? 'border-[#4169E1] bg-[#4169E1]/5'
                : state === 'completed'
                ? 'border-[#4E8B62]/60 bg-[#4E8B62]/5'
                : 'border-[#303030]/30 bg-[#F4EBD0]/40';

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-12 h-12 border-2 flex items-center justify-center font-pixel text-xs retro-shadow-sm ${badgeStyle}`}
                >
                  {state === 'completed' ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    step.num
                  )}
                </div>
                <div className={`mt-3 p-3 border-2 w-full flex-1 flex flex-col ${cardHighlight}`}>
                  <div className="font-mono-data text-[10px] font-bold tracking-wider uppercase text-[#4169E1]">
                    STEP {step.num} · {state.toUpperCase()}
                  </div>
                  <h4 className="text-xs font-bold text-[#182747] mt-1 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#303030] mt-1.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Vertical Timeline */}
      <div className="lg:hidden space-y-3">
        {STEPS.map((step, idx) => {
          const state = getStepState(idx);
          const badgeStyle =
            state === 'completed'
              ? 'bg-[#4E8B62] text-[#FFF8E7] border-[#303030]'
              : state === 'active'
              ? 'bg-[#F4C542] text-[#182747] border-[#4169E1]'
              : 'bg-[#E2DAC2] text-[#5C584F] border-[#303030]';

          return (
            <div
              key={step.num}
              className="flex items-start gap-3.5 p-3 border-2 border-[#303030] bg-[#F4EBD0]/50"
            >
              <div
                className={`w-10 h-10 border-2 flex items-center justify-center font-pixel text-[10px] shrink-0 ${badgeStyle}`}
              >
                {state === 'completed' ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono-data text-[10px] font-bold uppercase text-[#4169E1]">
                  STEP {step.num} · {state}
                </div>
                <h4 className="text-xs font-bold text-[#182747] mt-0.5">{step.title}</h4>
                <p className="text-xs text-[#303030] mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retro Segmented Progress Bar */}
      <div className="mt-5 pt-4 border-t-2 border-dotted border-[#303030]/40">
        <div className="flex items-center justify-between text-xs font-mono-data font-bold text-[#182747] mb-1.5">
          <span>OVERALL JOURNEY COMPLETION</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full h-5 bg-[#F4EBD0] border-2 border-[#303030] p-0.5">
          <div
            className="h-full bg-[#4E8B62] transition-all duration-300 flex items-center justify-end pr-1.5"
            style={{ width: `${percentage}%` }}
          >
            {percentage >= 25 && (
              <span className="font-mono-data text-[10px] font-bold text-[#FFF8E7]">
                {percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
