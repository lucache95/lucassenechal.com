"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import type { BusinessPlan } from "@/lib/schemas/business-plan";

const ACCENT = "#2563eb";
const FOREGROUND = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const BG_LIGHT = "#f8fafc";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    padding: 40,
    color: FOREGROUND,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: FOREGROUND,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 9,
    color: MUTED,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginTop: 14,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 9,
    color: FOREGROUND,
    lineHeight: 1.6,
  },
  mutedText: {
    fontSize: 8,
    color: MUTED,
    lineHeight: 1.5,
  },
  quoteBlock: {
    backgroundColor: BG_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    padding: 8,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  stepNumber: {
    width: 16,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: FOREGROUND,
  },
  stepDesc: {
    fontSize: 8,
    color: MUTED,
    marginTop: 1,
  },
  toolBadge: {
    fontSize: 7,
    color: MUTED,
    backgroundColor: BG_LIGHT,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 3,
    marginTop: 2,
  },
  toolRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  phaseCard: {
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
    padding: 8,
    marginBottom: 6,
  },
  phaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  phaseName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: FOREGROUND,
  },
  phaseDuration: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },
  deliverableItem: {
    fontSize: 8,
    color: MUTED,
    marginLeft: 8,
    marginBottom: 1,
  },
  estimateContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  estimateBox: {
    flex: 1,
    backgroundColor: BG_LIGHT,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 3,
    padding: 8,
    alignItems: "center" as const,
  },
  estimateLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  estimateValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: FOREGROUND,
  },
  bulletItem: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
    marginLeft: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  listBullet: {
    width: 10,
    fontSize: 8,
    color: MUTED,
  },
  listText: {
    flex: 1,
    fontSize: 8,
    color: MUTED,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
});

interface BusinessPlanPDFProps {
  plan: BusinessPlan;
  clientName?: string;
}

export function BusinessPlanPDF({ plan, clientName = "Client" }: BusinessPlanPDFProps) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Business Plan for {clientName}</Text>
          <Text style={styles.headerSub}>
            Prepared by Lucas Senechal | {today}
          </Text>
        </View>

        {/* Goal Mirroring */}
        <Text style={styles.sectionTitle}>Your Situation</Text>
        <View style={styles.quoteBlock}>
          <Text style={styles.bodyText}>{plan.goalMirroring}</Text>
        </View>

        {/* Bottleneck Diagnosis */}
        <Text style={styles.sectionTitle}>Core Bottleneck</Text>
        <Text style={styles.bodyText}>{plan.bottleneckDiagnosis}</Text>

        {/* Proposed System Steps */}
        <Text style={styles.sectionTitle}>Proposed System</Text>
        {plan.proposedSystemSteps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{step.step}.</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
              {step.tools && step.tools.length > 0 && (
                <View style={styles.toolRow}>
                  {step.tools.map((tool, j) => (
                    <Text key={j} style={styles.toolBadge}>
                      {tool}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Tools & Integrations */}
        <Text style={styles.sectionTitle}>Tools & Integrations</Text>
        <View style={styles.toolRow}>
          {plan.toolsAndIntegrations.map((tool, i) => (
            <Text key={i} style={styles.toolBadge}>
              {tool}
            </Text>
          ))}
        </View>

        {/* Implementation Phases */}
        <Text style={styles.sectionTitle}>Implementation Phases</Text>
        {plan.implementationPhases.map((phase, i) => (
          <View key={i} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseName}>{phase.phase}</Text>
              <Text style={styles.phaseDuration}>{phase.duration}</Text>
            </View>
            {phase.deliverables.map((d, j) => (
              <Text key={j} style={styles.deliverableItem}>
                - {d}
              </Text>
            ))}
          </View>
        ))}

        {/* Risks & Dependencies */}
        <Text style={styles.sectionTitle}>Risks & Dependencies</Text>
        {plan.risksAndDependencies.map((risk, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.listBullet}>!</Text>
            <Text style={styles.listText}>{risk}</Text>
          </View>
        ))}

        {/* Estimate & Timeline */}
        <Text style={styles.sectionTitle}>Estimate & Timeline</Text>
        <View style={styles.estimateContainer}>
          <View style={styles.estimateBox}>
            <Text style={styles.estimateLabel}>Investment</Text>
            <Text style={styles.estimateValue}>{plan.estimate.totalRange}</Text>
          </View>
          <View style={styles.estimateBox}>
            <Text style={styles.estimateLabel}>Timeline</Text>
            <Text style={styles.estimateValue}>{plan.estimate.timeline}</Text>
          </View>
        </View>
        {plan.estimate.assumptions.length > 0 && (
          <View>
            {plan.estimate.assumptions.map((a, i) => (
              <Text key={i} style={styles.bulletItem}>
                - {a}
              </Text>
            ))}
          </View>
        )}

        {/* Next Steps */}
        <Text style={styles.sectionTitle}>Next Steps</Text>
        {plan.nextSteps.map((step, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.listBullet}>{i + 1}.</Text>
            <Text style={styles.listText}>{step}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>lucassenechal.com | AI Systems Consulting</Text>
          <Text style={styles.footerText}>{today}</Text>
        </View>
      </Page>
    </Document>
  );
}

interface PlanDownloadButtonProps {
  plan: BusinessPlan;
  clientName?: string;
}

export function PlanDownloadButton({ plan, clientName }: PlanDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<BusinessPlanPDF plan={plan} clientName={clientName} />}
      fileName="business-plan.pdf"
      className="inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 ease-out px-7 py-3.5 text-lg
        border border-border text-foreground hover:bg-surface-hover
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
        cursor-pointer"
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Download Your Plan")}
    </PDFDownloadLink>
  );
}

export default BusinessPlanPDF;
