import { Node, Edge } from 'reactflow';

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

// ReactFlow-compatible types
export interface PersonNodeData {
  person: Person;
  generation: number;
}

export type PersonNode = Node<PersonNodeData>;

export interface FamilyEdgeData {
  type: 'parent-child' | 'spouse';
}

export type FamilyEdge = Edge<FamilyEdgeData>;

export interface LayoutResult {
  nodes: PersonNode[];
  edges: FamilyEdge[];
  bounds: {
    width: number;
    height: number;
  };
}
