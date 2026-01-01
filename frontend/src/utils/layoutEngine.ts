import { FamilyTree, LayoutResult, PersonNode, FamilyEdge } from '../data/types';

/**
 * Layout engine for family trees
 * Simple manual layout with full control over positioning
 */

const NODE_WIDTH = 140;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 180;
const SPOUSE_SPACING = 50; // Closer spacing for spouses

interface GenerationData {
  generations: Map<number, string[]>;
  personGeneration: Map<string, number>;
}

/**
 * Assign generation levels to each person
 */
function buildGenerations(tree: FamilyTree): GenerationData {
  const generations = new Map<number, string[]>();
  const personGeneration = new Map<string, number>();
  const visited = new Set<string>();

  function assignGeneration(personId: string, generation: number) {
    if (visited.has(personId)) return;
    visited.add(personId);
    personGeneration.set(personId, generation);

    // First, assign same generation to all spouses (other parents in same families)
    tree.families.forEach((family) => {
      if (family.parents.includes(personId)) {
        // Assign same generation to spouse(s)
        family.parents.forEach((spouseId) => {
          if (!visited.has(spouseId)) {
            visited.add(spouseId);
            personGeneration.set(spouseId, generation);
          }
        });
      }
    });

    // Then find and assign children to next generation
    tree.families.forEach((family) => {
      if (family.parents.includes(personId)) {
        family.children.forEach((childId) => {
          assignGeneration(childId, generation + 1);
        });
      }
    });

    // Find parents and assign to previous generation
    tree.families.forEach((family) => {
      if (family.children.includes(personId)) {
        family.parents.forEach((parentId) => {
          if (!visited.has(parentId)) {
            assignGeneration(parentId, generation - 1);
          }
        });
      }
    });
  }

  // Start from root
  assignGeneration(tree.rootPersonId, 0);

  // Build generations map
  personGeneration.forEach((gen, personId) => {
    if (!generations.has(gen)) {
      generations.set(gen, []);
    }
    generations.get(gen)!.push(personId);
  });

  return { generations, personGeneration };
}

/**
 * Get spouse pairs from families
 */
function getSpousePairs(tree: FamilyTree): Map<string, string[]> {
  const spousePairs = new Map<string, string[]>();

  tree.families.forEach((family) => {
    if (family.parents.length === 2) {
      const [parent1, parent2] = family.parents;
      spousePairs.set(parent1, [parent1, parent2]);
      spousePairs.set(parent2, [parent1, parent2]);
    }
  });

  return spousePairs;
}

/**
 * Calculate layout manually
 */
export function calculateLayout(
  tree: FamilyTree,
  orientation: 'vertical' | 'horizontal' = 'vertical'
): LayoutResult {
  const { generations } = buildGenerations(tree);
  const spousePairs = getSpousePairs(tree);
  const nodes: PersonNode[] = [];
  const edges: FamilyEdge[] = [];

  // Sort generations
  const genArray = Array.from(generations.keys()).sort((a, b) => a - b);
  const minGen = genArray[0];

  // Layout each generation
  genArray.forEach((gen) => {
    const people = generations.get(gen)!;
    const processed = new Set<string>();
    const genPeople: string[] = [];

    // Group spouses together
    people.forEach((personId) => {
      if (processed.has(personId)) return;

      const pair = spousePairs.get(personId);
      if (pair) {
        // Add spouse pair together
        genPeople.push(...pair);
        pair.forEach((p) => processed.add(p));
      } else {
        // Add single person
        genPeople.push(personId);
        processed.add(personId);
      }
    });

    // Calculate positions for this generation
    let currentX = 0;
    const y = (gen - minGen) * VERTICAL_SPACING;

    genPeople.forEach((personId) => {
      // Check if this person is part of a spouse pair
      const pair = spousePairs.get(personId);
      const isFirstInPair = pair && pair[0] === personId;
      const isSecondInPair = pair && pair[1] === personId;

      // Position the person
      nodes.push({
        id: personId,
        type: 'person',
        position: { x: currentX, y },
        data: {
          person: tree.persons[personId],
          generation: gen,
        },
      });

      // Update X for next person
      if (isFirstInPair) {
        // Next person is spouse, use closer spacing
        currentX += NODE_WIDTH + SPOUSE_SPACING;
      } else if (isSecondInPair) {
        // After spouse pair, use normal spacing
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      } else {
        // Single person, use normal spacing
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      }
    });
  });

  // Center the first generation (root generation)
  const firstGenNodes = nodes.filter((node) => node.data.generation === minGen);
  if (firstGenNodes.length > 0) {
    // Find the bounding box of all nodes
    const allXPositions = nodes.map((n) => n.position.x);
    const minX = Math.min(...allXPositions);
    const maxX = Math.max(...allXPositions.map((x, i) => x + NODE_WIDTH));
    const totalWidth = maxX - minX;

    // Calculate the center of the first generation
    const firstGenMinX = Math.min(...firstGenNodes.map((n) => n.position.x));
    const firstGenMaxX = Math.max(...firstGenNodes.map((n) => n.position.x + NODE_WIDTH));
    const firstGenCenter = (firstGenMinX + firstGenMaxX) / 2;

    // Calculate offset to center first generation at totalWidth/2
    const centerOffset = totalWidth / 2 - firstGenCenter;

    // Shift ALL nodes to center the first generation
    firstGenNodes.forEach((node) => {
      node.position.x += centerOffset;
    });
  }

  // Create edges
  tree.families.forEach((family) => {
    const parents = family.parents.filter((pid) => tree.persons[pid]);
    const children = family.children.filter((cid) => tree.persons[cid]);

    // Spouse edge (horizontal connection between parents)
    if (parents.length === 2) {
      edges.push({
        id: `spouse-${family.id}`,
        source: parents[0],
        target: parents[1],
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'spouse',
        data: {
          type: 'spouse',
        },
      });
    }

    // Parent-child edges with T-junction routing
    if (parents.length > 0 && children.length > 0) {
      // Calculate midpoint between parents for source
      const parentNodes = parents
        .map((pid) => nodes.find((n) => n.id === pid))
        .filter((n): n is PersonNode => n !== undefined);

      if (parentNodes.length > 0) {
        // Use first parent as source node, but calculate midpoint X
        const sourceParent = parents[0];
        const parentNode = parentNodes[0];

        // Calculate midpoint X between parents
        let midpointX = parentNode.position.x + NODE_WIDTH / 2;
        if (parentNodes.length === 2) {
          const parent1X = parentNodes[0].position.x + NODE_WIDTH / 2;
          const parent2X = parentNodes[1].position.x + NODE_WIDTH / 2;
          midpointX = (parent1X + parent2X) / 2;
        }

        // Calculate positions for T-junction
        const spouseEdgeY = parentNode.position.y + NODE_HEIGHT / 2 + 6; // Middle of parent nodes (where spouse edge is)
        const junctionY = parentNode.position.y + NODE_HEIGHT + 60; // Horizontal junction line below parents

        children.forEach((child) => {
          edges.push({
            id: `parent-child-${sourceParent}-${child}`,
            source: sourceParent,
            target: child,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'parentChild',
            data: {
              type: 'parent-child',
              junctionY,
              midpointX, // X position at center of spouse pair
              spouseEdgeY, // Y position where spouse edge is (start point)
            },
          });
        });
      }
    }
  });

  // Handle horizontal orientation (swap x and y)
  if (orientation === 'horizontal') {
    nodes.forEach((node) => {
      const temp = node.position.x;
      node.position.x = node.position.y;
      node.position.y = temp;
    });
  }

  return { nodes, edges };
}

export default calculateLayout;
