import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.desertspore.trackdown",
  appName: "Trackdown",
  webDir: "public",
  server: {
    url: "https://trackdown-web-production.up.railway.app",
    cleartext: false,
  },
};

export default config;
