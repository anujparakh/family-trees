import { FamilyTree, LayoutResult, LayoutNode, LayoutEdge } from '../data/types';

/**
 * Layout engine for family trees
 * Calculates node positions for vertical and horizontal orientations
 */

const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 100;

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
  const { generations } = buildGenerations(tree);

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  // Calculate positions for each generation
  const genArray = Array.from(generations.keys()).sort((a, b) => a - b);
  const minGen = genArray[0];
  const maxGen = genArray[genArray.length - 1];

  let maxWidth = 0;

  genArray.forEach((gen) => {
    const people = generations.get(gen)!;
    const genWidth = people.length * NODE_WIDTH + (people.length - 1) * HORIZONTAL_SPACING;
    maxWidth = Math.max(maxWidth, genWidth);

    const startX = 0; // We'll center later
    const y = (gen - minGen) * (NODE_HEIGHT + VERTICAL_SPACING);

    people.forEach((personId, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING);
      nodes.push({
        id: personId,
        person: tree.persons[personId],
        x,
        y,
        generation: gen,
      });
    });
  });

  // Center each generation
  nodes.forEach((node) => {
    const genPeople = generations.get(node.generation)!;
    const genWidth = genPeople.length * NODE_WIDTH + (genPeople.length - 1) * HORIZONTAL_SPACING;
    const offset = (maxWidth - genWidth) / 2;
    node.x += offset;
  });

  // Create edges between parents and children
  tree.families.forEach((family) => {
    const parentNodes = family.parents
      .map((pid) => nodes.find((n) => n.id === pid))
      .filter((n): n is LayoutNode => n !== undefined);
    const childNodes = family.children
      .map((cid) => nodes.find((n) => n.id === cid))
      .filter((n): n is LayoutNode => n !== undefined);

    // Draw lines from parents to children
    if (parentNodes.length > 0 && childNodes.length > 0) {
      // Calculate midpoint between parents
      const parentMidX =
        parentNodes.reduce((sum, n) => sum + n.x, 0) / parentNodes.length + NODE_WIDTH / 2;
      const parentY = parentNodes[0].y + NODE_HEIGHT;

      // Calculate midpoint of children
      const childMidX =
        childNodes.reduce((sum, n) => sum + n.x, 0) / childNodes.length + NODE_WIDTH / 2;
      const childY = childNodes[0].y;

      const midY = (parentY + childY) / 2;

      // Vertical line from parents
      edges.push({
        id: `family-${family.id}-down`,
        type: 'parent-child',
        x1: parentMidX,
        y1: parentY,
        x2: parentMidX,
        y2: midY,
      });

      // Horizontal line
      if (parentMidX !== childMidX) {
        edges.push({
          id: `family-${family.id}-horizontal`,
          type: 'parent-child',
          x1: Math.min(parentMidX, childMidX),
          y1: midY,
          x2: Math.max(parentMidX, childMidX),
          y2: midY,
        });
      }

      // Lines down to each child
      childNodes.forEach((child, idx) => {
        const childX = child.x + NODE_WIDTH / 2;
        edges.push({
          id: `family-${family.id}-child-${idx}`,
          type: 'parent-child',
          x1: childX,
          y1: midY,
          x2: childX,
          y2: childY,
        });
      });

      // Line between spouses/parents
      if (parentNodes.length === 2) {
        edges.push({
          id: `family-${family.id}-spouse`,
          type: 'spouse',
          x1: parentNodes[0].x + NODE_WIDTH,
          y1: parentNodes[0].y + NODE_HEIGHT / 2,
          x2: parentNodes[1].x,
          y2: parentNodes[1].y + NODE_HEIGHT / 2,
        });
      }
    }
  });

  // Add padding offset to all nodes so they're not at the edge
  const PADDING = 50;
  nodes.forEach((node) => {
    node.x += PADDING;
    node.y += PADDING;
  });

  // Update edge positions with padding offset
  edges.forEach((edge) => {
    edge.x1 += PADDING;
    edge.y1 += PADDING;
    edge.x2 += PADDING;
    edge.y2 += PADDING;
  });

  const bounds = {
    width: maxWidth + PADDING * 2, // Add padding on both sides
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

  // Swap x and y, and swap width and height
  const nodes = vertical.nodes.map((node) => ({
    ...node,
    x: node.y,
    y: node.x,
  }));

  const edges = vertical.edges.map((edge) => ({
    ...edge,
    x1: edge.y1,
    y1: edge.x1,
    x2: edge.y2,
    y2: edge.x2,
  }));

  const bounds = {
    width: vertical.bounds.height,
    height: vertical.bounds.width,
  };

  return { nodes, edges, bounds };
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
