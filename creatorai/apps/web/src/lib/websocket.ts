import { supabase } from './supabase';
import type { GenerationProgress } from '@creatorai/shared';

type ProgressHandler = (p: GenerationProgress) => void;

let socket: WebSocket | null = null;
const handlers = new Set<ProgressHandler>();

export async function connectWebSocket() {
  if (socket && socket.readyState <= WebSocket.OPEN) return;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  socket = new WebSocket(`${wsUrl}?token=${token}`);

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'generation.progress') {
        handlers.forEach((h) => h(msg as GenerationProgress));
      }
    } catch {
      // ignore malformed messages
    }
  };

  socket.onclose = () => {
    socket = null;
  };
}

export function onProgress(handler: ProgressHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}
