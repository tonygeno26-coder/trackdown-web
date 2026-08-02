"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";
import {
  AppScreen,
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  BottomSheet,
  FormField,
  inputClass,
  fadeSlide,
  stagger,
} from "@/components/ui";

export { AppScreen as PlayingShell };
export { SurfaceCard as PlayingCard };
export { PrimaryButton as PrimaryPlayingButton };
export { SecondaryButton as SecondaryPlayingButton };
export { FormField as PlayingField };
export { inputClass as playingInputClass };
export { fadeSlide as playingFadeIn };
export { stagger as playingStagger };

export function PlayingBottomSheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <BottomSheet title={title} onClose={onClose} footer={footer}>
      {children}
    </BottomSheet>
  );
}
