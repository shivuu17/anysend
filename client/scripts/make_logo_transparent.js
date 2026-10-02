import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processLogo() {
  console.log('--- Processing Logo: Removing White Background & Making Bigger ---');

  const srcPath = 'C:/Users/91995/.gemini/antigravity/brain/a4a17588-9d17-4a1a-930a-a594d0bde506/.user_uploaded/media_1790959264650.png';
  const publicDir = path.resolve(__dirname, '../public');

  const image = sharp(srcPath);
  const metadata = await image.metadata();

  console.log(`Original Dimensions: ${metadata.width} x ${metadata.height}`);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const numPixels = info.width * info.height;

  for (let i = 0; i < numPixels; i++) {
    const offset = i * info.channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // Convert outer white pixels to 100% transparent
    if (r > 230 && g > 230 && b > 230) {
      if (info.channels === 4) {
        data[offset + 3] = 0;
      }
    }
  }

  const processedBuffer = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
  .png()
  .trim()
  .toBuffer();

  const logoPath = path.join(publicDir, 'logo.png');
  const faviconPath = path.join(publicDir, 'favicon.png');
  const viteSvgPath = path.join(publicDir, 'vite.svg');

  await fs.promises.writeFile(logoPath, processedBuffer);
  await fs.promises.writeFile(faviconPath, processedBuffer);
  await fs.promises.writeFile(viteSvgPath, processedBuffer);

  const trimmedMeta = await sharp(processedBuffer).metadata();

  console.log(`✅ Transparent Logo Created Successfully!`);
  console.log(`Trimmed Dimensions: ${trimmedMeta.width} x ${trimmedMeta.height}`);
}

processLogo().catch(console.error);
