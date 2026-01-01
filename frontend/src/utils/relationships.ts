import { FamilyTree, Person } from '@/data/types';

export interface PersonRelationships {
  spouses: Person[];
  parents: Person[];
  children: Person[];
  siblings: Person[];
  cousins: Person[];
}

/**
 * Calculate all relationships for a person in the family tree
 */
export function getPersonRelationships(personId: string, tree: FamilyTree): PersonRelationships {
  const spouses: Person[] = [];
  const parents: Person[] = [];
  const children: Person[] = [];
  const siblings: Person[] = [];
  const cousins: Person[] = [];

  // Find families where this person is a parent (to get spouse and children)
  const familiesAsParent = tree.families.filter((family) => family.parents.includes(personId));

  // Find families where this person is a child (to get parents and siblings)
  const familiesAsChild = tree.families.filter((family) => family.children.includes(personId));

  // Extract spouses and children
  familiesAsParent.forEach((family) => {
    // Get spouse(s) - other parents in the family
    family.parents.forEach((parentId) => {
      if (parentId !== personId && tree.persons[parentId]) {
        spouses.push(tree.persons[parentId]);
      }
    });

    // Get children
    family.children.forEach((childId) => {
      if (tree.persons[childId]) {
        children.push(tree.persons[childId]);
      }
    });
  });

  // Extract parents and siblings
  familiesAsChild.forEach((family) => {
    // Get parents
    family.parents.forEach((parentId) => {
      if (tree.persons[parentId]) {
        parents.push(tree.persons[parentId]);
      }
    });

    // Get siblings - other children in the same family
    family.children.forEach((childId) => {
      if (childId !== personId && tree.persons[childId]) {
        siblings.push(tree.persons[childId]);
      }
    });
  });

  // Calculate cousins
  // 1. Get parents' IDs
  const parentIds = parents.map((p) => p.id);

  // 2. Find families where parents are children (to get grandparents)
  const grandparentFamilies = tree.families.filter((family) =>
    family.children.some((childId) => parentIds.includes(childId))
  );

  // 3. Get all children of grandparents (aunts and uncles)
  const auntUncleIds = new Set<string>();
  grandparentFamilies.forEach((family) => {
    family.children.forEach((childId) => {
      // Exclude own parents
      if (!parentIds.includes(childId)) {
        auntUncleIds.add(childId);
      }
    });
  });

  // 4. Find families where aunts/uncles are parents and get their children (cousins)
  tree.families.forEach((family) => {
    const hasAuntOrUncle = family.parents.some((parentId) => auntUncleIds.has(parentId));
    if (hasAuntOrUncle) {
      family.children.forEach((childId) => {
        if (tree.persons[childId]) {
          cousins.push(tree.persons[childId]);
        }
      });
    }
  });

  // Remove duplicates
  const uniqueSpouses = Array.from(new Map(spouses.map((p) => [p.id, p])).values());
  const uniqueParents = Array.from(new Map(parents.map((p) => [p.id, p])).values());
  const uniqueChildren = Array.from(new Map(children.map((p) => [p.id, p])).values());
  const uniqueSiblings = Array.from(new Map(siblings.map((p) => [p.id, p])).values());
  const uniqueCousins = Array.from(new Map(cousins.map((p) => [p.id, p])).values());

  return {
    spouses: uniqueSpouses,
    parents: uniqueParents,
    children: uniqueChildren,
    siblings: uniqueSiblings,
    cousins: uniqueCousins,
  };
}

/**
 * Format a person's full name
 */
export function getPersonFullName(person: Person): string {
  return `${person.firstName} ${person.lastName}`;
}

/**
 * Format a person's birth/death dates
 */
export function getPersonDates(person: Person): string {
  const birth = person.birthDate || '?';
  const death = person.deathDate ? ` - ${person.deathDate}` : '';
  return `${birth}${death}`;
}
