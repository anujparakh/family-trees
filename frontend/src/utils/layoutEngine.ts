import { FamilyTree, LayoutResult, PersonNode, FamilyEdge } from '../data/types';

/**
 * Layout engine for family trees
 * Calculates node positions for vertical and horizontal orientations
 * Returns ReactFlow-compatible nodes and edges
 */

const NODE_WIDTH = 140;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 120;

interface GenerationData {
  generations: Map<number, string[]>;
  personGeneration: Map<string, number>;
}

/**
 * Build generational levels from family tree
 */
function buildGenerations(tree: FamilyTree): GenerationData {
  const generations = new Map<number, string[]>();
  const personGeneration = new Map<string, number>();
  const visited = new Set<string>();

  function assignGeneration(personId: string, generation: number) {
    if (visited.has(personId)) return;
    visited.add(personId);

    personGeneration.set(personId, generation);

    if (!generations.has(generation)) {
      generations.set(generation, []);
    }
    generations.get(generation)!.push(personId);

    // Find children
    tree.families.forEach((family) => {
      if (family.parents.includes(personId)) {
        family.children.forEach((childId) => {
          assignGeneration(childId, generation + 1);
        });
      }
    });

    // Find parents
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

  return { generations, personGeneration };
}

/**
 * Calculate vertical layout (ancestors at top, descendants below)
 */
export function calculateVerticalLayout(tree: FamilyTree): LayoutResult {
  const { generations, personGeneration } = buildGenerations(tree);

  const nodes: PersonNode[] = [];
  const edges: FamilyEdge[] = [];

  // Calculate positions for each generation
  const genArray = Array.from(generations.keys()).sort((a, b) => a - b);
  const minGen = genArray[0];
  const maxGen = genArray[genArray.length - 1];

  let maxWidth = 0;

  // Temporary position map for edge calculation
  const positionMap = new Map<string, { x: number; y: number }>();

  genArray.forEach((gen) => {
    const people = generations.get(gen)!;
    const genWidth = people.length * NODE_WIDTH + (people.length - 1) * HORIZONTAL_SPACING;
    maxWidth = Math.max(maxWidth, genWidth);

    const startX = 0; // We'll center later
    const y = (gen - minGen) * (NODE_HEIGHT + VERTICAL_SPACING);

    people.forEach((personId, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING);
      positionMap.set(personId, { x, y });
    });
  });

  // Center each generation and create ReactFlow nodes
  positionMap.forEach((pos, personId) => {
    const gen = personGeneration.get(personId)!;
    const genPeople = generations.get(gen)!;
    const genWidth = genPeople.length * NODE_WIDTH + (genPeople.length - 1) * HORIZONTAL_SPACING;
    const offset = (maxWidth - genWidth) / 2;

    const PADDING = 50;

    nodes.push({
      id: personId,
      type: 'person',
      position: {
        x: pos.x + offset + PADDING,
        y: pos.y + PADDING,
      },
      data: {
        person: tree.persons[personId],
        generation: gen,
      },
    });
  });

  // Create edges between family members
  tree.families.forEach((family) => {
    const parents = family.parents.filter((pid) => tree.persons[pid]);
    const children = family.children.filter((cid) => tree.persons[cid]);

    // Create spouse edge between parents
    if (parents.length === 2) {
      edges.push({
        id: `spouse-${family.id}`,
        source: parents[0],
        target: parents[1],
        type: 'straight',
        data: {
          type: 'spouse',
        },
        style: {
          stroke: '#9CA3AF',
          strokeWidth: 2,
        },
      });
    }

    // Create parent-child edges
    if (parents.length > 0 && children.length > 0) {
      // For now, connect first parent to each child
      // Later we can add custom edges for more complex routing
      const parent = parents[0];
      children.forEach((child) => {
        edges.push({
          id: `parent-child-${parent}-${child}`,
          source: parent,
          target: child,
          type: 'smoothstep',
          data: {
            type: 'parent-child',
          },
          style: {
            stroke: '#D1D5DB',
            strokeWidth: 1.5,
          },
        });
      });
    }
  });

  const PADDING = 50;
  const bounds = {
    width: maxWidth + PADDING * 2,
    height: (maxGen - minGen) * (NODE_HEIGHT + VERTICAL_SPACING) + NODE_HEIGHT + PADDING * 2,
  };

  return { nodes, edges, bounds };
}

/**
 * Calculate horizontal layout (ancestors at left, descendants to right)
 */
export function calculateHorizontalLayout(tree: FamilyTree): LayoutResult {
  // For POC, use vertical layout and rotate coordinates
  const vertical = calculateVerticalLayout(tree);

  // Swap x and y for horizontal orientation
  const nodes = vertical.nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.y,
      y: node.position.x,
    },
  }));

  const bounds = {
    width: vertical.bounds.height,
    height: vertical.bounds.width,
  };

  return { nodes, edges: vertical.edges, bounds };
}

/**
 * Calculate layout based on orientation
 */
export function calculateLayout(
  tree: FamilyTree,
  orientation: 'vertical' | 'horizontal' = 'vertical'
): LayoutResult {
  if (orientation === 'horizontal') {
    return calculateHorizontalLayout(tree);
  }
  return calculateVerticalLayout(tree);
}

export default calculateLayout;
