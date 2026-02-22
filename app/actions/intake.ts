"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  IntakeNotificationEmail,
  getIntakeNotificationSubject,
} from "@/lib/email/intake-notification";
import type { IntakeAnswer } from "@/lib/schemas/intake";
import type { BusinessPlan } from "@/lib/schemas/business-plan";
import { SERVICES } from "@/lib/data/services";

// ---------------------------------------------------------------------------
// Supabase client (service_role for server-side inserts)
// ---------------------------------------------------------------------------

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ---------------------------------------------------------------------------
// saveIntakeSession — Persist email, name, and answers
// ---------------------------------------------------------------------------

type SaveSessionResult = { sessionId: string } | { error: string };

export async function saveIntakeSession(input: {
  email: string;
  name: string;
  answers: IntakeAnswer[];
}): Promise<SaveSessionResult> {
  const supabase = getSupabase();

  try {
    // 1. Create intake_sessions row
    const { data: session, error: sessionError } = await supabase
      .from("intake_sessions")
      .insert({
        email: input.email,
        name: input.name,
        status: "in_progress",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("[saveIntakeSession] Session insert error:", sessionError);
      return { error: "Failed to save session. Please try again." };
    }

    // 2. Bulk insert all answers
    if (input.answers.length > 0) {
      const answerRows = input.answers.map((a) => ({
        session_id: session.id,
        question_id: a.questionId,
        question_text: a.questionText,
        answer_value: a.answerValue,
        answer_display: a.answerDisplay,
        sequence_order: a.sequenceOrder,
      }));

      const { error: answersError } = await supabase
        .from("intake_answers")
        .insert(answerRows);

      if (answersError) {
        console.error("[saveIntakeSession] Answers insert error:", answersError);
        // Non-blocking: session is saved, answers failed
      }
    }

    return { sessionId: session.id };
  } catch (err) {
    console.error("[saveIntakeSession] Unexpected error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// saveIntakePlan — Persist generated plan and send notification email
// ---------------------------------------------------------------------------

type SavePlanResult = { success: boolean } | { error: string };

export async function saveIntakePlan(input: {
  sessionId: string;
  plan: BusinessPlan;
}): Promise<SavePlanResult> {
  const supabase = getSupabase();

  try {
    // 1. Insert plan data
    const { error: planError } = await supabase.from("intake_plans").insert({
      session_id: input.sessionId,
      plan_json: input.plan,
      recommended_service: input.plan.recommendedService,
      created_at: new Date().toISOString(),
    });

    if (planError) {
      console.error("[saveIntakePlan] Plan insert error:", planError);
      return { error: "Failed to save plan." };
    }

    // 2. Update session status
    const { error: updateError } = await supabase
      .from("intake_sessions")
      .update({
        status: "plan_generated",
        plan_generated_at: new Date().toISOString(),
      })
      .eq("id", input.sessionId);

    if (updateError) {
      console.error("[saveIntakePlan] Session update error:", updateError);
      // Non-blocking
    }

    // 3. Fire-and-forget email notification to Lucas
    if (process.env.RESEND_API_KEY) {
      const { data: session } = await supabase
        .from("intake_sessions")
        .select("email, name")
        .eq("id", input.sessionId)
        .single();

      if (session) {
        const serviceName =
          SERVICES.find((s) => s.id === input.plan.recommendedService)
            ?.title ?? input.plan.recommendedService;

        // Find business description from intake answers
        const { data: answers } = await supabase
          .from("intake_answers")
          .select("question_id, answer_value")
          .eq("session_id", input.sessionId)
          .order("sequence_order", { ascending: true });

        const businessDescription =
          answers?.find(
            (a) =>
              a.question_id === "business-description" ||
              a.question_id === "industry"
          )?.answer_value ?? "";

        const questionCount = answers?.length ?? 0;

        const resend = new Resend(process.env.RESEND_API_KEY);
        const recipientEmail =
          process.env.RESEND_NOTIFICATION_EMAIL ?? "lucas@lucassenechal.com";

        // Fire-and-forget: .catch(console.error) without await (project pattern)
        resend.emails
          .send({
            from: "Lucas Senechal <notifications@lucassenechal.com>",
            to: recipientEmail,
            subject: getIntakeNotificationSubject(session.name, serviceName),
            react: IntakeNotificationEmail({
              name: session.name,
              email: session.email,
              businessDescription,
              recommendedService: serviceName,
              questionCount,
              planSummary: (input.plan.goalMirroring ?? "").slice(0, 200),
            }),
          })
          .catch((err) => {
            console.error("[intake-notification] Send failed:", err);
          });
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[saveIntakePlan] Unexpected error:", err);
    return { error: "Something went wrong." };
  }
}

// ---------------------------------------------------------------------------
// markIntakeBooked — Update session status to booked
// ---------------------------------------------------------------------------

type MarkBookedResult = { success: boolean } | { error: string };

export async function markIntakeBooked(input: {
  sessionId: string;
}): Promise<MarkBookedResult> {
  const supabase = getSupabase();

  try {
    const { error } = await supabase
      .from("intake_sessions")
      .update({
        status: "booked",
        booked_at: new Date().toISOString(),
      })
      .eq("id", input.sessionId);

    if (error) {
      console.error("[markIntakeBooked] Update error:", error);
      return { error: "Failed to update booking status." };
    }

    return { success: true };
  } catch (err) {
    console.error("[markIntakeBooked] Unexpected error:", err);
    return { error: "Something went wrong." };
  }
}
