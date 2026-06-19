import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.R2_BUCKET_NAME || 'creatorai-uploads';
  private readonly publicUrl = process.env.R2_PUBLIC_URL || '';

  private client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });

  /**
   * Download a remote file (e.g. AI provider output URL) and re-upload to our
   * own R2 bucket so the URL never expires. Returns the public CDN URL.
   */
  async ingestFromUrl(sourceUrl: string, key: string): Promise<string> {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ${sourceUrl}: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  buildGenerationKey(generationId: string, index: number, ext = 'png'): string {
    return `generations/${generationId}/${index}.${ext}`;
  }
}
