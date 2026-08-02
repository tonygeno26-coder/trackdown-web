"use client";

import { useState } from "react";
import { X, Check, Spade, Coffee, Clock } from "lucide-react";
import { ShiftType } from "@/lib/types";

export default function NewShiftModal({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (type: ShiftType, downLength: 30 | 40) => void;
}) {
  const [type, setType] = useState<ShiftType | null>(null);
  const [length, setLength] = useState<30 | 40>(30);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-td-surface border border-td-border rounded-t-2xl px-5 pt-5 pb-6 flex flex-col gap-3.5"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-lg tracking-wide">Start new shift</h2>
          <button onClick={onCancel} className="text-td-muted hover:text-td-cream p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {!type ? (
          <>
            <p className="text-[13.5px] text-td-muted -mt-1.5">What are you dealing?</p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setType("tournament")}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-5 px-2.5 font-semibold text-[13.5px] hover:border-td-gold"
              >
                <Spade size={22} />
                <span>Tournament</span>
              </button>
              <button
                onClick={() => onCreate("cash", 30)}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-5 px-2.5 font-semibold text-[13.5px] hover:border-td-gold"
              >
                <Coffee size={22} />
                <span>Cash Game</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[13.5px] text-td-muted -mt-1.5">Down length?</p>
            <div className="flex gap-2.5">
              {[30, 40].map((len) => (
                <button
                  key={len}
                  onClick={() => setLength(len as 30 | 40)}
                  className={`flex-1 flex flex-col items-center gap-2 border-[1.5px] rounded-xl py-5 px-2.5 font-semibold text-[13.5px]
                    ${length === len ? "border-td-gold bg-td-gold/10 text-td-goldsoft" : "border-td-border bg-td-surface2 hover:border-td-gold"}`}
                >
                  <Clock size={20} />
                  <span>{len} min</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 mt-1.5">
              <button
                onClick={() => setType(null)}
                className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream"
              >
                Back
              </button>
              <button
                onClick={() => onCreate("tournament", length)}
                className="flex-1 flex items-center justify-center gap-2 rounded-[10px] py-3 font-bold text-sm bg-td-gold text-[#1a1305] hover:bg-td-goldsoft"
              >
                <Check size={16} /> Build shift
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
