import { NodeType, RoutePreference } from '@hospital-nav/shared-types';

// ============================================================
// Internal graph types for the navigation engine
// ============================================================

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  floorId: string;
  buildingId?: string;
  nodeType: NodeType;
  accessible: boolean;
  label?: string;
  roomId?: string;
  departmentId?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  distance: number;
  accessible: boolean;
  stairsRequired: boolean;
  elevatorRequired: boolean;
  isEmergencyRoute: boolean;
  bidirectional: boolean;
}

export interface PathResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalDistance: number;
  estimatedTimeMinutes: number;
  floorsTraversed: number;
}

export interface RouteOptions {
  preference: RoutePreference;
  startNodeId: string;
  endNodeId: string;
}

/** Entry in the A* priority queue */
export interface AStarEntry {
  nodeId: string;
  fScore: number;
}

/** Walking speed in meters per minute (average ~80m/min or ~5km/h) */
export const WALKING_SPEED_M_PER_MIN = 75;

/** Penalty multiplier for taking stairs */
export const STAIRS_PENALTY = 3.0;

/** Penalty multiplier for non-accessible routes when accessible pref */
export const INACCESSIBLE_PENALTY = 1000;

/** Bonus multiplier for emergency corridors in emergency mode */
export const EMERGENCY_BONUS = 0.5;

/** Penalty for floor changes */
export const FLOOR_CHANGE_PENALTY = 30;

/** Elevator wait time in meters-equivalent */
export const ELEVATOR_WAIT_EQUIVALENT = 15;
