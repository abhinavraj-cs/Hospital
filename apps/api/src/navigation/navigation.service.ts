import { Injectable, OnModuleInit, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  NavigationGraph, 
  findPathAStar, 
  findPathDijkstra, 
  buildInstructions, 
  buildAccessibilityInfo,
  GraphNode,
  GraphEdge
} from '@hospital-nav/navigation-engine';
import { RoutePreference, NodeType } from '@hospital-nav/shared-types';

@Injectable()
export class NavigationService implements OnModuleInit {
  private graph: NavigationGraph;
  private readonly logger = new Logger(NavigationService.name);

  constructor(private prisma: PrismaService) {
    this.graph = new NavigationGraph();
  }

  async onModuleInit() {
    await this.reloadGraph();
  }

  /**
   * Loads all nodes and edges from the database into the in-memory graph
   */
  async reloadGraph() {
    this.logger.log('Reloading navigation graph from database...');
    
    const dbNodes = await this.prisma.navigationNode.findMany();
    const dbEdges = await this.prisma.navigationEdge.findMany();

    const graphNodes: GraphNode[] = dbNodes.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      floorId: n.floorId,
      buildingId: n.buildingId || undefined,
      nodeType: n.nodeType as unknown as NodeType, // Cast between Prisma enum and shared enum
      accessible: n.accessible,
      label: n.label || undefined,
      roomId: n.roomId || undefined,
      departmentId: n.departmentId || undefined,
    }));

    const graphEdges: GraphEdge[] = dbEdges.map(e => ({
      id: e.id,
      from: e.fromNodeId,
      to: e.toNodeId,
      distance: e.distance,
      accessible: e.accessible,
      stairsRequired: e.stairsRequired,
      elevatorRequired: e.elevatorRequired,
      isEmergencyRoute: e.isEmergencyRoute,
      bidirectional: e.bidirectional,
    }));

    this.graph.loadGraph(graphNodes, graphEdges);
    this.logger.log(`Graph loaded: ${this.graph.nodeCount} nodes, ${this.graph.edgeCount} edges`);
  }

  /**
   * Calculates a route between two nodes using A*
   */
  async getRoute(fromNodeId: string, toNodeId: string, preference: RoutePreference = RoutePreference.SHORTEST) {
    if (!this.graph.hasNode(fromNodeId)) {
      throw new NotFoundException(`Start node ${fromNodeId} not found`);
    }
    if (!this.graph.hasNode(toNodeId)) {
      throw new NotFoundException(`End node ${toNodeId} not found`);
    }

    const pathResult = findPathAStar(this.graph, {
      startNodeId: fromNodeId,
      endNodeId: toNodeId,
      preference,
    });

    if (!pathResult) {
      throw new BadRequestException('No route available between these locations with current preferences');
    }

    const instructions = buildInstructions(pathResult);
    const accessibility = buildAccessibilityInfo(pathResult);

    return {
      path: pathResult.nodes,
      totalDistance: pathResult.totalDistance,
      estimatedTimeMinutes: pathResult.estimatedTimeMinutes,
      floorsTraversed: pathResult.floorsTraversed,
      instructions,
      accessibility,
    };
  }

  // --- Graph Management Methods ---

  async getNodes(floorId?: string) {
    if (floorId) {
      return this.graph.getNodesByFloor(floorId);
    }
    return this.graph.getAllNodes();
  }

  async getEdges() {
    return this.graph.getAllEdges();
  }
}
