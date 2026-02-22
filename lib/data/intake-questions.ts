/**
 * Curated intake question library for the consulting funnel.
 *
 * AI selects the next question from this pool -- it never invents
 * questions. Each question includes an aiContext hint to guide the
 * AI's selection logic and a priority for deterministic fallback
 * ordering when AI latency exceeds the 2-second threshold.
 *
 * Categories map to WORK-04 requirements:
 *   business, workflow, stack, scope, pain, timeline, deep
 *
 * Constants enforce hard caps per user constraints:
 *   MIN_QUESTIONS  = 6   (minimum before "Generate plan now" appears)
 *   STAGE_1_CAP    = 12  (hard cap for initial questions)
 *   DEEP_DIVE_CAP  = 8   (hard cap for deep-dive continuation)
 */

export interface IntakeQuestion {
  id: string;
  category: 'business' | 'workflow' | 'stack' | 'scope' | 'pain' | 'timeline' | 'deep';
  text: string;
  inputType: 'buttons' | 'text' | 'slider' | 'multi-select';
  options?: string[];
  sliderConfig?: { min: number; max: number; step: number; labels: [string, string] };
  isRequired: boolean;
  isDeepDive: boolean;
  priority: number;
  aiContext: string;
}

// ── Core questions (isDeepDive = false) ────────────────────────────

const coreQuestions: IntakeQuestion[] = [
  // business
  {
    id: 'business-type',
    category: 'business',
    text: 'What does your business do?',
    inputType: 'text',
    isRequired: true,
    isDeepDive: false,
    priority: 1,
    aiContext: 'Always ask first. Establishes context for all follow-up questions.',
  },
  {
    id: 'team-size',
    category: 'business',
    text: 'How big is your team?',
    inputType: 'buttons',
    options: ['Just me', '2-5', '6-20', '21-50', '50+'],
    isRequired: true,
    isDeepDive: false,
    priority: 2,
    aiContext: 'Determines scale of automation needed. Ask early to scope the engagement.',
  },

  // workflow
  {
    id: 'time-consuming-workflow',
    category: 'workflow',
    text: 'Which workflow eats the most time?',
    inputType: 'text',
    isRequired: true,
    isDeepDive: false,
    priority: 3,
    aiContext: 'Identifies the primary workflow to target. Critical for plan specificity.',
  },
  {
    id: 'current-handling',
    category: 'workflow',
    text: 'How do you currently handle that workflow?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: false,
    priority: 5,
    aiContext: 'Follow-up to time-consuming-workflow. Reveals manual steps and pain points.',
  },

  // stack
  {
    id: 'daily-tools',
    category: 'stack',
    text: 'What tools does your team use daily?',
    inputType: 'multi-select',
    options: ['Slack', 'Teams', 'Gmail', 'Sheets', 'Salesforce', 'HubSpot', 'Notion', 'Other'],
    isRequired: false,
    isDeepDive: false,
    priority: 6,
    aiContext: 'Maps the existing tech stack for integration planning. Ask after understanding the workflow.',
  },
  {
    id: 'automation-experience',
    category: 'stack',
    text: 'Do you use any automation tools today?',
    inputType: 'buttons',
    options: ['Yes, actively', 'Tried but failed', 'No', 'Not sure'],
    isRequired: false,
    isDeepDive: false,
    priority: 8,
    aiContext: 'Gauges automation maturity. "Tried but failed" signals need for managed service.',
  },

  // scope
  {
    id: 'definition-of-done',
    category: 'scope',
    text: "What would 'done' look like for this project?",
    inputType: 'text',
    isRequired: false,
    isDeepDive: false,
    priority: 7,
    aiContext: 'Captures success criteria. Helps frame the plan output around their expectations.',
  },
  {
    id: 'workflow-users',
    category: 'scope',
    text: 'How many people touch this workflow daily?',
    inputType: 'slider',
    sliderConfig: { min: 1, max: 50, step: 1, labels: ['Just me', '50+ people'] },
    isRequired: false,
    isDeepDive: false,
    priority: 10,
    aiContext: 'Determines blast radius of changes. Higher count = more change management needed.',
  },

  // pain
  {
    id: 'biggest-bottleneck',
    category: 'pain',
    text: "What's the biggest bottleneck in your current process?",
    inputType: 'text',
    isRequired: true,
    isDeepDive: false,
    priority: 4,
    aiContext: 'Core pain point. Drives bottleneck diagnosis section in the business plan.',
  },
  {
    id: 'hours-per-week',
    category: 'pain',
    text: 'How many hours per week does your team spend on this?',
    inputType: 'slider',
    sliderConfig: { min: 1, max: 40, step: 1, labels: ['1 hour', '40+ hours'] },
    isRequired: false,
    isDeepDive: false,
    priority: 9,
    aiContext: 'Quantifies the pain. High hours = strong ROI case for automation.',
  },
  {
    id: 'process-failure-impact',
    category: 'pain',
    text: 'What happens when this process breaks?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: false,
    priority: 11,
    aiContext: 'Reveals consequences and urgency. Useful for risk section of the plan.',
  },

  // timeline
  {
    id: 'timeline-need',
    category: 'timeline',
    text: 'When do you need this running?',
    inputType: 'buttons',
    options: ['ASAP', '1-2 months', '3-6 months', 'No rush'],
    isRequired: false,
    isDeepDive: false,
    priority: 12,
    aiContext: 'Sets implementation timeline expectations. ASAP signals urgency pricing.',
  },
  {
    id: 'budget-range',
    category: 'timeline',
    text: 'Do you have a budget range in mind?',
    inputType: 'buttons',
    options: ['Under $5K', '$5-15K', '$15-50K', '$50K+', 'Not sure'],
    isRequired: false,
    isDeepDive: false,
    priority: 13,
    aiContext: 'Aligns estimate with expectations. Ask late -- after value is established.',
  },
];

// ── Deep-dive questions (isDeepDive = true) ────────────────────────

const deepDiveQuestions: IntakeQuestion[] = [
  {
    id: 'data-location',
    category: 'deep',
    text: 'Where does data currently live?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: true,
    priority: 14,
    aiContext: 'Maps data sources for integration architecture. Important for system design.',
  },
  {
    id: 'reporting-stack',
    category: 'deep',
    text: 'What does your reporting/metrics stack look like?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: true,
    priority: 15,
    aiContext: 'Identifies reporting requirements and existing analytics infrastructure.',
  },
  {
    id: 'stakeholders',
    category: 'deep',
    text: 'Who are the stakeholders for this project?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: true,
    priority: 16,
    aiContext: 'Reveals decision-making dynamics and potential blockers to implementation.',
  },
  {
    id: 'previous-attempts',
    category: 'deep',
    text: "What's been tried before that didn't work?",
    inputType: 'text',
    isRequired: false,
    isDeepDive: true,
    priority: 17,
    aiContext: 'Avoids recommending failed approaches. Shows awareness of their history.',
  },
  {
    id: 'compliance-requirements',
    category: 'deep',
    text: 'Are there compliance or security requirements?',
    inputType: 'buttons',
    options: ['HIPAA', 'SOC2', 'GDPR', 'PCI', 'None', 'Not sure'],
    isRequired: false,
    isDeepDive: true,
    priority: 18,
    aiContext: 'Critical for architecture decisions. Compliance constraints affect tool selection.',
  },
  {
    id: 'six-month-success',
    category: 'deep',
    text: 'What does success look like in 6 months?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: true,
    priority: 19,
    aiContext: 'Long-term vision. Helps differentiate one-time build vs ongoing management recommendation.',
  },
  {
    id: 'team-handoffs',
    category: 'deep',
    text: 'How do you handle handoffs between team members?',
    inputType: 'text',
    isRequired: false,
    isDeepDive: true,
    priority: 20,
    aiContext: 'Reveals coordination overhead. Often the hidden cost in manual workflows.',
  },
];

// ── Exports ────────────────────────────────────────────────────────

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  ...coreQuestions,
  ...deepDiveQuestions,
];

/** Minimum questions before "Generate plan now" CTA appears */
export const MIN_QUESTIONS = 6;

/** Hard cap for Stage 1 (core) questions */
export const STAGE_1_CAP = 12;

/** Hard cap for deep-dive continuation questions */
export const DEEP_DIVE_CAP = 8;
