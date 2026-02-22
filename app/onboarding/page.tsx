import { redirect } from "next/navigation";
import { Stepper } from "@/components/onboarding/stepper";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ subscriber?: string }>;
}) {
  const params = await searchParams;
  const subscriberId = params.subscriber;

  if (!subscriberId) {
    redirect("/newsletter");
  }

  return <Stepper subscriberId={subscriberId} />;
}
