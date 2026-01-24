// BOLT: Real-time status updates via WebSocket
// SUN TZU: Strategic communication layer for agent progress

import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export function initSocket(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const { workspaceId } = socket.handshake.query;

    if (workspaceId) {
      socket.join(`workspace:${workspaceId}`);
      console.log(`[Socket] User joined workspace: ${workspaceId}`);
    }

    socket.on('disconnect', () => {
      console.log('[Socket] User disconnected');
    });
  });

  return io;
}

export function getSocket() {
  return io;
}

/**
 * Broadcast agent progress to workspace members
 */
export function broadcastProgress(workspaceId: string, executionId: string, data: any) {
  if (io) {
    io.to(`workspace:${workspaceId}`).emit('execution.progress', {
      executionId,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}
