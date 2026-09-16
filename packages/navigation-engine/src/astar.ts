import { RoutePreference, NodeType } from '@hospital-nav/shared-types';
import { NavigationGraph } from './graph';
import {
  GraphNode,
  GraphEdge,
  PathResult,
  RouteOptions,
  STAIRS_PENALTY,
  INACCESSIBLE_PENALTY,
  EMERGENCY_BONUS,
  ELEVATOR_WAIT_EQUIVALENT,
  WALKING_SPEED_M_PER_MIN,
} from './types';

/**
 * A* pathfinding algorithm with route preference support.
 *
 * Modifies edge weights based on the selected preference to produce
 * shortest, fastest, accessible, elevator-preferred, or emergency routes.
 */
export function findPathAStar(
  graph: NavigationGraph,
  options: RouteOptions,
): PathResult | null {
  const { startNodeId, endNodeId, preference } = options;

  const startNode = graph.getNode(startNodeId);
  const endNode = graph.getNode(endNodeId);

  if (!startNode || !endNode) {
    return null;
  }

  // A* data structures
  const openSet = new Set<string>([startNodeId]);
  const cameFrom = new Map<string, { nodeId: string; edgeId: string }>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, graph.heuristic(startNode, endNode));

  while (openSet.size > 0) {
    // Get node with lowest fScore from open set
    let currentId = '';
    let lowestF = Infinity;
    for (const nodeId of openSet) {
      const f = fScore.get(nodeId) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentId = nodeId;
      }
    }

    if (currentId === endNodeId) {
      return reconstructPath(graph, cameFrom, startNodeId, endNodeId);
    }

    openSet.delete(currentId);

    const neighbors = graph.getNeighbors(currentId);
    for (const { edge, neighbor } of neighbors) {
      // Calculate weighted edge cost based on preference
      const edgeCost = calculateEdgeCost(edge, neighbor, preference);

      // Skip completely blocked paths
      if (edgeCost >= INACCESSIBLE_PENALTY) {
        continue;
      }

      const tentativeG = (gScore.get(currentId) ?? Infinity) + edgeCost;

      if (tentativeG < (gScore.get(neighbor.id) ?? Infinity)) {
        cameFrom.set(neighbor.id, { nodeId: currentId, edgeId: edge.id });
        gScore.set(neighbor.id, tentativeG);
        fScore.set(
          neighbor.id,
          tentativeG + graph.heuristic(neighbor, endNode),
        );

        if (!openSet.has(neighbor.id)) {
          openSet.add(neighbor.id);
        }
      }
    }
  }

  // No path found
  return null;
}

/**
 * Dijkstra's algorithm — used as fallback for complex multi-floor routing.
 * Does not use a heuristic (equivalent to A* with h=0).
 */
export function findPathDijkstra(
  graph: NavigationGraph,
  options: RouteOptions,
): PathResult | null {
  const { startNodeId, endNodeId, preference } = options;

  const startNode = graph.getNode(startNodeId);
  const endNode = graph.getNode(endNodeId);

  if (!startNode || !endNode) {
    return null;
  }

  const dist = new Map<string, number>();
  const cameFrom = new Map<string, { nodeId: string; edgeId: string }>();
  const visited = new Set<string>();

  // Initialize all distances to Infinity
  for (const node of graph.getAllNodes()) {
    dist.set(node.id, Infinity);
  }
  dist.set(startNodeId, 0);

  while (true) {
    // Find unvisited node with smallest distance
    let currentId = '';
    let minDist = Infinity;
    for (const [nodeId, d] of dist) {
      if (!visited.has(nodeId) && d < minDist) {
        minDist = d;
        currentId = nodeId;
      }
    }

    if (currentId === '' || minDist === Infinity) {
      break; // No path found
    }

    if (currentId === endNodeId) {
      return reconstructPath(graph, cameFrom, startNodeId, endNodeId);
    }

    visited.add(currentId);

    const neighbors = graph.getNeighbors(currentId);
    for (const { edge, neighbor } of neighbors) {
      if (visited.has(neighbor.id)) continue;

      const edgeCost = calculateEdgeCost(edge, neighbor, preference);
      if (edgeCost >= INACCESSIBLE_PENALTY) continue;

      const alt = minDist + edgeCost;
      if (alt < (dist.get(neighbor.id) ?? Infinity)) {
        dist.set(neighbor.id, alt);
        cameFrom.set(neighbor.id, { nodeId: currentId, edgeId: edge.id });
      }
    }
  }

  return null;
}

/**
 * Calculate the effective cost of traversing an edge based on route preference.
 */
function calculateEdgeCost(
  edge: GraphEdge,
  targetNode: GraphNode,
  preference: RoutePreference,
): number {
  let cost = edge.distance;

  switch (preference) {
    case RoutePreference.SHORTEST:
      // Raw distance — no modifications
      break;

    case RoutePreference.FASTEST:
      // Corridors are faster to walk through
      if (targetNode.nodeType === NodeType.CORRIDOR || targetNode.nodeType === NodeType.INTERSECTION) {
        cost *= 0.9;
      }
      if (edge.stairsRequired) {
        cost *= 1.5; // Stairs are slower
      }
      break;

    case RoutePreference.ACCESSIBLE:
      // Block non-accessible paths entirely
      if (!edge.accessible || !targetNode.accessible) {
        return INACCESSIBLE_PENALTY;
      }
      if (edge.stairsRequired) {
        return INACCESSIBLE_PENALTY; // No stairs for wheelchair
      }
      if (edge.elevatorRequired) {
        cost += ELEVATOR_WAIT_EQUIVALENT; // Small wait but allowed
      }
      break;

    case RoutePreference.AVOID_STAIRS:
      if (edge.stairsRequired) {
        cost *= STAIRS_PENALTY; // Heavy penalty but not blocked
      }
      if (edge.elevatorRequired) {
        cost += ELEVATOR_WAIT_EQUIVALENT;
      }
      break;

    case RoutePreference.ELEVATOR_PREFERRED:
      if (edge.stairsRequired) {
        cost *= STAIRS_PENALTY;
      }
      if (edge.elevatorRequired) {
        cost *= 0.7; // Bonus for elevator routes
      }
      break;

    case RoutePreference.EMERGENCY:
      if (edge.isEmergencyRoute) {
        cost *= EMERGENCY_BONUS; // Emergency corridors are faster
      }
      if (edge.stairsRequired) {
        cost *= 1.2; // Slight stairs penalty
      }
      // Prioritize ground floor / emergency department connections
      if (targetNode.nodeType === NodeType.EMERGENCY) {
        cost *= 0.5;
      }
      break;
  }

  return cost;
}

/**
 * Reconstruct the path from the cameFrom map produced by A* or Dijkstra.
 */
function reconstructPath(
  graph: NavigationGraph,
  cameFrom: Map<string, { nodeId: string; edgeId: string }>,
  startNodeId: string,
  endNodeId: string,
): PathResult {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const floorsSeen = new Set<string>();

  let currentId = endNodeId;
  while (currentId !== startNodeId) {
    const node = graph.getNode(currentId);
    if (node) {
      nodes.unshift(node);
      floorsSeen.add(node.floorId);
    }

    const prev = cameFrom.get(currentId);
    if (!prev) break;

    const edge = graph.getEdge(prev.edgeId);
    if (edge) {
      edges.unshift(edge);
    }

    currentId = prev.nodeId;
  }

  // Add start node
  const startNode = graph.getNode(startNodeId);
  if (startNode) {
    nodes.unshift(startNode);
    floorsSeen.add(startNode.floorId);
  }

  const totalDistance = edges.reduce((sum, e) => sum + e.distance, 0);
  const estimatedTimeMinutes = Math.ceil(totalDistance / WALKING_SPEED_M_PER_MIN);

  return {
    nodes,
    edges,
    totalDistance: Math.round(totalDistance),
    estimatedTimeMinutes,
    floorsTraversed: Math.max(0, floorsSeen.size - 1),
  };
}
