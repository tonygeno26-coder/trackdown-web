"use client";

export function MoneyValue({
  amount,
  signed = false,
  positive,
  size = "md",
  className = "",
}: {
  amount: string;
  signed?: boolean;
  positive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass = {
    sm: "text-[14px]",
    md: "text-[17px]",
    lg: "text-[28px]",
    xl: "text-[40px]",
  }[size];

  let colorClass = "text-td-cream";
  if (positive === true) colorClass = "text-td-goldsoft";
  else if (positive === false) colorClass = "text-red-300";
  else if (signed && amount.startsWith("+")) colorClass = "text-td-goldsoft";
  else if (signed && amount.startsWith("-")) colorClass = "text-red-300";

  return (
    <span className={`font-mono font-semibold leading-none ${sizeClass} ${colorClass} ${className}`}>
      {amount}
    </span>
  );
}
