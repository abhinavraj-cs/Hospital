import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients = new Map<string, any>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract auth token
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'fallback-secret',
        });
        this.connectedClients.set(client.id, payload);
      } else {
        // Allow anonymous connections for patients observing queues/availability
        this.connectedClients.set(client.id, { role: 'ANONYMOUS' });
      }

      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.warn(`Failed to authenticate client ${client.id}: ${(error as Error).message}`);
      // Fallback to anonymous rather than disconnecting
      this.connectedClients.set(client.id, { role: 'ANONYMOUS' });
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast event to all clients or specific room
   */
  broadcast(event: string, data: any, room?: string) {
    if (room) {
      this.server.to(room).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }
}
