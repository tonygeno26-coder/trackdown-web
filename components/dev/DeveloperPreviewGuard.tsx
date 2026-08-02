"use client";

import { useEffect } from "react";
import { useAppSettings } from "@/components/settings/AppSettingsContext";
import { useDeveloperPreview } from "@/components/dev/DeveloperPreviewProvider";

/** Clears persisted Home preview when Developer Mode is off. */
export default function DeveloperPreviewGuard() {
  const { settings } = useAppSettings();
  const { previewMode, clearPreview } = useDeveloperPreview();

  useEffect(() => {
    if (settings && !settings.developer_mode && previewMode !== "none") {
      clearPreview();
    }
  }, [settings?.developer_mode, previewMode, clearPreview, settings]);

  return null;
}
