/**
 * Service definitions for the consulting funnel.
 *
 * Single source of truth for the 4 services offered.
 * Used by:
 *   - components/homepage/what-i-build.tsx (card grid)
 *   - components/consulting/service-grid.tsx (consulting page cards)
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
}

export const SERVICES: Service[] = [
  {
    id: 'ai-automation',
    icon: '\u2699\uFE0F',
    title: 'AI Automation',
    description: 'Turn repetitive workflows into AI-powered systems that run themselves.',
    longDescription:
      'Custom AI agents and automation pipelines built for your specific workflows. From lead follow-ups to data entry to report generation, I design systems that handle the busywork so your team can focus on revenue.',
  },
  {
    id: 'process-consulting',
    icon: '\uD83D\uDCCB',
    title: 'Process Consulting',
    description: 'Audit your operations and design the automation roadmap.',
    longDescription:
      'A deep-dive audit of your current operations to identify where AI fits and where it doesn\'t. You get a prioritized roadmap with estimated ROI, so you know exactly what to build first and why.',
  },
  {
    id: 'ongoing-management',
    icon: '\uD83D\uDD04',
    title: 'Ongoing Management',
    description: 'Keep your AI systems running, improving, and scaling with you.',
    longDescription:
      'Monthly retainer to monitor, maintain, and improve your AI systems as your business evolves. Includes performance tuning, new integrations, and adapting workflows when your processes change.',
  },
  {
    id: 'training',
    icon: '\uD83C\uDF93',
    title: 'Training & Enablement',
    description: 'Get your team confident building and working alongside AI.',
    longDescription:
      'Hands-on training sessions tailored to your team\'s tools and workflows. From prompt engineering basics to building internal AI tools, your team leaves confident and self-sufficient.',
  },
];
