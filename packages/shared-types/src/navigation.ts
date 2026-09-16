// ============================================================
// Navigation Types
// ============================================================

export enum NodeType {
  ENTRANCE = 'ENTRANCE',
  CORRIDOR = 'CORRIDOR',
  ROOM = 'ROOM',
  DEPARTMENT = 'DEPARTMENT',
  ELEVATOR = 'ELEVATOR',
  STAIR = 'STAIR',
  ESCALATOR = 'ESCALATOR',
  EXIT = 'EXIT',
  EMERGENCY = 'EMERGENCY',
  INTERSECTION = 'INTERSECTION',
}

export enum RoutePreference {
  SHORTEST = 'SHORTEST',
  FASTEST = 'FASTEST',
  ACCESSIBLE = 'ACCESSIBLE',
  AVOID_STAIRS = 'AVOID_STAIRS',
  ELEVATOR_PREFERRED = 'ELEVATOR_PREFERRED',
  EMERGENCY = 'EMERGENCY',
}

export interface NavigationNode {
  id: string;
  floorId: string;
  x: number;
  y: number;
  nodeType: NodeType;
  accessible: boolean;
  label?: string;
  roomId?: string;
  departmentId?: string;
  buildingId?: string;
  metadata?: Record<string, unknown>;
}

export interface NavigationEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distance: number;
  accessible: boolean;
  stairsRequired: boolean;
  elevatorRequired: boolean;
  isEmergencyRoute: boolean;
  bidirectional: boolean;
}

export interface TurnInstruction {
  step: number;
  action: 'WALK_STRAIGHT' | 'TURN_LEFT' | 'TURN_RIGHT' | 'TAKE_ELEVATOR' | 'TAKE_STAIRS' | 'ARRIVE' | 'CHANGE_FLOOR' | 'ENTER' | 'EXIT';
  description: string;
  descriptionKey: string;
  descriptionParams: Record<string, string | number>;
  distance?: number;
  fromNode?: string;
  toNode?: string;
  floor?: string;
}

export interface NavigationResult {
  path: NavigationNode[];
  totalDistance: number;
  estimatedTimeMinutes: number;
  floorsTraversed: number;
  instructions: TurnInstruction[];
  accessibility: {
    isFullyAccessible: boolean;
    hasStairs: boolean;
    hasElevator: boolean;
    warnings: string[];
  };
}

export interface RouteRequest {
  fromNodeId: string;
  toNodeId: string;
  preference: RoutePreference;
  hospitalId: string;
}

export interface QRScanResult {
  locationNode: NavigationNode;
  nearbyDepartments: Array<{
    id: string;
    name: string;
    distance: number;
    nodeId: string;
  }>;
  nearbyFacilities: Array<{
    name: string;
    type: string;
    distance: number;
    nodeId: string;
  }>;
}
