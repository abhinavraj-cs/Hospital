import { NodeType, type TurnInstruction } from '@hospital-nav/shared-types';
import type { GraphNode, GraphEdge, PathResult } from './types';

/**
 * Generates human-readable turn-by-turn instructions from a pathfinding result.
 * Returns i18n-ready instruction keys with parameters for translation.
 */
export function buildInstructions(pathResult: PathResult): TurnInstruction[] {
  const { nodes, edges } = pathResult;
  if (nodes.length < 2) return [];

  const instructions: TurnInstruction[] = [];
  let stepNum = 1;
  let accumulatedDistance = 0;

  for (let i = 0; i < edges.length; i++) {
    const currentNode = nodes[i];
    const nextNode = nodes[i + 1];
    const edge = edges[i];
    const prevEdge = i > 0 ? edges[i - 1] : null;

    // Check for floor changes (elevator/stairs)
    if (edge.elevatorRequired) {
      // Flush accumulated walking distance first
      if (accumulatedDistance > 0) {
        instructions.push(createWalkInstruction(stepNum++, accumulatedDistance, currentNode));
        accumulatedDistance = 0;
      }

      instructions.push({
        step: stepNum++,
        action: 'TAKE_ELEVATOR',
        description: `Take the elevator to ${nextNode.label || 'the next floor'}`,
        descriptionKey: 'navigation.instruction.takeElevator',
        descriptionParams: { destination: nextNode.label || 'next floor' },
        distance: edge.distance,
        fromNode: currentNode.id,
        toNode: nextNode.id,
        floor: nextNode.floorId,
      });
      continue;
    }

    if (edge.stairsRequired) {
      if (accumulatedDistance > 0) {
        instructions.push(createWalkInstruction(stepNum++, accumulatedDistance, currentNode));
        accumulatedDistance = 0;
      }

      instructions.push({
        step: stepNum++,
        action: 'TAKE_STAIRS',
        description: `Take the stairs to ${nextNode.label || 'the next floor'}`,
        descriptionKey: 'navigation.instruction.takeStairs',
        descriptionParams: { destination: nextNode.label || 'next floor' },
        distance: edge.distance,
        fromNode: currentNode.id,
        toNode: nextNode.id,
        floor: nextNode.floorId,
      });
      continue;
    }

    // Determine turn direction
    if (prevEdge && i > 0) {
      const prevNode = nodes[i - 1];
      const turnAngle = calculateTurnAngle(prevNode, currentNode, nextNode);

      if (Math.abs(turnAngle) > 30) {
        // Flush accumulated distance
        if (accumulatedDistance > 0) {
          instructions.push(createWalkInstruction(stepNum++, accumulatedDistance, currentNode));
          accumulatedDistance = 0;
        }

        const turnDirection = turnAngle > 0 ? 'TURN_RIGHT' : 'TURN_LEFT';
        const turnLabel = turnAngle > 0 ? 'right' : 'left';
        const landmark = nextNode.label || getNodeTypeLabel(nextNode.nodeType);

        instructions.push({
          step: stepNum++,
          action: turnDirection as 'TURN_LEFT' | 'TURN_RIGHT',
          description: `Turn ${turnLabel} at ${currentNode.label || getNodeTypeLabel(currentNode.nodeType)}`,
          descriptionKey: `navigation.instruction.turn${turnAngle > 0 ? 'Right' : 'Left'}`,
          descriptionParams: { landmark: currentNode.label || getNodeTypeLabel(currentNode.nodeType) },
          fromNode: currentNode.id,
          toNode: nextNode.id,
        });
      }
    }

    // Check for notable nodes (entrances, departments, etc.)
    if (currentNode.nodeType === NodeType.ENTRANCE && i === 0) {
      instructions.push({
        step: stepNum++,
        action: 'ENTER',
        description: `Enter through ${currentNode.label || 'the entrance'}`,
        descriptionKey: 'navigation.instruction.enter',
        descriptionParams: { location: currentNode.label || 'the entrance' },
        fromNode: currentNode.id,
        toNode: nextNode.id,
      });
    }

    accumulatedDistance += edge.distance;
  }

  // Flush remaining distance
  if (accumulatedDistance > 0 && nodes.length >= 2) {
    const beforeLast = nodes[nodes.length - 2];
    instructions.push(createWalkInstruction(stepNum++, accumulatedDistance, beforeLast));
  }

  // Final arrival instruction
  const lastNode = nodes[nodes.length - 1];
  instructions.push({
    step: stepNum,
    action: 'ARRIVE',
    description: `You have arrived at ${lastNode.label || getNodeTypeLabel(lastNode.nodeType)}`,
    descriptionKey: 'navigation.instruction.arrive',
    descriptionParams: { destination: lastNode.label || getNodeTypeLabel(lastNode.nodeType) },
    toNode: lastNode.id,
  });

  return instructions;
}

/**
 * Build accessibility summary for a path.
 */
export function buildAccessibilityInfo(pathResult: PathResult): {
  isFullyAccessible: boolean;
  hasStairs: boolean;
  hasElevator: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let hasStairs = false;
  let hasElevator = false;
  let isFullyAccessible = true;

  for (const edge of pathResult.edges) {
    if (edge.stairsRequired) {
      hasStairs = true;
      isFullyAccessible = false;
    }
    if (edge.elevatorRequired) {
      hasElevator = true;
    }
    if (!edge.accessible) {
      isFullyAccessible = false;
    }
  }

  for (const node of pathResult.nodes) {
    if (!node.accessible) {
      isFullyAccessible = false;
    }
  }

  if (hasStairs && !hasElevator) {
    warnings.push('This route requires stairs. No elevator alternative available on this path.');
  }
  if (!isFullyAccessible) {
    warnings.push('Parts of this route may not be fully wheelchair accessible.');
  }

  return { isFullyAccessible, hasStairs, hasElevator, warnings };
}

// ============================================================
// Helper functions
// ============================================================

function createWalkInstruction(
  step: number,
  distance: number,
  fromNode: GraphNode,
): TurnInstruction {
  const roundedDist = Math.round(distance);
  return {
    step,
    action: 'WALK_STRAIGHT',
    description: `Walk straight for ${roundedDist} meters`,
    descriptionKey: 'navigation.instruction.walkStraight',
    descriptionParams: { distance: roundedDist },
    distance: roundedDist,
    fromNode: fromNode.id,
  };
}

/**
 * Calculate the angle of the turn at node B given path A → B → C.
 * Positive = right turn, Negative = left turn.
 */
function calculateTurnAngle(a: GraphNode, b: GraphNode, c: GraphNode): number {
  const angle1 = Math.atan2(b.y - a.y, b.x - a.x);
  const angle2 = Math.atan2(c.y - b.y, c.x - b.x);
  let diff = ((angle2 - angle1) * 180) / Math.PI;

  // Normalize to [-180, 180]
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return diff;
}

function getNodeTypeLabel(nodeType: NodeType): string {
  const labels: Record<NodeType, string> = {
    [NodeType.ENTRANCE]: 'Entrance',
    [NodeType.CORRIDOR]: 'Corridor',
    [NodeType.ROOM]: 'Room',
    [NodeType.DEPARTMENT]: 'Department',
    [NodeType.ELEVATOR]: 'Elevator',
    [NodeType.STAIR]: 'Stairs',
    [NodeType.ESCALATOR]: 'Escalator',
    [NodeType.EXIT]: 'Exit',
    [NodeType.EMERGENCY]: 'Emergency',
    [NodeType.INTERSECTION]: 'Junction',
  };
  return labels[nodeType] || 'Location';
}
