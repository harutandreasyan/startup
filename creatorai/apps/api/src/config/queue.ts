export const GENERATION_QUEUE = 'generation';

export interface GenerationJobData {
  generationId: string;
}

export function getRedisConnection() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port) : 6379,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
  };
}
