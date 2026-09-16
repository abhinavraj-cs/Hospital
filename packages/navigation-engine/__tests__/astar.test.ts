import { describe, it, expect } from 'vitest';
import { NavigationGraph } from '../src/graph';
import { findPathAStar } from '../src/astar';
import { NodeType, RoutePreference } from '@hospital-nav/shared-types';

describe('A* Pathfinding', () => {
  it('finds shortest path on simple graph', () => {
    const graph = new NavigationGraph();
    // Add nodes
    graph.addNode({ id: 'A', x: 0, y: 0, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    graph.addNode({ id: 'B', x: 10, y: 0, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    graph.addNode({ id: 'C', x: 10, y: 10, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    
    // Add edges
    graph.addEdge({ id: 'E1', from: 'A', to: 'B', distance: 10, accessible: true, stairsRequired: false, elevatorRequired: false, isEmergencyRoute: false, bidirectional: true });
    graph.addEdge({ id: 'E2', from: 'B', to: 'C', distance: 10, accessible: true, stairsRequired: false, elevatorRequired: false, isEmergencyRoute: false, bidirectional: true });

    const path = findPathAStar(graph, { startNodeId: 'A', endNodeId: 'C', preference: RoutePreference.SHORTEST });
    
    expect(path).toBeDefined();
    expect(path?.nodes.length).toBe(3);
    expect(path?.nodes.map(n => n.id)).toEqual(['A', 'B', 'C']);
  });

  it('respects accessibility constraints', () => {
    const graph = new NavigationGraph();
    graph.addNode({ id: 'A', x: 0, y: 0, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    graph.addNode({ id: 'B', x: 10, y: 0, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    graph.addNode({ id: 'C', x: 10, y: 10, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    
    // Direct path has stairs
    graph.addEdge({ id: 'E1', from: 'A', to: 'C', distance: 14, accessible: true, stairsRequired: true, elevatorRequired: false, isEmergencyRoute: false, bidirectional: true });
    // Accessible path
    graph.addEdge({ id: 'E2', from: 'A', to: 'B', distance: 10, accessible: true, stairsRequired: false, elevatorRequired: false, isEmergencyRoute: false, bidirectional: true });
    graph.addEdge({ id: 'E3', from: 'B', to: 'C', distance: 10, accessible: true, stairsRequired: false, elevatorRequired: false, isEmergencyRoute: false, bidirectional: true });

    const path = findPathAStar(graph, { startNodeId: 'A', endNodeId: 'C', preference: RoutePreference.ACCESSIBLE });
    
    expect(path).toBeDefined();
    expect(path?.nodes.map(n => n.id)).toEqual(['A', 'B', 'C']); // Avoids A->C stairs
  });

  it('returns null when no route exists', () => {
    const graph = new NavigationGraph();
    graph.addNode({ id: 'A', x: 0, y: 0, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    graph.addNode({ id: 'B', x: 10, y: 0, floorId: 'F1', nodeType: NodeType.CORRIDOR, accessible: true });
    
    const path = findPathAStar(graph, { startNodeId: 'A', endNodeId: 'B', preference: RoutePreference.SHORTEST });
    
    expect(path).toBeNull();
  });
});
