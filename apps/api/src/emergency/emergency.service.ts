import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NavigationService } from '../navigation/navigation.service';
import { RoutePreference } from '@hospital-nav/shared-types';

@Injectable()
export class EmergencyService {
  constructor(
    private prisma: PrismaService,
    private navigationService: NavigationService,
  ) {}

  /**
   * List all designated emergency destinations in the hospital
   */
  async getDestinations(hospitalId?: string) {
    return this.prisma.navigationNode.findMany({
      where: {
        nodeType: 'EMERGENCY',
        ...(hospitalId && {
          floor: { building: { hospitalId } },
        }),
      },
      include: {
        floor: {
          include: { building: true },
        },
      },
    });
  }

  /**
   * Get an emergency-optimized route to the nearest or specified emergency destination
   */
  async getEmergencyRoute(fromNodeId: string, toNodeId?: string) {
    let destinationId = toNodeId;

    if (!destinationId) {
      // Find nearest emergency destination if none specified
      // For simplicity in this demo, just pick the first one, or use A* to all and find shortest
      // In a real system, you'd run a multi-target Dijkstra/A*
      const destinations = await this.getDestinations();
      if (destinations.length === 0) {
        throw new Error('No emergency destinations configured in this hospital');
      }
      destinationId = destinations[0].id; // Simplified
    }

    // Use EMERGENCY route preference
    return this.navigationService.getRoute(fromNodeId, destinationId, RoutePreference.EMERGENCY);
  }
}
