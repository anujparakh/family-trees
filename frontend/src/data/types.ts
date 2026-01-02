import { Node, Edge } from 'reactflow';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
  notes?: string;
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
  id?: string;
  name: string;
  description?: string;
  persons: Record<string, Person>;
  families: Family[];
  rootPersonId: string;
  userRole?: 'owner' | 'editor' | 'viewer' | null;
}

// ReactFlow-compatible types
export interface PersonNodeData {
  person: Person;
  generation: number;
}

export type PersonNode = Node<PersonNodeData>;

export interface FamilyEdgeData {
  type: 'parent-child' | 'spouse';
  junctionY?: number; // Y position for shared horizontal junction line
  midpointX?: number; // X position for midpoint between parents
  spouseEdgeY?: number; // Y position where spouse edge is (vertical center of parents)
}

export type FamilyEdge = Edge<FamilyEdgeData>;

export interface LayoutResult {
  nodes: PersonNode[];
  edges: FamilyEdge[];
}
