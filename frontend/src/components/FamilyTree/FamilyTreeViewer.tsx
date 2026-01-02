import { useEffect, useCallback } from 'preact/hooks';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  EdgeTypes,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PersonNode } from '@/components/FamilyTree/PersonNode';
import { SpouseEdge } from '@/components/FamilyTree/SpouseEdge';
import { ParentChildEdge } from '@/components/FamilyTree/ParentChildEdge';
import { calculateLayout } from '@/utils/layoutEngine';
import { FamilyTree, PersonNodeData, Person } from '@/data/types';

interface FamilyTreeViewerProps {
  familyTree: FamilyTree;
  orientation?: 'vertical' | 'horizontal';
  onPersonClick?: (person: Person) => void;
}

// Register custom node types
const nodeTypes: NodeTypes = {
  person: PersonNode,
};

// Register custom edge types
const edgeTypes: EdgeTypes = {
  spouse: SpouseEdge,
  parentChild: ParentChildEdge,
};

/**
 * FamilyTreeViewer - Renders the interactive family tree visualization
 */
export function FamilyTreeViewer({
  familyTree,
  orientation = 'vertical',
  onPersonClick,
}: FamilyTreeViewerProps) {
  // ReactFlow node and edge state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Calculate layout when tree or orientation changes
  useEffect(() => {
    const layout = calculateLayout(familyTree, orientation);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [familyTree, orientation, setNodes, setEdges]);

  // Handle node click
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const person = familyTree.persons[node.id];
      if (person && onPersonClick) {
        onPersonClick(person);
      }
    },
    [familyTree, onPersonClick]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesUpdatable={false}
        edgesFocusable={false}
        elementsSelectable={true}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
      >
        <Background className="bg-bg-primary [&>*]:!stroke-border-primary" gap={16} />
        <Controls
          showInteractive={false}
          position="top-right"
          orientation="horizontal"
          className="[&>button]:!bg-bg-secondary [&>button]:!fill-text-primary !shadow-none [&>button]:!opacity-80 hover:[&>button]:!bg-bg-hover [&>button]:!w-6 [&>button]:!h-6 [&>button]:!p-2 [&>button]:!rounded-lg [&>button]:!my-2 [&>button]:!border-solid [&>button]:!border [&>button]:!border-border-secondary"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as PersonNodeData;
            return data.person.gender === 'male'
              ? 'rgb(59 130 246)'
              : data.person.gender === 'female'
                ? 'rgb(236 72 153)'
                : 'rgb(107 114 128)';
          }}
          className="!bg-bg-secondary !border-border-primary hidden md:block"
          nodeStrokeWidth={2}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
}

export default FamilyTreeViewer;
