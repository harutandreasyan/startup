import type { GenerationType } from '@creatorai/shared';

/**
 * Generation types that work today with zero external billing:
 *  - TEXT_TO_IMAGE → free Pollinations image generation (server-side)
 *  - BACKGROUND_REMOVAL → runs an AI model fully in the browser (free, no key/cost)
 * Every other type is wired to Replicate, which needs billing enabled — until then
 * we present those tools as "coming soon" rather than letting a user spend credits
 * on a request that would fail.
 */
export const AVAILABLE_TYPES: ReadonlySet<GenerationType> = new Set<GenerationType>([
  'TEXT_TO_IMAGE',
  'BACKGROUND_REMOVAL',
]);

export const isTypeAvailable = (type: GenerationType): boolean => AVAILABLE_TYPES.has(type);

/**
 * Tools that run entirely in the browser (no backend, no credits) — the user uploads
 * an image and we process it locally. Free and private (the image never leaves the device).
 */
export const CLIENT_SIDE_TYPES: ReadonlySet<GenerationType> = new Set<GenerationType>([
  'BACKGROUND_REMOVAL',
]);

export const isClientSide = (type: GenerationType): boolean => CLIENT_SIDE_TYPES.has(type);

/** Human-friendly labels for every generation type. */
export const TYPE_LABELS: Record<GenerationType, string> = {
  TEXT_TO_IMAGE: 'Text to Image',
  IMAGE_TO_IMAGE: 'Image to Image',
  TEXT_TO_VIDEO: 'Text to Video',
  IMAGE_TO_VIDEO: 'Image to Video',
  TEXT_TO_3D: 'Text to 3D',
  BACKGROUND_REMOVAL: 'Remove Background',
  UPSCALE: 'Upscale',
  INPAINT: 'Inpaint / Edit',
  STYLE_TRANSFER: 'Style Transfer',
};

/** Label for a type string, falling back to a tidied version of the raw value. */
export const typeLabel = (type: string): string =>
  TYPE_LABELS[type as GenerationType] ?? type.replaceAll('_', ' ').toLowerCase();

/**
 * Prompt-enhancing style presets for text-to-image. They are model-agnostic — the
 * chosen suffix is appended to the user's prompt, so they work with the free
 * Pollinations models and need no backend changes.
 */
export interface StylePreset {
  id: string;
  label: string;
  /** Appended to the prompt (empty for "None"). */
  suffix: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'none', label: 'None', suffix: '' },
  {
    id: 'photo',
    label: 'Photorealistic',
    suffix: 'photorealistic, ultra-detailed, 50mm photograph, natural lighting, high resolution',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    suffix: 'cinematic film still, dramatic lighting, shallow depth of field, color graded, 35mm',
  },
  {
    id: 'anime',
    label: 'Anime',
    suffix: 'anime style, vibrant cel shading, clean line art, studio-quality illustration',
  },
  {
    id: 'digital',
    label: 'Digital Art',
    suffix: 'digital painting, highly detailed, trending on artstation, concept art',
  },
  {
    id: '3d',
    label: '3D Render',
    suffix: '3D render, octane render, physically based, soft global illumination, ultra detailed',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    suffix: 'delicate watercolor painting, soft color washes, textured paper, hand-painted',
  },
  {
    id: 'neon',
    label: 'Neon',
    suffix: 'neon-noir, glowing neon lights, cyberpunk, vivid magenta and cyan, dramatic contrast',
  },
];

/** Combine a base prompt with a style preset suffix. */
export function applyStyle(prompt: string, preset: StylePreset | undefined): string {
  const base = prompt.trim();
  if (!preset || !preset.suffix) return base;
  return `${base}, ${preset.suffix}`;
}
