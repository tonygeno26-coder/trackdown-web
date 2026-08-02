"use client";

import { ReactNode } from "react";

export function SheetFooter({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
