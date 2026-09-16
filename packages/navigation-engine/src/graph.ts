import { GraphNode, GraphEdge } from './types';

/**
 * NavigationGraph manages nodes and edges and provides
 * adjacency-list access for pathfinding algorithms.
 */
export class NavigationGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacency: Map<string, Array<{ edgeId: string; neighborId: string }>> = new Map();

  /** Build graph from arrays of nodes and edges */
  constructor(nodes: GraphNode[] = [], edges: GraphEdge[] = []) {
    this.loadGraph(nodes, edges);
  }

  /** Clear and reload the entire graph */
  loadGraph(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();

    for (const node of nodes) {
      this.addNode(node);
    }
    for (const edge of edges) {
      this.addEdge(edge);
    }
  }

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, []);
    }
  }

  removeNode(nodeId: string): void {
    // Remove all connected edges first
    const neighbors = this.adjacency.get(nodeId) || [];
    for (const { edgeId } of neighbors) {
      this.edges.delete(edgeId);
    }
    // Remove from other nodes' adjacency lists
    for (const [, adjList] of this.adjacency) {
      const idx = adjList.findIndex((e) => e.neighborId === nodeId);
      if (idx !== -1) adjList.splice(idx, 1);
    }
    this.nodes.delete(nodeId);
    this.adjacency.delete(nodeId);
  }

  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);

    // Forward direction
    const fromAdj = this.adjacency.get(edge.from);
    if (fromAdj) {
      fromAdj.push({ edgeId: edge.id, neighborId: edge.to });
    }

    // Reverse direction if bidirectional
    if (edge.bidirectional) {
      const toAdj = this.adjacency.get(edge.to);
      if (toAdj) {
        toAdj.push({ edgeId: edge.id, neighborId: edge.from });
      }
    }
  }

  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    const fromAdj = this.adjacency.get(edge.from);
    if (fromAdj) {
      const idx = fromAdj.findIndex((e) => e.edgeId === edgeId);
      if (idx !== -1) fromAdj.splice(idx, 1);
    }

    if (edge.bidirectional) {
      const toAdj = this.adjacency.get(edge.to);
      if (toAdj) {
        const idx = toAdj.findIndex((e) => e.edgeId === edgeId);
        if (idx !== -1) toAdj.splice(idx, 1);
      }
    }

    this.edges.delete(edgeId);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  getNeighbors(nodeId: string): Array<{ edge: GraphEdge; neighbor: GraphNode }> {
    const adjList = this.adjacency.get(nodeId) || [];
    const result: Array<{ edge: GraphEdge; neighbor: GraphNode }> = [];

    for (const { edgeId, neighborId } of adjList) {
      const edge = this.edges.get(edgeId);
      const neighbor = this.nodes.get(neighborId);
      if (edge && neighbor) {
        result.push({ edge, neighbor });
      }
    }

    return result;
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  getNodesByFloor(floorId: string): GraphNode[] {
    return this.getAllNodes().filter((n) => n.floorId === floorId);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  get nodeCount(): number {
    return this.nodes.size;
  }

  get edgeCount(): number {
    return this.edges.size;
  }

  /**
   * Euclidean distance heuristic between two nodes.
   * Adds a floor-change penalty when nodes are on different floors.
   */
  heuristic(a: GraphNode, b: GraphNode): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const planarDist = Math.sqrt(dx * dx + dy * dy);

    // Penalize floor changes
    if (a.floorId !== b.floorId) {
      return planarDist + 50; // Fixed penalty for cross-floor heuristic
    }

    return planarDist;
  }
}
