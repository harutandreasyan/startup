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
      {
        slug: 'flux-schnell',
        name: 'Flux Schnell',
        provider: 'replicate',
        providerModelId: 'black-forest-labs/flux-schnell',
        type: 'TEXT_TO_IMAGE',
        creditCost: 2,
        description: 'Fast image generation, great for quick iterations',
        tags: ['fast', 'image'],
        sortOrder: 0,
      },
      {
        slug: 'flux-dev',
        name: 'Flux Dev',
        provider: 'replicate',
        providerModelId: 'black-forest-labs/flux-dev',
        type: 'TEXT_TO_IMAGE',
        creditCost: 4,
        description: 'Higher quality image generation',
        tags: ['quality', 'image'],
        sortOrder: 1,
      },
      {
        slug: 'sdxl',
        name: 'Stable Diffusion XL',
        provider: 'replicate',
        providerModelId: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        type: 'TEXT_TO_IMAGE',
        creditCost: 3,
        description: 'Versatile image generation with fine-tuning support',
        tags: ['versatile', 'image'],
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
