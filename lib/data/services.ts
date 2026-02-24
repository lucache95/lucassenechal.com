/**
 * Service definitions for the consulting funnel.
 *
 * Single source of truth for the 4 services offered.
 * Used by:
 *   - components/homepage/what-i-build.tsx (card grid)
 *   - components/consulting/service-grid.tsx (consulting page cards)
 *   - app/(marketing)/services/[slug]/page.tsx (individual service pages)
 *   - lib/schemas/business-plan.ts (recommendedService enum)
 *   - AI plan generation (service matching)
 *
 * The id field matches the recommendedService enum in business-plan.ts.
 */

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  longDescription: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  whatItIs: string;
  howItWorks: string;
  whoItsFor: string;
  whatsIncluded: string[];
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
}

export const SERVICES: Service[] = [
  {
    id: 'ai-automation',
    icon: '\u2699\uFE0F',
    title: 'AI Automation',
    description: 'Turn repetitive workflows into AI-powered systems that run themselves.',
    longDescription:
      'Custom AI agents and automation pipelines built for your specific workflows. From lead follow-ups to data entry to report generation, I design systems that handle the busywork so your team can focus on revenue.',
    metaTitle: 'AI Automation Services | Lucas Senechal',
    metaDescription:
      'Custom AI agents and automation pipelines built for your workflows. From lead follow-ups to report generation — systems that handle the busywork so you focus on revenue.',
    tagline: 'Custom AI systems that handle the busywork so your team focuses on revenue.',
    whatItIs:
      'AI Automation is the process of designing, building, and deploying custom AI-powered systems that handle repetitive tasks in your business. These are not off-the-shelf chatbots — they are purpose-built pipelines that connect to your existing tools, understand your specific workflows, and execute multi-step processes autonomously.\n\nThink of it as hiring a tireless employee who never misses a step, works 24/7, and gets faster over time. From processing incoming leads and drafting personalized follow-ups, to extracting data from documents and updating your CRM, to generating weekly reports from raw data — these systems replace the manual work that drains your team\'s time and energy.',
    howItWorks:
      'The process starts with a workflow audit. I sit with your team, document every step of the processes you want to automate, and identify where AI adds value versus where simple automation suffices. Not everything needs AI — sometimes a well-designed Zapier flow is the right answer.\n\nOnce we agree on the scope, I build the system iteratively. You see working prototypes within the first week, not after months of development. Each iteration gets your feedback and refines the behavior until the system handles edge cases the way your best employee would.\n\nDeployment includes monitoring dashboards so you can see what the system is doing, error handling for when things go wrong, and a human-in-the-loop option for decisions that require judgment. I don\'t hand off a black box — you understand exactly what\'s running and why.',
    whoItsFor:
      'This service is built for small to mid-sized businesses (5–200 employees) that have outgrown manual processes but are not ready to hire a full engineering team. You are a good fit if your team spends more than 10 hours per week on repetitive data processing, follow-ups, reporting, or coordination tasks.\n\nCommon clients include agencies managing multiple client accounts, e-commerce businesses processing orders and customer inquiries, professional services firms handling document workflows, and sales teams drowning in manual CRM updates.',
    whatsIncluded: [
      'Workflow audit and automation roadmap',
      'Custom AI agent development and testing',
      'Integration with your existing tools (CRM, email, databases)',
      'Monitoring dashboard with real-time status',
      'Error handling and human-in-the-loop fallbacks',
      '30 days of post-launch support and tuning',
      'Documentation and training for your team',
    ],
    faqs: [
      {
        question: 'How long does a typical AI automation project take?',
        answer:
          'Most projects go from kickoff to production in 2–6 weeks, depending on complexity. Simple single-workflow automations (like lead follow-up) can be live in under 2 weeks. Multi-system integrations with complex logic typically take 4–6 weeks.',
      },
      {
        question: 'What if the AI makes a mistake?',
        answer:
          'Every system includes error handling and monitoring. For high-stakes decisions, I build in human-in-the-loop checkpoints where the AI flags items for your team to review. The system learns from corrections over time, reducing errors with each iteration.',
      },
      {
        question: 'What tools and platforms do you work with?',
        answer:
          'I build with the best tool for the job. Common stack includes Claude AI and GPT for language tasks, n8n and custom Node.js for orchestration, Supabase for data storage, and direct API integrations with whatever tools you already use (Salesforce, HubSpot, Slack, Google Workspace, etc.).',
      },
      {
        question: 'How much does AI automation cost?',
        answer:
          'Projects typically range from $5,000 to $25,000 depending on scope and complexity. I provide a detailed proposal with fixed pricing after the initial workflow audit. The ROI usually pays for the project within 2–3 months through time savings alone.',
      },
    ],
    relatedServices: ['process-consulting', 'ongoing-management'],
  },
  {
    id: 'process-consulting',
    icon: '\uD83D\uDCCB',
    title: 'Process Consulting',
    description: 'Audit your operations and design the automation roadmap.',
    longDescription:
      'A deep-dive audit of your current operations to identify where AI fits and where it doesn\'t. You get a prioritized roadmap with estimated ROI, so you know exactly what to build first and why.',
    metaTitle: 'Process Consulting & AI Readiness Audit | Lucas Senechal',
    metaDescription:
      'Deep-dive operations audit to identify where AI automation fits your business. Get a prioritized roadmap with ROI estimates — know exactly what to build first.',
    tagline: 'Find where AI fits your business — and where it doesn\'t — before spending a dollar on development.',
    whatItIs:
      'Process Consulting is a structured engagement where I audit your current business operations and deliver a clear roadmap for where AI automation will (and won\'t) create value. Too many businesses jump straight to building AI systems without understanding which processes are actually worth automating. This engagement prevents wasted development spend.\n\nYou get a prioritized list of automation opportunities ranked by ROI, implementation difficulty, and business impact. For each opportunity, I provide a realistic estimate of development time, ongoing costs, and expected time savings. The deliverable is a document your team can execute against — whether with me or on your own.',
    howItWorks:
      'The engagement runs over 1–2 weeks. In the first phase, I conduct interviews with your team members who handle the day-to-day work. Not executives guessing at workflows — the people actually doing the tasks. I document every step, bottleneck, and workaround.\n\nIn the second phase, I analyze the documented workflows against what\'s technically feasible with current AI capabilities. Some processes are perfect for automation. Others look automatable but have edge cases that make them impractical. I\'m honest about the difference.\n\nThe final deliverable is a roadmap document with 3 tiers: quick wins (implementable in 1–2 weeks, high ROI), strategic projects (4–8 weeks, transformative impact), and future opportunities (dependent on technology maturation or business growth). Each item includes a cost estimate, expected ROI, and recommended implementation approach.',
    whoItsFor:
      'This service is ideal for business owners and operations leaders who know they should be using AI but aren\'t sure where to start. If you\'ve been overwhelmed by vendor pitches, confused by the hype, or burned by a failed automation attempt, this engagement gives you clarity.\n\nIt\'s also valuable for companies that have already automated some processes but want an outside perspective on what to tackle next. Sometimes the biggest opportunities are in workflows you\'ve stopped questioning because "that\'s how we\'ve always done it."',
    whatsIncluded: [
      'Team interviews and workflow documentation',
      'Current-state process mapping',
      'AI feasibility analysis for each workflow',
      'Prioritized automation roadmap (3 tiers)',
      'ROI estimates for each automation opportunity',
      'Technology stack recommendations',
      'Executive summary presentation',
    ],
    faqs: [
      {
        question: 'How is this different from hiring a management consultant?',
        answer:
          'Traditional consultants deliver strategy decks. I deliver an actionable technical roadmap with specific tools, timelines, and cost estimates. I\'ve built the systems I\'m recommending, so the roadmap is grounded in implementation reality, not theory.',
      },
      {
        question: 'Do I have to hire you to implement the roadmap?',
        answer:
          'No. The roadmap is designed to be executed by anyone — your internal team, another contractor, or me. Many clients choose to implement quick wins with me and handle the rest internally. There\'s no lock-in.',
      },
      {
        question: 'What if you find that AI isn\'t right for my business?',
        answer:
          'Then I\'ll tell you that. It happens. Some businesses are better served by simpler automation tools, hiring an additional team member, or fixing process issues that have nothing to do with technology. Honesty about fit is more valuable than selling a project that won\'t deliver.',
      },
      {
        question: 'How much does a process consulting engagement cost?',
        answer:
          'The standard engagement is $3,000–$8,000 depending on the size of your organization and the number of workflows to evaluate. For businesses with fewer than 20 employees and straightforward operations, it\'s typically at the lower end.',
      },
    ],
    relatedServices: ['ai-automation', 'training'],
  },
  {
    id: 'ongoing-management',
    icon: '\uD83D\uDD04',
    title: 'Ongoing Management',
    description: 'Keep your AI systems running, improving, and scaling with you.',
    longDescription:
      'Monthly retainer to monitor, maintain, and improve your AI systems as your business evolves. Includes performance tuning, new integrations, and adapting workflows when your processes change.',
    metaTitle: 'Ongoing AI Management & Optimization | Lucas Senechal',
    metaDescription:
      'Monthly retainer to keep your AI systems running, improving, and scaling. Performance tuning, new integrations, and workflow adaptations as your business evolves.',
    tagline: 'Your AI systems maintained, optimized, and scaled — without hiring a full-time engineer.',
    whatItIs:
      'Ongoing Management is a monthly retainer that keeps your AI automation systems running at peak performance. AI systems are not "set it and forget it" — they need monitoring, tuning, and adaptation as your business evolves, data patterns shift, and AI models improve.\n\nThink of it as a fractional AI engineer on your team. I monitor system performance, fix issues before they become problems, integrate new tools as your needs grow, and update workflows when your processes change. You get the benefits of having a dedicated AI specialist without the $150k+ salary.',
    howItWorks:
      'Each month includes a set number of hours (typically 10–20) dedicated to your systems. I monitor automated dashboards for performance degradation, error rates, and unusual patterns. When something needs attention, I handle it proactively — you usually don\'t even know there was an issue.\n\nBeyond maintenance, the retainer includes strategic improvement work. As AI models improve (and they improve fast), I update your systems to take advantage of new capabilities. When you launch a new product line or change a process, I adapt the automation to match.\n\nYou get a monthly report showing system performance, tasks completed, issues resolved, and recommendations for the next month. We have a standing weekly or biweekly check-in to discuss priorities.',
    whoItsFor:
      'This service is for businesses that have already built AI automation systems (with me or someone else) and need reliable ongoing support. If you don\'t have an in-house engineer comfortable with AI systems, this retainer fills that gap.\n\nIt\'s particularly valuable for businesses where the AI systems are revenue-critical — handling customer inquiries, processing orders, or generating reports that leadership relies on. Downtime or degraded performance costs real money, and having someone proactively managing the systems prevents that.',
    whatsIncluded: [
      'Proactive system monitoring and alerting',
      'Performance tuning and optimization',
      'Bug fixes and error resolution',
      'New integrations and workflow additions',
      'AI model updates as capabilities improve',
      'Monthly performance report',
      'Weekly or biweekly strategy check-in',
      'Priority response for urgent issues',
    ],
    faqs: [
      {
        question: 'What happens if something breaks outside business hours?',
        answer:
          'Monitoring runs 24/7 and I receive alerts for critical failures. For urgent production issues, I respond within 2 hours regardless of time. Non-critical issues are addressed during the next business day. Most clients never experience a critical failure because proactive monitoring catches issues early.',
      },
      {
        question: 'Can I pause or cancel the retainer?',
        answer:
          'Yes. The retainer is month-to-month with 30 days notice. If your needs change or you bring the work in-house, you can cancel anytime. I provide full documentation and handoff support to ensure a smooth transition.',
      },
      {
        question: 'What does the monthly retainer cost?',
        answer:
          'Retainers range from $2,000 to $8,000 per month depending on the number of systems, complexity, and hours required. Most small businesses with 2–3 automated workflows are in the $2,000–$4,000 range.',
      },
      {
        question: 'Do unused hours roll over?',
        answer:
          'Hours don\'t roll over month-to-month, but I\'m flexible. If a quiet month is followed by a busy one, I accommodate the variance without nickel-and-diming. The retainer is about partnership, not billable-hour tracking.',
      },
    ],
    relatedServices: ['ai-automation', 'process-consulting'],
  },
  {
    id: 'training',
    icon: '\uD83C\uDF93',
    title: 'Training & Enablement',
    description: 'Get your team confident building and working alongside AI.',
    longDescription:
      'Hands-on training sessions tailored to your team\'s tools and workflows. From prompt engineering basics to building internal AI tools, your team leaves confident and self-sufficient.',
    metaTitle: 'AI Training & Team Enablement | Lucas Senechal',
    metaDescription:
      'Hands-on AI training for your team — from prompt engineering to building internal tools. Tailored to your workflows, tools, and skill level.',
    tagline: 'Hands-on AI training tailored to your team\'s tools, workflows, and skill level.',
    whatItIs:
      'Training & Enablement is a hands-on program that gets your team confident and productive with AI tools. Not a generic "intro to ChatGPT" webinar — this is training built around your team\'s actual tools, workflows, and challenges.\n\nThe program covers everything from foundational prompt engineering (getting reliable, high-quality outputs from AI models) to building internal tools with no-code AI platforms. Every session uses real examples from your business, so the skills transfer immediately to daily work. Your team leaves not just knowing what AI can do, but knowing how to use it for their specific job.',
    howItWorks:
      'I start with a skills assessment to understand where your team is today and where they need to be. Some teams need basics — how to write effective prompts, when to use AI versus when not to. Others are ready for advanced topics like building AI-powered workflows or evaluating AI vendors.\n\nTraining is delivered in focused 2–3 hour sessions over 1–4 weeks, depending on scope. Each session combines instruction with hands-on exercises using your actual tools and data. Participants build something real in every session — not hypothetical exercises.\n\nAfter the formal training, I provide 30 days of async support via Slack or email. Your team can ask questions as they apply what they learned, and I help troubleshoot real-world challenges that come up.',
    whoItsFor:
      'This service is for teams that want to adopt AI effectively without relying on an external contractor for everything. If you want your team to be self-sufficient with AI tools — using them daily, building simple automations, and knowing when to call in specialist help — this training gets them there.\n\nCommon clients include marketing teams wanting to use AI for content and analysis, operations teams exploring workflow automation, sales teams adopting AI-powered outreach, and leadership teams that need to understand AI capabilities for strategic planning.',
    whatsIncluded: [
      'Pre-training skills assessment',
      'Customized curriculum based on your tools and workflows',
      '2–3 hour hands-on sessions (4–8 sessions typical)',
      'Real-world exercises using your business data',
      'Session recordings for future reference',
      'Reference guides and prompt templates',
      '30 days of post-training async support',
    ],
    faqs: [
      {
        question: 'How technical does my team need to be?',
        answer:
          'No technical background required. I\'ve trained everyone from executive assistants to senior engineers. The curriculum adapts to your team\'s starting level. The goal is practical competence, not computer science theory.',
      },
      {
        question: 'Can the training be done remotely?',
        answer:
          'Yes. Most training is delivered via Zoom with screen sharing and real-time collaboration. I also offer in-person sessions for teams in the Bay Area. Remote sessions are recorded so team members who miss a session can catch up.',
      },
      {
        question: 'How many people can participate?',
        answer:
          'Training works best with groups of 4–15 people. Smaller groups get more individual attention. Larger groups (15–30) work for lecture-style sessions but hands-on exercises are less effective. For organizations with 30+ people, I recommend splitting into cohorts.',
      },
      {
        question: 'What does training cost?',
        answer:
          'Training programs range from $2,500 (half-day intensive for a small team) to $15,000 (multi-week comprehensive program). Most teams invest $5,000–$8,000 for a complete program with follow-up support.',
      },
    ],
    relatedServices: ['process-consulting', 'ai-automation'],
  },
];

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getAllServices(): Service[] {
  return SERVICES;
}

export function getAllServiceSlugs(): string[] {
  return SERVICES.map((s) => s.id);
}
