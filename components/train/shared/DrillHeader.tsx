"use client";

import { ScreenHeader } from "@/components/ui";

export function DrillHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return <ScreenHeader title={title} subtitle={subtitle} onBack={onBack} />;
}
