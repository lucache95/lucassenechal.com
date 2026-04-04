/**
 * Service definitions for the consulting funnel.
 *
 * Single source of truth for the 8 services offered.
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
  pricing: string;
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
    pricing: '$5,000–$25,000 per project',
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
    pricing: '$3,000–$8,000 per engagement',
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
    pricing: '$2,000–$8,000/month retainer',
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
    pricing: '$2,500–$15,000 per program',
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
  {
    id: 'ai-implementation',
    icon: '🔌',
    title: 'AI Implementation',
    description:
      'Connect AI to your business data — files, docs, CRM, history — so your team can ask questions and get instant answers.',
    longDescription:
      'Install and configure AI tools (Claude, ChatGPT, custom agents) connected to your internal business data, so your team gets accurate answers from your own documents instantly.',
    metaTitle: 'AI Implementation Services | Lucas Senechal',
    metaDescription:
      'Get AI connected to your business data — files, docs, CRM. Your team asks questions, AI answers from your own documents. Setup from $2,000.',
    tagline:
      'Connect AI to your business data — files, docs, CRM, history — so your team can ask questions and get instant answers.',
    pricing: '$2,000–$5,000 setup + $500–$1,000/month',
    whatItIs:
      'AI Implementation is installing AI that actually knows YOUR business — not a generic chatbot that gives Wikipedia answers. I connect tools like Claude, ChatGPT, or local AI models directly to your internal files, documents, policies, CRM history, and knowledge bases. When an employee asks a question, the AI answers using your company\'s actual data.\n\nThis is the difference between "AI that sounds smart" and "AI that IS smart about your business." A law firm\'s AI knows the firm\'s precedent library. A real estate brokerage\'s AI knows every listing, every comparable, every market report. A medical practice\'s AI knows billing codes, insurance policies, and patient intake protocols. Based in Kelowna, BC, I work with businesses across Canada and the US to deploy these systems using Claude, OpenAI, Google Workspace integrations, and local AI setups for sensitive data.',
    howItWorks:
      'The process starts with a data audit. I map out where your business knowledge lives — Google Drive, SharePoint, Dropbox, CRM records, email templates, internal wikis, SOPs. Then I structure that data so AI can access it efficiently, because raw file dumps produce garbage answers.\n\nNext, I select and configure the right AI tool for your use case. Claude for nuanced document analysis, OpenAI for broad general knowledge, or a local model for data that cannot leave your network. I connect the AI to your data sources via APIs, build access controls so different teams see different data, and configure the interface — whether that\'s a Slack bot, a web portal, or an integration inside your existing CRM like HubSpot or Salesforce.\n\nFinally, I test the system with real questions your team actually asks, train your staff on how to get the best results, and provide 30 days of support to handle the edge cases that always surface in the first month.',
    whoItsFor:
      'Small to mid-sized businesses that have valuable internal knowledge locked in files, emails, and documents that nobody can find quickly. If your team wastes hours searching for information that exists somewhere in your systems, this service eliminates that problem.\n\nCommon clients include law firms drowning in case files and precedent research, agencies managing playbooks across dozens of client accounts, real estate brokerages that need instant access to market data and comparables, medical practices navigating complex billing and insurance documentation, and any business where the answer exists — it just takes too long to find.',
    whatsIncluded: [
      'Data audit and structure plan',
      'AI tool selection and configuration (Claude, OpenAI, or local models)',
      'Connection to your files, folders, CRM, and knowledge bases',
      'Access controls setup (team-level permissions)',
      'Custom interface (Slack bot, web portal, or CRM integration)',
      'Team training session (hands-on, using real questions)',
      '30 days of post-launch support and tuning',
    ],
    faqs: [
      {
        question: 'Is my data secure? Will AI send my business data to third parties?',
        answer:
          'Security is the first thing I address in every implementation. For most businesses, I use enterprise-tier AI APIs (Claude or OpenAI) that do not train on your data and comply with SOC 2 standards. For businesses with strict data residency requirements — legal, medical, financial — I deploy local AI models that never send data outside your network. Every implementation includes access controls so only authorized team members can query specific data sets.',
      },
      {
        question: 'What AI tools do you use for implementation?',
        answer:
          'I select the best tool for your specific use case. Claude (by Anthropic) excels at nuanced document analysis and long-form reasoning. OpenAI\'s GPT models are strong for broad general knowledge and quick answers. For sensitive data that cannot leave your network, I deploy local models using Ollama or similar frameworks. Integration tools include n8n for orchestration, Supabase for vector storage, and direct API connections to Google Workspace, HubSpot, Salesforce, and Slack.',
      },
      {
        question: 'How long does AI implementation take?',
        answer:
          'Most implementations go from kickoff to production in 2–4 weeks. The first week covers data audit and structuring. Week two handles AI configuration and data connection. Weeks three and four are testing, training, and refinement. Larger organizations with complex data landscapes or multiple departments may need 4–6 weeks.',
      },
      {
        question: 'How much does AI implementation cost?',
        answer:
          'Setup ranges from $2,000 to $5,000 depending on the complexity of your data sources and the number of integrations required. Ongoing maintenance and AI API costs run $500 to $1,000 per month. A small business connecting AI to Google Drive and a CRM is typically at the lower end. Enterprises with multiple data sources and custom access controls are at the higher end.',
      },
    ],
    relatedServices: ['ai-automation', 'ongoing-management'],
  },
  {
    id: 'chatbot-development',
    icon: '💬',
    title: 'AI Chatbot Development',
    description:
      'Industry-specific AI chatbots that handle client intake, answer questions, and qualify leads — built once for your vertical, deployed fast.',
    longDescription:
      'Purpose-built AI chatbots for specific industries — dental offices, law firms, real estate agencies, insurance brokers. Handles FAQs, appointment scheduling, lead qualification, and intake — without a human touching it.',
    metaTitle: 'AI Chatbot Development | Lucas Senechal',
    metaDescription:
      'Custom AI chatbots for dental, legal, real estate, and insurance. Handle intake, FAQs, scheduling, and lead qualification 24/7. From $3,000 setup.',
    tagline:
      'Industry-specific AI chatbots that handle client intake, answer questions, and qualify leads — built once for your vertical, deployed fast.',
    pricing: '$3,000–$8,000 setup + $500/month',
    whatItIs:
      'This is not a generic chatbot that says "I\'m sorry, I didn\'t understand that" after two messages. I build AI chatbots purpose-designed for specific industries with the exact questions your clients ask, the workflows your staff follows, and tight integration into your existing tools.\n\nA dental office chatbot knows your services, insurance networks, and scheduling availability — it books appointments, answers "do you accept Delta Dental?", and collects patient intake forms before the visit. A law firm chatbot qualifies potential clients by asking the right screening questions, captures case details, and routes qualified leads to the appropriate attorney. These chatbots are trained on your specific business data using Claude or OpenAI, integrated with your CRM (HubSpot, Salesforce, or industry-specific tools like Clio or Dentrix), and deployed on your website, Facebook Messenger, or SMS.',
    howItWorks:
      'I start with an industry analysis. What questions do your clients ask most? What\'s your intake workflow? What qualifies a good lead versus a time-waster? This isn\'t generic research — I study your actual call logs, intake forms, and FAQ pages.\n\nThen I design the conversation flows. Not a rigid decision tree — a flexible AI-powered dialogue that handles the messy way real people communicate. The chatbot understands context, asks follow-up questions, and knows when to hand off to a human.\n\nI build and integrate the chatbot with your existing tools: calendar systems (Cal.com, Google Calendar, Calendly) for scheduling, CRM (HubSpot, Salesforce, Clio) for lead capture, and your website or messaging platforms for deployment. Testing happens with real scenarios from your business — not hypothetical examples.\n\nAfter launch, I monitor conversations for the first 30 days, identify gaps in the chatbot\'s knowledge, and refine responses. Monthly performance reports show you exactly how many leads were captured, appointments booked, and questions handled without human intervention.',
    whoItsFor:
      'High-volume service businesses that answer the same questions hundreds of times a week. If your front desk staff spends more time answering "what are your hours?" and "do you accept my insurance?" than doing productive work, this chatbot handles it.\n\nIdeal industries include dental offices and medical practices (patient intake, insurance verification, appointment scheduling), law firms (client screening, case type qualification, consultation booking), real estate agencies (property inquiries, showing scheduling, buyer/seller qualification), insurance brokers (policy questions, quote requests, claims intake), and home services companies (service inquiries, estimate scheduling, emergency triage).',
    whatsIncluded: [
      'Industry-specific conversation flow design',
      'Custom AI training on your services, policies, and procedures',
      'CRM integration (HubSpot, Salesforce, Clio, Dentrix, etc.)',
      'Calendar and scheduling integration',
      'Lead capture and qualification logic',
      'Escalation pathways to human staff',
      'Website, SMS, or Messenger deployment',
      'Monthly performance report (leads captured, questions handled, bookings made)',
    ],
    faqs: [
      {
        question: 'Which industries do you build chatbots for?',
        answer:
          'I specialize in high-volume service businesses: dental offices, law firms, real estate agencies, insurance brokers, medical practices, and home services companies. These industries share a common pattern — a high volume of repetitive inquiries that follow predictable patterns, making them ideal for AI automation. If your industry involves regular client intake and FAQ handling, the approach translates directly.',
      },
      {
        question: 'Will the chatbot integrate with my existing tools and CRM?',
        answer:
          'Yes. Every chatbot I build integrates directly with your existing tech stack. Common integrations include HubSpot, Salesforce, and Clio for CRM; Google Calendar, Cal.com, and Calendly for scheduling; Dentrix and Open Dental for dental practices; and your website platform (WordPress, Squarespace, Webflow, or custom). I use n8n and direct API connections to ensure data flows seamlessly between the chatbot and your systems.',
      },
      {
        question: 'What happens when the AI chatbot cannot answer a question?',
        answer:
          'Every chatbot includes escalation logic. When the AI encounters a question outside its training, it acknowledges the limitation honestly, captures the person\'s contact information and question, and routes it to the appropriate human team member via email, Slack, or your CRM\'s task system. The handoff is seamless — the human receives the full conversation context so the client does not have to repeat themselves.',
      },
      {
        question: 'How much does an AI chatbot cost?',
        answer:
          'Setup ranges from $3,000 to $8,000 depending on the complexity of conversation flows, number of integrations, and whether you need multi-channel deployment (website + SMS + Messenger). Ongoing costs are approximately $500 per month covering AI API usage, monitoring, and monthly refinements. A single-channel chatbot with one CRM integration is at the lower end. Multi-channel deployment with complex qualification logic is at the higher end.',
      },
    ],
    relatedServices: ['ai-automation', 'ongoing-management'],
  },
  {
    id: 'content-operations',
    icon: '📣',
    title: 'AI Content Operations',
    description:
      'Automated content pipelines that keep you posting consistently — social media, email newsletters, and blog content — without it consuming your week.',
    longDescription:
      'End-to-end content automation: research, draft, edit, schedule, and post. AI-powered pipelines that keep your brand active on every channel while you focus on running the business.',
    metaTitle: 'AI Content Operations | Lucas Senechal',
    metaDescription:
      'Automated content pipelines for social media, newsletters, and blogs. AI researches, drafts, and schedules — you review and approve. From $1,500/month.',
    tagline:
      'Automated content pipelines that keep you posting consistently — social media, email newsletters, and blog content — without it consuming your week.',
    pricing: '$1,500–$3,000/month retainer',
    whatItIs:
      'AI Content Operations is a systemized content pipeline — not a one-time post generator that spits out generic LinkedIn fluff. This is an ongoing operation that researches trending topics in your industry, drafts posts and emails in your brand voice, queues them for your review, and publishes on schedule across every channel.\n\nBuilt for businesses that know they should be creating content but never have time. The pipeline uses Claude and GPT for drafting, n8n for orchestration, and connects to your publishing platforms (LinkedIn, Twitter/X, Instagram, Mailchimp, ConvertKit, WordPress, Ghost). Every piece of content goes through a review step — you approve, tweak, or reject before anything goes live. The AI learns from your edits and gets better over time.\n\nThis is not about replacing a content strategist. It\'s about giving you the output of one without the $80k salary or the 15 hours a week of writing time.',
    howItWorks:
      'I start by documenting your brand voice. How do you talk? What tone resonates with your audience? What topics position you as an authority? I analyze your existing content (if any), your competitors, and your industry landscape to build a voice profile the AI uses for every piece of content.\n\nThen I define the content calendar — which channels, what frequency, what content types (thought leadership posts, educational threads, email newsletters, blog articles). Together we set realistic cadence that the pipeline can sustain.\n\nThe pipeline itself runs on n8n with Claude or GPT as the drafting engine. It researches topics using RSS feeds, industry news sources, and trending conversations in your niche. Drafts land in a review queue (Notion, Google Docs, or Slack — your choice) where you approve, edit, or reject. Approved content is automatically scheduled and published via Buffer, Hootsuite, or direct API integrations.\n\nMonthly, I review performance data — engagement rates, open rates, click-throughs — and adjust the content strategy. Topics that resonate get more coverage. Formats that underperform get replaced.',
    whoItsFor:
      'Small business owners, consultants, and agencies that need a consistent content presence but cannot dedicate hours each week to writing. Especially valuable for businesses where the owner IS the brand — coaches, consultants, therapists, financial advisors, and service professionals who know their expertise should be visible online but are too busy delivering services to write about them.\n\nAlso ideal for companies with a small marketing team that\'s stretched thin. The pipeline handles the volume work (drafting, scheduling, publishing) so your team can focus on strategy, client relationships, and high-touch creative projects.',
    whatsIncluded: [
      'Brand voice documentation and AI voice profile',
      'Content calendar setup (channels, frequency, content types)',
      'AI research and drafting pipeline (n8n + Claude/GPT)',
      'Review and approval workflow (Notion, Google Docs, or Slack)',
      'Scheduling and publishing automation (Buffer, Hootsuite, or direct)',
      'Monthly performance report with engagement analytics',
      'Weekly content queue (5–15 pieces depending on plan)',
      'Ongoing content strategy adjustments based on performance',
    ],
    faqs: [
      {
        question: 'Does Lucas write the content or does AI write it?',
        answer:
          'The AI drafts the content using your documented brand voice and industry research. I design and maintain the pipeline, train the AI on your voice, and optimize the content strategy. You review and approve every piece before it publishes. Think of the AI as a first-draft writer that knows your industry — you\'re the editor with final say. Most clients spend 15–30 minutes per week reviewing their content queue.',
      },
      {
        question: 'How much human review is needed?',
        answer:
          'Plan on 15–30 minutes per week to review your content queue. Each piece arrives as a draft with a suggested publish date. You can approve it as-is, make quick edits, or reject it with a note. The AI learns from your edits over time, so the review gets faster as the system calibrates to your preferences. Most clients find that after the first month, 80% of drafts need minimal or no editing.',
      },
      {
        question: 'Which platforms and channels are supported?',
        answer:
          'The pipeline supports LinkedIn, Twitter/X, Instagram, Facebook, email newsletters (Mailchimp, ConvertKit, Beehiiv), blogs (WordPress, Ghost, Webflow), and custom publishing via API. Most clients start with 2–3 channels and expand as they see results. I build the pipeline to be modular, so adding a new channel takes a day, not a rebuild.',
      },
      {
        question: 'How much does AI content operations cost?',
        answer:
          'The service runs as a monthly retainer: $1,500 to $3,000 per month depending on the number of channels, content volume, and complexity. The $1,500 tier typically covers 2 channels with 5–8 pieces per week. The $3,000 tier covers 4+ channels with 10–15 pieces per week plus email newsletters. Setup in the first month includes the brand voice audit, pipeline build, and calendar design at no additional cost.',
      },
    ],
    relatedServices: ['ai-automation', 'training'],
  },
  {
    id: 'google-ads-management',
    icon: '📊',
    title: 'AI Google Ads Management',
    description:
      'AI-powered Google Ads campaign management — from creation to optimization to reporting — so your ad spend works harder without constant babysitting.',
    longDescription:
      'Fully automated Google Ads management powered by AI. Campaign creation, bid optimization, audience targeting, performance reporting, and budget allocation — all handled by AI agents that monitor and adjust 24/7.',
    metaTitle: 'AI Google Ads Management | Lucas Senechal',
    metaDescription:
      'AI-powered Google Ads management — campaign creation, bid optimization, analytics, and reporting. Your ads managed 24/7 by AI agents. From $1,500/month.',
    tagline:
      'AI agents that create, optimize, and report on your Google Ads campaigns — 24/7 management without the agency markup.',
    pricing: '$1,500–$5,000/month + ad spend',
    whatItIs:
      'AI Google Ads Management is a fully automated advertising management service powered by AI agents that connect directly to the Google Ads API. Instead of paying an agency $3,000–$10,000 per month for a human account manager who checks your campaigns a few times a week, AI agents monitor your campaigns continuously — adjusting bids, pausing underperformers, scaling winners, and reallocating budget in real time.\n\nThe system handles the full lifecycle: campaign creation based on your business goals, keyword research and audience targeting, ad copy generation and A/B testing, bid optimization using real-time performance data, and comprehensive reporting that tells you exactly where your money went and what it produced. AI agents connect to Google Ads, Google Analytics, and Google Workspace via API to manage everything from a single intelligent layer.\n\nThis is not a dashboard that shows you data and expects you to act on it. This is an autonomous system that takes action based on performance signals — the same decisions a senior media buyer would make, but executed instantly and around the clock.',
    howItWorks:
      'Setup starts with connecting your Google Ads account via the Google Ads API. I configure AI agents with access to campaign management, reporting, and keyword planning endpoints. The system imports your existing campaigns (if any) and establishes performance baselines.\n\nFor new campaigns, you describe your business goals — lead generation, e-commerce sales, brand awareness, local foot traffic — and the AI builds campaign structures optimized for those objectives. It handles keyword research using the KeywordPlanIdeaService, writes ad copy variations, sets initial bids, and configures audience targeting.\n\nOnce live, AI agents monitor performance metrics every hour. They adjust bids based on conversion data, pause keywords burning budget without results, test new ad copy variations, and shift budget toward top-performing campaigns. Every optimization decision is logged so you can see exactly what changed and why.\n\nWeekly reports land in your inbox with clear metrics: spend, conversions, cost per acquisition, return on ad spend, and specific actions the AI took that week. Monthly strategy reviews identify new opportunities — new keyword themes, audience segments, or campaign types to test.\n\nThe system also integrates with Google Analytics for full-funnel tracking. You see not just clicks and impressions, but what happens after someone lands on your site — form fills, purchases, phone calls, and revenue attribution.',
    whoItsFor:
      'Small to mid-sized businesses spending $1,000–$50,000 per month on Google Ads who want professional-grade campaign management without the traditional agency model. If you are currently managing ads yourself and know you are leaving money on the table, or paying an agency that sends you a report once a month and calls it management, this service delivers better results at a lower cost.\n\nParticularly valuable for e-commerce businesses running Shopping and Search campaigns, local service businesses (HVAC, plumbing, dental, legal) running Local Services Ads, SaaS companies running lead generation campaigns, and agencies that want to offer Google Ads management to their clients without hiring a dedicated media buyer.\n\nAlso ideal for businesses that have tried Google Ads before and given up because it was too time-consuming to manage properly. The AI handles the ongoing optimization that makes the difference between wasted spend and profitable advertising.',
    whatsIncluded: [
      'Google Ads API integration and account setup',
      'AI-powered campaign creation and structuring',
      'Automated keyword research and audience targeting',
      'Real-time bid optimization and budget allocation',
      'Ad copy generation and A/B testing',
      'Google Analytics integration for full-funnel tracking',
      'Weekly performance reports with AI action logs',
      'Monthly strategy review and campaign expansion',
      'Negative keyword management and waste reduction',
      'Conversion tracking setup and optimization',
    ],
    faqs: [
      {
        question: 'How does AI manage Google Ads differently than a traditional agency?',
        answer:
          'Traditional agencies assign a human account manager who reviews your campaigns a few times per week and makes adjustments based on their judgment. AI agents monitor your campaigns continuously — every hour, every day — and make data-driven adjustments instantly. They test more ad variations, react to performance changes faster, and never forget to check on a campaign. The result is typically 20–40% better performance at the same ad spend, because optimization happens in real time instead of weekly.',
      },
      {
        question: 'What Google Ads campaign types do you support?',
        answer:
          'The system manages Search campaigns, Shopping campaigns, Display campaigns, Performance Max, YouTube ads, and Local Services Ads. It handles campaign creation, keyword management, bid strategies, audience targeting, ad copy, and budget allocation across all campaign types. The AI uses the Google Ads API for campaign creation and management, reporting endpoints for performance analysis, and KeywordPlanIdeaService for keyword research.',
      },
      {
        question: 'Do I still have access to my Google Ads account?',
        answer:
          'Absolutely. You retain full ownership and access to your Google Ads account at all times. The AI agents operate through the Google Ads API with permissions you grant, and you can override any decision, pause any campaign, or adjust any setting directly. The system logs every action it takes, so you have complete transparency into what is happening and why.',
      },
      {
        question: 'How much does AI Google Ads management cost?',
        answer:
          'Management fees range from $1,500 to $5,000 per month depending on ad spend volume and campaign complexity. This does not include your actual ad spend with Google. For comparison, traditional agencies typically charge 15–20% of ad spend or a flat fee of $3,000–$10,000 per month. Most businesses with $2,000–$20,000 monthly ad spend fall in the $1,500–$3,000 management fee range.',
      },
    ],
    relatedServices: ['ai-automation', 'ongoing-management'],
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
