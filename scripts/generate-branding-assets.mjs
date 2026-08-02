/**
 * Generate Trackdown branding assets from the original logo source mockup.
 * Run: node scripts/generate-branding-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "assets/logo-source.jpg");
const BRAND_BG = { r: 10, g: 10, b: 12, alpha: 1 }; // td-bg #0a0a0c

// Crop regions extracted from 768×1024 source mockup (logo at top center)
const CROPS = {
  icon: { left: 88, top: 35, width: 75, height: 75 },
  header: { left: 88, top: 24, width: 592, height: 168 },
  splash: { left: 64, top: 24, width: 640, height: 220 },
};

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

/** Place content on a square canvas with even padding, no stretch. */
async function paddedSquare(input, size, paddingRatio = 0.12, bg = BRAND_BG) {
  const meta = await sharp(input).metadata();
  const maxContent = Math.round(size * (1 - paddingRatio * 2));
  const scale = Math.min(maxContent / meta.width, maxContent / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2);

  const resized = await sharp(input).resize(w, h, { fit: "inside" }).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: resized, left: x, top: y }])
    .png();
}

/** Center content on arbitrary canvas. */
async function centeredOnCanvas(input, width, height, contentScale = 0.55, bg = BRAND_BG) {
  const maxW = Math.round(width * contentScale);
  const maxH = Math.round(height * contentScale);
  const resized = await sharp(input)
    .resize(maxW, maxH, { fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const x = Math.round((width - meta.width) / 2);
  const y = Math.round((height - meta.height) / 2);
  return sharp({
    create: { width, height, channels: 4, background: bg },
  })
    .composite([{ input: resized, left: x, top: y }])
    .png();
}

async function writePng(pipeline, dest) {
  await ensureDir(path.dirname(dest));
  await pipeline.toFile(dest);
  const meta = await sharp(dest).metadata();
  return { path: dest, width: meta.width, height: meta.height };
}

async function main() {
  const generated = [];

  // Extract cropped logo elements from source
  const iconCrop = path.join(ROOT, "assets/branding/logo-icon-crop.png");
  const headerCrop = path.join(ROOT, "assets/branding/logo-header-crop.png");
  const splashCrop = path.join(ROOT, "assets/branding/logo-splash-crop.png");

  for (const [key, crop] of Object.entries(CROPS)) {
    const dest = key === "icon" ? iconCrop : key === "header" ? headerCrop : splashCrop;
    await sharp(SOURCE).extract(crop).png().toFile(dest);
  }

  // 1024×1024 master for app icons (circular spade emblem)
  const master1024 = path.join(ROOT, "assets/branding/logo-icon-1024.png");
  generated.push(await writePng(await paddedSquare(iconCrop, 1024, 0.14), master1024));

  // Public web / PWA icons
  const webSizes = [
    { name: "public/logo-icon.png", size: 512, crop: iconCrop, pad: 0.14 },
    { name: "public/logo-header.png", size: 0, crop: headerCrop, header: true },
    { name: "public/logo.png", size: 0, crop: splashCrop, header: true },
    { name: "public/apple-touch-icon.png", size: 180, crop: iconCrop, pad: 0.14 },
    { name: "public/icon-192.png", size: 192, crop: iconCrop, pad: 0.14 },
    { name: "public/icon-512.png", size: 512, crop: iconCrop, pad: 0.14 },
    { name: "public/favicon-32.png", size: 32, crop: iconCrop, pad: 0.1 },
    { name: "public/favicon-16.png", size: 16, crop: iconCrop, pad: 0.08 },
  ];

  for (const item of webSizes) {
    const dest = path.join(ROOT, item.name);
    if (item.header) {
      await sharp(item.crop).png().toFile(dest);
      const meta = await sharp(dest).metadata();
      generated.push({ path: dest, width: meta.width, height: meta.height });
    } else {
      generated.push(await writePng(await paddedSquare(item.crop, item.size, item.pad), dest));
    }
  }

  // favicon.ico (32px PNG served as favicon)
  await writePng(await paddedSquare(iconCrop, 32, 0.1), path.join(ROOT, "public/favicon.ico"));
  generated.push({ path: "public/favicon.ico", width: 32, height: 32, note: "PNG-as-ICO" });

  // iOS App Icon (1024 universal)
  const iosIconDir = path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset");
  generated.push(
    await writePng(await paddedSquare(iconCrop, 1024, 0.14), path.join(iosIconDir, "AppIcon-512@2x.png"))
  );

  // iOS Splash (2732×2732 @1x/2x/3x — same asset, different scale entries)
  const splashDir = path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset");
  const splashNames = ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"];
  for (const name of splashNames) {
    generated.push(
      await writePng(
        await centeredOnCanvas(splashCrop, 2732, 2732, 0.42),
        path.join(splashDir, name)
      )
    );
  }

  // Android adaptive icons
  const androidRes = path.join(ROOT, "android/app/src/main/res");
  const densities = [
    { folder: "mipmap-mdpi", size: 108, legacy: 48 },
    { folder: "mipmap-hdpi", size: 162, legacy: 72 },
    { folder: "mipmap-xhdpi", size: 216, legacy: 96 },
    { folder: "mipmap-xxhdpi", size: 324, legacy: 144 },
    { folder: "mipmap-xxxhdpi", size: 432, legacy: 192 },
  ];

  for (const { folder, size, legacy } of densities) {
    const dir = path.join(androidRes, folder);
    // Adaptive foreground (icon with transparent padding on transparent bg)
    const fgPad = 0.22; // safe zone for adaptive mask
    const fgSize = size;
    const fgMeta = await sharp(iconCrop).metadata();
    const maxContent = Math.round(fgSize * (1 - fgPad * 2));
    const scale = Math.min(maxContent / fgMeta.width, maxContent / fgMeta.height);
    const w = Math.round(fgMeta.width * scale);
    const h = Math.round(fgMeta.height * scale);
    const fgResized = await sharp(iconCrop).resize(w, h, { fit: "inside" }).png().toBuffer();
    const fgX = Math.round((fgSize - w) / 2);
    const fgY = Math.round((fgSize - h) / 2);
    const fg = sharp({
      create: { width: fgSize, height: fgSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).composite([{ input: fgResized, left: fgX, top: fgY }]);

    const bg = sharp({
      create: { width: size, height: size, channels: 4, background: BRAND_BG },
    });

    generated.push(await writePng(fg, path.join(dir, "ic_launcher_foreground.png")));
    generated.push(await writePng(bg, path.join(dir, "ic_launcher_background.png")));
    generated.push(await writePng(await paddedSquare(iconCrop, legacy, 0.14), path.join(dir, "ic_launcher.png")));
    generated.push(await writePng(await paddedSquare(iconCrop, legacy, 0.14), path.join(dir, "ic_launcher_round.png")));
  }

  // Android adaptive icon XML
  const anydpiDir = path.join(androidRes, "mipmap-anydpi-v26");
  await ensureDir(anydpiDir);
  await writeFile(
    path.join(anydpiDir, "ic_launcher.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
  );
  await writeFile(
    path.join(anydpiDir, "ic_launcher_round.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
  );

  // Android splash drawables (portrait + landscape)
  const androidSplashes = [
    { folder: "drawable-port-mdpi", width: 320, height: 480 },
    { folder: "drawable-port-hdpi", width: 480, height: 800 },
    { folder: "drawable-port-xhdpi", width: 720, height: 1280 },
    { folder: "drawable-port-xxhdpi", width: 960, height: 1600 },
    { folder: "drawable-port-xxxhdpi", width: 1280, height: 1920 },
    { folder: "drawable-land-mdpi", width: 480, height: 320 },
    { folder: "drawable-land-hdpi", width: 800, height: 480 },
    { folder: "drawable-land-xhdpi", width: 1280, height: 720 },
    { folder: "drawable-land-xxhdpi", width: 1600, height: 960 },
    { folder: "drawable-land-xxxhdpi", width: 1920, height: 1280 },
    { folder: "drawable", width: 480, height: 320 },
  ];

  for (const { folder, width, height } of androidSplashes) {
    generated.push(
      await writePng(
        await centeredOnCanvas(splashCrop, width, height, 0.42),
        path.join(androidRes, folder, "splash.png")
      )
    );
  }

  // Capacitor splash in public/
  generated.push(
    await writePng(
      await centeredOnCanvas(splashCrop, 1284, 2778, 0.38),
      path.join(ROOT, "public/splash.png")
    )
  );

  // Manifest for PWA
  await writeFile(
    path.join(ROOT, "public/manifest.json"),
    JSON.stringify(
      {
        name: "Trackdown",
        short_name: "Trackdown",
        description: "Track every down. Own the night.",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0c",
        theme_color: "#0a0a0c",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      null,
      2
    )
  );

  // Write manifest of generated files
  const manifestPath = path.join(ROOT, "assets/branding/generated-manifest.json");
  await writeFile(
    manifestPath,
    JSON.stringify({ source: "assets/logo-source.jpg", generated }, null, 2)
  );

  console.log(`Generated ${generated.length} assets from ${SOURCE}`);
  for (const g of generated) {
    console.log(`  ${g.path} (${g.width}×${g.height})${g.note ? " " + g.note : ""}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
