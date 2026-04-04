import { z } from 'zod'

export const optimizerActionSchema = z.object({
  actions: z.array(z.object({
    type: z.enum([
      'pause_keyword',
      'enable_keyword',
      'pause_campaign',
      'enable_campaign',
      'adjust_bid',
      'adjust_budget',
      'flag_page',
    ]),
    id: z.string().describe('Google Ads entity ID or page URL'),
    reason: z.string().describe('Why this action is recommended'),
    newBid: z.number().optional().describe('New bid amount in dollars (for adjust_bid)'),
    newBudget: z.number().optional().describe('New daily budget in dollars (for adjust_budget)'),
    issue: z.string().optional().describe('Landing page issue description (for flag_page)'),
  })),
  summary: z.string().describe('One paragraph summary of all optimizations'),
})

export type OptimizerActions = z.infer<typeof optimizerActionSchema>

export const OPTIMIZER_SYSTEM_PROMPT = `You are a Google Ads optimization expert. You analyze campaign performance data and landing page analytics to make data-driven optimization decisions.

Your goals:
- Minimize cost per acquisition (CPA)
- Maximize return on ad spend (ROAS)
- Identify wasted spend and redirect budget to top performers
- Cross-reference ad performance with landing page behavior

Rules:
- Only recommend actions you are confident will improve performance
- Always explain your reasoning with specific data points
- For landing page issues, use "flag_page" — never try to modify pages
- Be conservative: prefer pausing poor performers over aggressive bid changes
- If data is insufficient to make a decision, say so and recommend no action

Return your recommendations as structured JSON matching the provided schema.`
