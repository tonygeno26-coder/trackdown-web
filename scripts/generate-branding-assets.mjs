/**
 * Generate Trackdown branding assets from the official app icon source.
 * Run: node scripts/generate-branding-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP_ICON_SOURCE = path.join(ROOT, "assets/app-icon-source.png");
const BRAND_BG = { r: 10, g: 10, b: 12, alpha: 1 }; // td-bg #0a0a0c

/** Safe inset so the full logo stays visible inside Apple's rounded icon mask. */
const IOS_ICON_PADDING = 0.08;
const MASKABLE_PADDING = 0.1;

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Resize square app icon to target size (no extra padding — artwork is already square). */
async function resizeIcon(input, size) {
  return sharp(input).resize(size, size, { fit: "fill" }).png();
}

/** Place app icon on a square canvas with safe padding (iOS mask / adaptive icons). */
async function paddedSquare(input, size, paddingRatio = IOS_ICON_PADDING, bg = BRAND_BG) {
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
  }).composite([{ input: resized, left: x, top: y }]).png();
}

/** Center app icon on arbitrary canvas for splash screens. */
async function centeredOnCanvas(input, width, height, contentScale = 0.38, bg = BRAND_BG) {
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

/** Every pixel size required for a complete iOS AppIcon.appiconset. */
const IOS_APP_ICON_SIZES = [
  { filename: "AppIcon-20@2x.png", pixel: 40, idiom: "iphone", scale: "2x", size: "20x20" },
  { filename: "AppIcon-20@3x.png", pixel: 60, idiom: "iphone", scale: "3x", size: "20x20" },
  { filename: "AppIcon-29@2x.png", pixel: 58, idiom: "iphone", scale: "2x", size: "29x29" },
  { filename: "AppIcon-29@3x.png", pixel: 87, idiom: "iphone", scale: "3x", size: "29x29" },
  { filename: "AppIcon-40@2x.png", pixel: 80, idiom: "iphone", scale: "2x", size: "40x40" },
  { filename: "AppIcon-40@3x.png", pixel: 120, idiom: "iphone", scale: "3x", size: "40x40" },
  { filename: "AppIcon-60@2x.png", pixel: 120, idiom: "iphone", scale: "2x", size: "60x60" },
  { filename: "AppIcon-60@3x.png", pixel: 180, idiom: "iphone", scale: "3x", size: "60x60" },
  { filename: "AppIcon-20.png", pixel: 20, idiom: "ipad", scale: "1x", size: "20x20" },
  { filename: "AppIcon-20@2x-1.png", pixel: 40, idiom: "ipad", scale: "2x", size: "20x20" },
  { filename: "AppIcon-29.png", pixel: 29, idiom: "ipad", scale: "1x", size: "29x29" },
  { filename: "AppIcon-29@2x-1.png", pixel: 58, idiom: "ipad", scale: "2x", size: "29x29" },
  { filename: "AppIcon-40.png", pixel: 40, idiom: "ipad", scale: "1x", size: "40x40" },
  { filename: "AppIcon-40@2x-1.png", pixel: 80, idiom: "ipad", scale: "2x", size: "40x40" },
  { filename: "AppIcon-76.png", pixel: 76, idiom: "ipad", scale: "1x", size: "76x76" },
  { filename: "AppIcon-76@2x.png", pixel: 152, idiom: "ipad", scale: "2x", size: "76x76" },
  { filename: "AppIcon-83.5@2x.png", pixel: 167, idiom: "ipad", scale: "2x", size: "83.5x83.5" },
  { filename: "AppIcon-512@2x.png", pixel: 1024, idiom: "ios-marketing", scale: "1x", size: "1024x1024" },
];

async function main() {
  if (!(await fileExists(APP_ICON_SOURCE))) {
    throw new Error(`Missing app icon source: ${APP_ICON_SOURCE}`);
  }

  const generated = [];

  // Header + in-app splash variants — square app icon scaled down (not legacy wordmark)
  const headerDest = path.join(ROOT, "public/logo-header.png");
  generated.push(await writePng(await resizeIcon(APP_ICON_SOURCE, 256), headerDest));

  const logoDest = path.join(ROOT, "public/logo.png");
  generated.push(await writePng(await resizeIcon(APP_ICON_SOURCE, 512), logoDest));

  // 1024×1024 master for app icons
  const master1024 = path.join(ROOT, "assets/branding/logo-icon-1024.png");
  generated.push(
    await writePng(await paddedSquare(APP_ICON_SOURCE, 1024, IOS_ICON_PADDING), master1024)
  );

  // Public web / PWA icons
  const webSizes = [
    { name: "public/logo-icon.png", size: 512, padded: false },
    { name: "public/icon-192.png", size: 192, padded: false },
    { name: "public/icon-512.png", size: 512, padded: false },
    { name: "public/icon-512-maskable.png", size: 512, padded: true },
    { name: "public/apple-touch-icon.png", size: 180, padded: true },
    { name: "public/favicon-32.png", size: 32, padded: false },
    { name: "public/favicon-16.png", size: 16, padded: false },
  ];

  for (const item of webSizes) {
    const dest = path.join(ROOT, item.name);
    const pipeline = item.padded
      ? await paddedSquare(APP_ICON_SOURCE, item.size, MASKABLE_PADDING)
      : await resizeIcon(APP_ICON_SOURCE, item.size);
    generated.push(await writePng(pipeline, dest));
  }

  // favicon.ico (32px PNG served as favicon)
  await writePng(await resizeIcon(APP_ICON_SOURCE, 32), path.join(ROOT, "public/favicon.ico"));
  generated.push({ path: "public/favicon.ico", width: 32, height: 32, note: "PNG-as-ICO" });

  // iOS App Icon — every required size with safe padding
  const iosIconDir = path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset");
  const iosContentsImages = [];

  for (const entry of IOS_APP_ICON_SIZES) {
    const dest = path.join(iosIconDir, entry.filename);
    generated.push(
      await writePng(await paddedSquare(APP_ICON_SOURCE, entry.pixel, IOS_ICON_PADDING), dest)
    );
    iosContentsImages.push({
      filename: entry.filename,
      idiom: entry.idiom,
      scale: entry.scale,
      size: entry.size,
    });
  }

  await writeFile(
    path.join(iosIconDir, "Contents.json"),
    JSON.stringify({ images: iosContentsImages, info: { author: "xcode", version: 1 } }, null, 2)
  );

  // iOS Splash (2732×2732 @1x/2x/3x — centered app icon on td-bg)
  const splashDir = path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset");
  const splashNames = ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"];
  for (const name of splashNames) {
    generated.push(
      await writePng(
        await centeredOnCanvas(APP_ICON_SOURCE, 2732, 2732, 0.38),
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
    const fg = await paddedSquare(APP_ICON_SOURCE, size, IOS_ICON_PADDING, {
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
    });

    const bg = sharp({
      create: { width: size, height: size, channels: 4, background: BRAND_BG },
    });

    generated.push(await writePng(fg, path.join(dir, "ic_launcher_foreground.png")));
    generated.push(await writePng(bg, path.join(dir, "ic_launcher_background.png")));
    generated.push(
      await writePng(await paddedSquare(APP_ICON_SOURCE, legacy, IOS_ICON_PADDING), path.join(dir, "ic_launcher.png"))
    );
    generated.push(
      await writePng(
        await paddedSquare(APP_ICON_SOURCE, legacy, IOS_ICON_PADDING),
        path.join(dir, "ic_launcher_round.png")
      )
    );
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
        await centeredOnCanvas(APP_ICON_SOURCE, width, height, 0.38),
        path.join(androidRes, folder, "splash.png")
      )
    );
  }

  // Capacitor splash in public/
  generated.push(
    await writePng(
      await centeredOnCanvas(APP_ICON_SOURCE, 1284, 2778, 0.38),
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
            src: "/icon-512-maskable.png",
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
    JSON.stringify({ source: "assets/app-icon-source.png", generated }, null, 2)
  );

  console.log(`Generated ${generated.length} assets from ${APP_ICON_SOURCE}`);
  for (const g of generated) {
    console.log(`  ${g.path} (${g.width}×${g.height})${g.note ? " " + g.note : ""}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
