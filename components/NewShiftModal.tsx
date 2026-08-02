"use client";

import { useState } from "react";
import { X, Check, Spade, Coffee, Home, Clock } from "lucide-react";
import { ShiftType } from "@/lib/types";

function nearestHalfHour(): string {
  const d = new Date();
  const minutes = d.getMinutes();
  const rounded = minutes < 30 ? 30 : 0;
  if (rounded === 0) d.setHours(d.getHours() + 1);
  d.setMinutes(rounded, 0, 0);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function NewShiftModal({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (
    type: ShiftType,
    downLength: 30 | 40,
    startTime: string,
    title: string,
    houseTaxPct: number
  ) => void;
}) {
  const [type, setType] = useState<ShiftType | null>(null);
  const [length, setLength] = useState<30 | 40>(30);
  const [startTime, setStartTime] = useState(nearestHalfHour());
  const [title, setTitle] = useState("");
  const [taxPct, setTaxPct] = useState("");

  const buildShiftStartISO = (): string => {
    const [hh, mm] = startTime.split(":").map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  };

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
            <div className="flex gap-2">
              <button
                onClick={() => setType("tournament")}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-4 px-2 font-semibold text-[12.5px] hover:border-td-gold"
              >
                <Spade size={20} />
                <span>Tournament</span>
              </button>
              <button
                onClick={() => setType("cash")}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-4 px-2 font-semibold text-[12.5px] hover:border-td-gold"
              >
                <Coffee size={20} />
                <span>Cash Game</span>
              </button>
              <button
                onClick={() => setType("homegame")}
                className="flex-1 flex flex-col items-center gap-2 bg-td-surface2 border-[1.5px] border-td-border rounded-xl py-4 px-2 font-semibold text-[12.5px] hover:border-td-gold"
              >
                <Home size={20} />
                <span>Home Game</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {type === "tournament" && (
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
              </>
            )}

            {type === "homegame" && (
              <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
                <span>House tax on tips (%)</span>
                <div className="flex items-center bg-td-bg border border-td-border rounded-[9px] px-3">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={taxPct}
                    onChange={(e) => setTaxPct(e.target.value)}
                    className="bg-transparent border-none py-2.5 px-1 font-mono font-semibold flex-1 focus:outline-none text-td-cream"
                  />
                  <span className="font-mono text-td-muted">%</span>
                </div>
              </label>
            )}

            <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
              <span>{type === "tournament" ? "Tournament / room name" : "Room / game name"}</span>
              <input
                type="text"
                placeholder={type === "tournament" ? "e.g. Wynn $200 Deepstack" : "e.g. Bellagio 1/2 NLH"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] focus:outline focus:outline-2 focus:outline-td-gold"
              />
            </label>

            <label className="flex flex-col gap-1 text-[12.5px] text-td-muted">
              <span>Shift start time</span>
              <input
                type="time"
                step={1800}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-td-bg border border-td-border rounded-[9px] px-3 py-2.5 text-td-cream text-[14.5px] font-mono focus:outline focus:outline-2 focus:outline-td-gold"
              />
            </label>

            <div className="flex gap-2.5 mt-1.5">
              <button
                onClick={() => setType(null)}
                className="flex-1 rounded-[10px] py-3 font-bold text-sm bg-td-surface2 border border-td-border text-td-cream"
              >
                Back
              </button>
              <button
                onClick={() =>
                  onCreate(
                    type,
                    type === "tournament" ? length : 30,
                    buildShiftStartISO(),
                    title,
                    type === "homegame" ? parseFloat(taxPct) || 0 : 0
                  )
                }
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
