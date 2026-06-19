import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'http';
import { createClient } from '@supabase/supabase-js';
import type { GenerationProgress } from '@creatorai/shared';

/**
 * Tracks one or more live sockets per user and pushes generation progress
 * events to them. Auth is via a `token` query param on the WS handshake.
 */
@Injectable()
@WebSocketGateway({ cors: { origin: true } })
export class GenerationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GenerationsGateway.name);
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || '',
  );

  // userId -> Set of socket clients
  private clients = new Map<string, Set<any>>();

  /**
   * With @nestjs/platform-ws the second argument is the raw HTTP upgrade
   * request, which carries the query string with our auth token.
   */
  async handleConnection(client: any, request: IncomingMessage) {
    try {
      const token = this.extractToken(request);
      if (!token) {
        client.close(4001, 'Unauthorized');
        return;
      }

      const { data, error } = await this.supabase.auth.getUser(token);
      if (error || !data.user) {
        client.close(4001, 'Unauthorized');
        return;
      }

      const userId = data.user.id;
      client.userId = userId;
      if (!this.clients.has(userId)) this.clients.set(userId, new Set());
      this.clients.get(userId)!.add(client);
      this.logger.log(`WS connected for user ${userId}`);
    } catch (err) {
      this.logger.warn(`WS connection rejected: ${err}`);
      client.close(4001, 'Unauthorized');
    }
  }

  handleDisconnect(client: any) {
    const userId = client.userId;
    if (userId && this.clients.has(userId)) {
      this.clients.get(userId)!.delete(client);
      if (this.clients.get(userId)!.size === 0) this.clients.delete(userId);
    }
  }

  emitProgress(userId: string, payload: GenerationProgress) {
    const sockets = this.clients.get(userId);
    if (!sockets) return;
    const message = JSON.stringify({ type: 'generation.progress', ...payload });
    for (const socket of sockets) {
      if (socket.readyState === 1 /* OPEN */) socket.send(message);
    }
  }

  private extractToken(request: IncomingMessage): string | null {
    if (!request.url) return null;
    // request.url is a path like "/?token=abc"; build a URL to parse the query
    const parsed = new URL(request.url, 'http://localhost');
    return parsed.searchParams.get('token');
  }
}
