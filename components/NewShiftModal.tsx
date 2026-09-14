"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Spade, Coffee, Home, Clock, Layers, UserRound, Users } from "lucide-react";
import { ShiftRole, ShiftType, TaxModel } from "@/lib/types";
import { useAppSettings } from "@/components/settings/AppSettingsContext";
import { hourlyRateInputValue } from "@/lib/settings";
import {
  DealingBottomSheet,
} from "@/components/dealing/DealingUi";
import {
  ChoiceButton,
  ChoiceGrid,
  FormField,
  CurrencyInput,
  TextInput,
  SheetFooter,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

const LAST_TOURNAMENT_RATE_KEY = "trackdown_last_tournament_hourly_rate";

type Step = "type" | "role" | "form";

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

function readLastHourlyRate(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LAST_TOURNAMENT_RATE_KEY) || "";
}

export default function NewShiftModal({
  onCancel,
  onCreate,
  onCreateHostess,
}: {
  onCancel: () => void;
  onCreate: (
    type: ShiftType,
    downLength: 30 | 40,
    startTime: string,
    title: string,
    houseTaxPct: number,
    hourlyRate: number | null
  ) => void;
  onCreateHostess: (
    title: string,
    taxModel: TaxModel,
    flatPct: number,
    tieredThreshold: number,
    tieredRateBelow: number,
    tieredRateAbove: number
  ) => void;
}) {
  const { settings } = useAppSettings();
  const appliedDefaults = useRef(false);
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<ShiftType | null>(null);
  const [role, setRole] = useState<ShiftRole | null>(null);
  const [length, setLength] = useState<30 | 40>(30);
  const [startTime, setStartTime] = useState(nearestHalfHour());
  const [title, setTitle] = useState("");
  const [taxPct, setTaxPct] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [taxModel, setTaxModel] = useState<TaxModel>("flat");
  const [tieredThreshold, setTieredThreshold] = useState("1000");
  const [tieredRateBelow, setTieredRateBelow] = useState("25");
  const [tieredRateAbove, setTieredRateAbove] = useState("50");

  useEffect(() => {
    if (!settings || appliedDefaults.current) return;
    appliedDefaults.current = true;
    if (settings.default_dealer_shift_type) {
      setType(settings.default_dealer_shift_type);
      if (settings.default_dealer_shift_type === "tournament" || settings.default_dealer_shift_type === "tournament_cash") {
        if (settings.default_tournament_down_length) {
          setLength(settings.default_tournament_down_length);
        }
        const rate =
          hourlyRateInputValue(settings.default_tournament_hourly_rate) || readLastHourlyRate();
        if (rate) setHourlyRate(rate);
      }
    }
  }, [settings]);

  const buildShiftStartISO = (): string => {
    const [hh, mm] = startTime.split(":").map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  };

  const selectType = (next: ShiftType) => {
    setType(next);
    if (next === "tournament" || next === "tournament_cash") {
      const settingsRate = hourlyRateInputValue(settings?.default_tournament_hourly_rate);
      setHourlyRate(settingsRate || readLastHourlyRate());
      if (settings?.default_tournament_down_length) {
        setLength(settings.default_tournament_down_length);
      }
    }
    if (next === "homegame") {
      setStep("role");
    } else {
      setStep("form");
    }
  };

  const selectRole = (next: ShiftRole) => {
    setRole(next);
    setStep("form");
  };

  const goBack = () => {
    if (step === "form") {
      if (type === "homegame") {
        setRole(null);
        setStep("role");
      } else {
        setType(null);
        setStep("type");
      }
    } else if (step === "role") {
      setType(null);
      setStep("type");
    }
  };

  const handleCreate = () => {
    if (!type) return;
    if (type === "homegame" && role === "hostess") {
      onCreateHostess(
        title,
        taxModel,
        parseFloat(taxPct) || 0,
        parseFloat(tieredThreshold) || 0,
        parseFloat(tieredRateBelow) || 0,
        parseFloat(tieredRateAbove) || 0
      );
      return;
    }
    let rate: number | null = null;
    if ((type === "tournament" || type === "tournament_cash") && hourlyRate.trim()) {
      const parsed = parseFloat(hourlyRate);
      if (!isNaN(parsed)) {
        rate = parsed;
        localStorage.setItem(LAST_TOURNAMENT_RATE_KEY, String(parsed));
      }
    }
    onCreate(
      type,
      type === "tournament" || type === "tournament_cash" ? length : 30,
      buildShiftStartISO(),
      title,
      type === "homegame" ? parseFloat(taxPct) || 0 : 0,
      rate
    );
  };

  const isHostessForm = type === "homegame" && role === "hostess";

  return (
    <DealingBottomSheet
      title="Start New Shift"
      onClose={onCancel}
      footer={
        step === "form" ? (
          <SheetFooter>
            <SecondaryButton type="button" onClick={goBack}>
              Back
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleCreate}>
              <Check size={16} /> Build Shift
            </PrimaryButton>
          </SheetFooter>
        ) : undefined
      }
    >
      {step === "type" && (
        <>
          <p className="-mt-1 text-[14px] text-td-muted">What are you dealing?</p>
          <ChoiceGrid>
            <ChoiceButton icon={Spade} onClick={() => selectType("tournament")}>
              Tournament
            </ChoiceButton>
            <ChoiceButton icon={Coffee} onClick={() => selectType("cash")}>
              Cash Game
            </ChoiceButton>
            <ChoiceButton icon={Layers} onClick={() => selectType("tournament_cash")}>
              Tournament + Cash Game
            </ChoiceButton>
            <ChoiceButton icon={Home} onClick={() => selectType("homegame")}>
              Home Game
            </ChoiceButton>
          </ChoiceGrid>
        </>
      )}

      {step === "role" && (
        <>
          <p className="-mt-1 mb-3 text-[14px] text-td-muted">Dealing or hosting?</p>
          <ChoiceGrid>
            <ChoiceButton icon={Spade} onClick={() => selectRole("dealer")}>
              Dealer
            </ChoiceButton>
            <ChoiceButton icon={Users} onClick={() => selectRole("hostess")}>
              Hostess
            </ChoiceButton>
          </ChoiceGrid>
          <div className="mt-4">
            <SecondaryButton type="button" onClick={goBack}>
              Back
            </SecondaryButton>
          </div>
        </>
      )}

      {step === "form" && (
        <div className="space-y-4">
          {(type === "tournament" || type === "tournament_cash") && (
            <>
              <p className="text-[14px] text-td-muted">Down length?</p>
              <div className="grid grid-cols-2 gap-3">
                {([30, 40] as const).map((len) => (
                  <ChoiceButton
                    key={len}
                    selected={length === len}
                    icon={Clock}
                    onClick={() => setLength(len)}
                  >
                    {len} min
                  </ChoiceButton>
                ))}
              </div>
              <FormField label="Hourly rate ($/hour)" hint="Leave blank if unknown">
                <CurrencyInput
                  value={hourlyRate}
                  onChange={setHourlyRate}
                  placeholder="Leave blank if unknown"
                />
              </FormField>
            </>
          )}

          {type === "homegame" && role === "dealer" && (
            <FormField label="House tax on tips (%)">
              <div className="flex min-h-[48px] items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
                <input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={taxPct}
                  onChange={(e) => setTaxPct(e.target.value)}
                  className="flex-1 border-none bg-transparent py-3 font-mono text-[15px] font-semibold text-td-cream focus:outline-none"
                />
                <span className="font-mono text-td-muted">%</span>
              </div>
            </FormField>
          )}

          {isHostessForm && (
            <>
              <p className="text-[14px] text-td-muted">Tax model</p>
              <ChoiceGrid>
                <ChoiceButton selected={taxModel === "flat"} icon={UserRound} onClick={() => setTaxModel("flat")}>
                  Flat %
                </ChoiceButton>
                <ChoiceButton selected={taxModel === "tiered"} icon={Layers} onClick={() => setTaxModel("tiered")}>
                  Tiered
                </ChoiceButton>
              </ChoiceGrid>

              {taxModel === "flat" ? (
                <FormField label="Flat tax on turn-ins (%)">
                  <div className="flex min-h-[48px] items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={taxPct}
                      onChange={(e) => setTaxPct(e.target.value)}
                      className="flex-1 border-none bg-transparent py-3 font-mono text-[15px] font-semibold text-td-cream focus:outline-none"
                    />
                    <span className="font-mono text-td-muted">%</span>
                  </div>
                </FormField>
              ) : (
                <div className="space-y-4">
                  <FormField label="Threshold ($)">
                    <CurrencyInput value={tieredThreshold} onChange={setTieredThreshold} placeholder="1000" />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Rate below (%)">
                      <div className="flex min-h-[48px] items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="1"
                          min="0"
                          max="100"
                          value={tieredRateBelow}
                          onChange={(e) => setTieredRateBelow(e.target.value)}
                          className="flex-1 border-none bg-transparent py-3 font-mono text-[15px] font-semibold text-td-cream focus:outline-none"
                        />
                        <span className="font-mono text-td-muted">%</span>
                      </div>
                    </FormField>
                    <FormField label="Rate above (%)">
                      <div className="flex min-h-[48px] items-center rounded-xl border border-td-border bg-td-bg/80 px-3.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="1"
                          min="0"
                          max="100"
                          value={tieredRateAbove}
                          onChange={(e) => setTieredRateAbove(e.target.value)}
                          className="flex-1 border-none bg-transparent py-3 font-mono text-[15px] font-semibold text-td-cream focus:outline-none"
                        />
                        <span className="font-mono text-td-muted">%</span>
                      </div>
                    </FormField>
                  </div>
                </div>
              )}
            </>
          )}

          <FormField
            label={
              type === "tournament" || type === "tournament_cash"
                ? "Tournament / room name"
                : "Room / game name"
            }
          >
            <TextInput
              placeholder={
                type === "tournament" || type === "tournament_cash"
                  ? "e.g. Wynn $200 Deepstack"
                  : "e.g. Bellagio 1/2 NLH"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          {!isHostessForm && (
            <FormField label="Shift start time">
              <TextInput
                type="time"
                step={1800}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="font-mono"
              />
            </FormField>
          )}
        </div>
      )}
    </DealingBottomSheet>
  );
}
