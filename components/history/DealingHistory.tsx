"use client";

import HistoryList from "@/components/HistoryList";
import { Shift, DownBlock } from "@/lib/types";

export default function DealingHistory({
  shifts,
  onBlockTap,
  onDeleteShift,
}: {
  shifts: Shift[];
  onBlockTap: (shift: Shift, block: DownBlock) => void;
  onDeleteShift: (id: string) => void;
}) {
  return <HistoryList shifts={shifts} onBlockTap={onBlockTap} onDeleteShift={onDeleteShift} />;
}
