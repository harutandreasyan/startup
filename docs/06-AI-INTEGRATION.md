# 06 — AI Model Integration

## Provider Abstraction Layer

Never call AI providers directly from controllers. Use an abstraction so you can swap providers without touching business logic.

```typescript
// ai-providers.service.ts — unified interface

interface AiGenerationInput {
  model: AiModel;           // from DB catalog
  prompt?: string;
  negativePrompt?: string;
  inputImageUrl?: string;
  params: Record<string, unknown>;
}

interface AiGenerationOutput {
  providerJobId: string;
  status: 'starting' | 'processing' | 'completed' | 'failed';
  outputUrls?: string[];
  error?: string;
}

class AiProvidersService {
  async startGeneration(input: AiGenerationInput): Promise<AiGenerationOutput>;
  async checkStatus(provider: string, jobId: string): Promise<AiGenerationOutput>;
  async cancelJob(provider: string, jobId: string): Promise<void>;
}
```

## Provider: Replicate

Primary provider — hundreds of open-source models, pay per second of compute.

```typescript
// replicate.provider.ts
import Replicate from 'replicate';

class ReplicateProvider {
  private client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  async run(modelId: string, input: Record<string, unknown>) {
    const prediction = await this.client.predictions.create({
      model: modelId,
      input,
    });
    return { providerJobId: prediction.id, status: 'starting' };
  }

  async checkStatus(jobId: string) {
    const prediction = await this.client.predictions.get(jobId);
    return {
      providerJobId: jobId,
      status: this.mapStatus(prediction.status),
      outputUrls: prediction.output ? [].concat(prediction.output) : [],
      error: prediction.error,
    };
  }
}
```

## Provider: Fal.ai

Faster for some models, especially video generation.

```typescript
// fal.provider.ts
import { fal } from '@fal-ai/client';

class FalProvider {
  constructor() {
    fal.config({ credentials: process.env.FAL_KEY });
  }

  async run(modelId: string, input: Record<string, unknown>) {
    const { request_id } = await fal.queue.submit(modelId, { input });
    return { providerJobId: request_id, status: 'starting' };
  }

  async checkStatus(jobId: string) {
    const status = await fal.queue.status(jobId, { logs: false });
    return { providerJobId: jobId, status: this.mapStatus(status.status) };
  }

  async getResult(modelId: string, jobId: string) {
    const result = await fal.queue.result(modelId, { requestId: jobId });
    return { outputUrls: result.data.images?.map(i => i.url) ?? [] };
  }
}
```

## Model Catalog (Initial Models)

### Image Generation

| Model | Provider | Model ID | Credit Cost | Speed |
|-------|----------|----------|------------|-------|
| Flux Schnell | Replicate | black-forest-labs/flux-schnell | 2 | ~2s |
| Flux Dev | Replicate | black-forest-labs/flux-dev | 4 | ~10s |
| SDXL | Replicate | stability-ai/sdxl | 3 | ~8s |
| DALL-E 3 | OpenAI | dall-e-3 | 8 | ~15s |

### Video Generation

| Model | Provider | Model ID | Credit Cost | Speed |
|-------|----------|----------|------------|-------|
| Kling | Replicate | kwaivgi/kling-video | 30 | ~60s |
| Minimax Video | Replicate | minimax/video-01 | 25 | ~90s |
| Wan Video | Fal.ai | fal-ai/wan-t2v | 20 | ~45s |

### Image Editing

| Model | Provider | Model ID | Credit Cost | Speed |
|-------|----------|----------|------------|-------|
| Remove BG | Replicate | cjwbw/rembg | 1 | ~3s |
| Upscale (Real-ESRGAN) | Replicate | nightmareai/real-esrgan | 2 | ~5s |
| Inpainting (SDXL) | Replicate | stability-ai/sdxl-inpainting | 4 | ~10s |

### 3D Generation

| Model | Provider | Model ID | Credit Cost | Speed |
|-------|----------|----------|------------|-------|
| TripoSR | Replicate | tripo/trellis | 10 | ~20s |
| InstantMesh | Replicate | instant-mesh | 15 | ~30s |

## Generation Flow (Detailed)

```
User submits prompt
        │
        ▼
┌─────────────────┐
│ Validate input  │──> Bad input → 400 error
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check credits   │──> Insufficient → 402 error
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Moderate prompt │──> Flagged → 403 error
│ (OpenAI mod API)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deduct credits  │  (optimistic debit)
│ Create Gen row  │  status = QUEUED
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add to BullMQ   │──> Return { id, status: 'queued' }
│ queue           │
└────────┬────────┘
         │
    (async worker)
         │
         ▼
┌─────────────────┐
│ Call AI provider│
│ (Replicate/Fal) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Poll for result │──> Emit WebSocket: { status: 'processing', progress: 50% }
│ every 2-5s      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 Success    Failure
    │         │
    ▼         ▼
┌────────┐  ┌──────────┐
│Download│  │Refund    │
│result  │  │credits   │
│Upload  │  │Update    │
│to R2   │  │status=   │
│Update  │  │FAILED    │
│status= │  └──────────┘
│COMPLETE│
└────────┘
    │
    ▼
Emit WebSocket: { status: 'completed', outputUrls: [...] }
```

## Content Moderation

Required for App Store approval. Check both input prompts and output images.

```typescript
// moderation.service.ts
import OpenAI from 'openai';

class ModerationService {
  private openai = new OpenAI();

  async checkPrompt(prompt: string): Promise<{ safe: boolean; categories: string[] }> {
    const result = await this.openai.moderations.create({ input: prompt });
    const flagged = result.results[0].flagged;
    const categories = Object.entries(result.results[0].categories)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    return { safe: !flagged, categories };
  }

  // For output images — run async after generation completes
  async checkImage(imageUrl: string): Promise<{ safe: boolean }> {
    // Use OpenAI vision or AWS Rekognition
    // Flag but don't auto-delete — queue for review
  }
}
```

## Result Storage

Upload AI provider outputs to your own R2 storage. Don't rely on provider URLs — they expire.

```typescript
// storage.service.ts
async uploadGenerationResult(
  generationId: string,
  sourceUrl: string,
): Promise<string> {
  const response = await fetch(sourceUrl);
  const buffer = await response.arrayBuffer();
  
  const key = `generations/${generationId}/${Date.now()}.png`;
  
  await this.r2Client.send(new PutObjectCommand({
    Bucket: this.bucket,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: 'image/png',
  }));

  return `${this.publicUrl}/${key}`;
}
```

## Steps

- [ ] Install replicate, @fal-ai/client, openai SDKs
- [ ] Implement AiProvidersService with provider abstraction
- [ ] Implement ReplicateProvider
- [ ] Implement FalProvider
- [ ] Seed AI model catalog in database
- [ ] Implement generation BullMQ worker/processor
- [ ] Implement moderation service (prompt check)
- [ ] Implement R2 storage service for result uploads
- [ ] Implement WebSocket gateway for progress updates
- [ ] Test end-to-end: submit prompt → queue → process → get result
- [ ] Add error handling and credit refund on failure

## Next Step
Proceed to [07-PAYMENTS-CREDITS.md](./07-PAYMENTS-CREDITS.md)
