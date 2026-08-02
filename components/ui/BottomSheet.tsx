"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

export function BottomSheet({
  title,
  onClose,
  children,
  footer,
  open = true,
  destructive,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  destructive?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden={!open}
        >
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bottom-sheet-title"
            initial={{ y: reducedMotion ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reducedMotion ? 0 : "100%" }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-[520px] flex-col rounded-t-td-lg border border-td-border/80 bg-td-surface shadow-td-card"
          >
            <div className="flex shrink-0 justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-td-border" aria-hidden />
            </div>
            <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-3">
              <h2
                id="bottom-sheet-title"
                className={`font-display text-xl font-bold uppercase tracking-[1px] ${
                  destructive ? "text-red-300" : "text-td-cream"
                }`}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-td-muted transition-colors hover:bg-td-surface2 hover:text-td-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-td-gold/60"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4">{children}</div>
            {footer && (
              <div className="sticky bottom-0 shrink-0 border-t border-td-border/60 bg-td-surface px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
