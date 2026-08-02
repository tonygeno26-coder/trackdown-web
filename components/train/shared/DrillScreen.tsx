"use client";

import { ReactNode } from "react";
import { AppScreen } from "@/components/ui";

export function DrillScreen({ children }: { children: ReactNode }) {
  return <AppScreen className="pb-28">{children}</AppScreen>;
}
