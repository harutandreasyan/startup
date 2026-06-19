import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Credit packs
  await prisma.creditPack.createMany({
    data: [
      { name: 'Starter', credits: 100, priceUsd: 499, sortOrder: 0 },
      { name: 'Pro', credits: 400, priceUsd: 1499, sortOrder: 1 },
      { name: 'Ultra', credits: 1200, priceUsd: 3999, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  // AI models
  await prisma.aiModel.createMany({
    data: [
      // --- FREE models (Pollinations.ai — no API key, no billing) ---
      {
        slug: 'flux-schnell',
        name: 'Flux (Free)',
        provider: 'pollinations',
        providerModelId: 'flux',
        type: 'TEXT_TO_IMAGE',
        creditCost: 2,
        description: 'Fast, free image generation — great for quick iterations',
        tags: ['fast', 'image', 'free'],
        sortOrder: 0,
      },
      {
        slug: 'turbo',
        name: 'Turbo (Free)',
        provider: 'pollinations',
        providerModelId: 'turbo',
        type: 'TEXT_TO_IMAGE',
        creditCost: 1,
        description: 'Fastest free image generation',
        tags: ['fast', 'image', 'free'],
        sortOrder: 1,
      },
      // --- PAID models (Replicate — require billing at replicate.com/account/billing) ---
      {
        slug: 'flux-dev',
        name: 'Flux Dev (Premium)',
        provider: 'replicate',
        providerModelId: 'black-forest-labs/flux-dev',
        type: 'TEXT_TO_IMAGE',
        creditCost: 4,
        description: 'Higher quality image generation (requires Replicate billing)',
        tags: ['quality', 'image', 'premium'],
        sortOrder: 2,
      },
      {
        slug: 'rembg',
        name: 'Remove Background',
        provider: 'replicate',
        providerModelId: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
        type: 'BACKGROUND_REMOVAL',
        creditCost: 1,
        description: 'Remove image backgrounds instantly',
        tags: ['editing', 'background'],
        sortOrder: 10,
      },
      {
        slug: 'real-esrgan',
        name: 'Real-ESRGAN Upscaler',
        provider: 'replicate',
        providerModelId: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
        type: 'UPSCALE',
        creditCost: 2,
        description: 'Upscale images 2-4x with AI enhancement',
        tags: ['editing', 'upscale'],
        sortOrder: 11,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
