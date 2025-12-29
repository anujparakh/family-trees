export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
}

export interface Family {
  id: string;
  parents: string[];
  children: string[];
  marriageDate?: string;
  divorceDate?: string;
  status?: 'married' | 'divorced' | 'separated' | 'partner';
}

export interface FamilyTree {
  persons: Record<string, Person>;
  families: Family[];
  rootPersonId: string;
}

export interface LayoutNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  generation: number;
}

export interface LayoutEdge {
  id: string;
  type: 'parent-child' | 'spouse';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bounds: {
    width: number;
    height: number;
  };
}
