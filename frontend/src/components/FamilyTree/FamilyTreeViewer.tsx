import { useEffect, useCallback, useState } from 'preact/hooks';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PersonNode } from '@/components/FamilyTree/PersonNode';
import { SpouseEdge } from '@/components/FamilyTree/SpouseEdge';
import { ParentChildEdge } from '@/components/FamilyTree/ParentChildEdge';
import { SearchDialog } from '@/components/FamilyTree/SearchDialog';
import { calculateLayout } from '@/utils/layoutEngine';
import { FamilyTree, PersonNodeData, Person } from '@/data/types';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

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
 * Inner component that uses ReactFlow hooks
 */
function FamilyTreeViewerInner({
  familyTree,
  orientation = 'vertical',
  onPersonClick,
}: FamilyTreeViewerProps) {
  // ReactFlow node and edge state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setCenter, getZoom } = useReactFlow();

  // Calculate layout when tree or orientation changes
  useEffect(() => {
    const runLayout = async () => {
      const layout = await calculateLayout(familyTree, orientation);
      setNodes(layout.nodes);
      setEdges(layout.edges);
    };
    runLayout();
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

  // Handle search result selection - pan to person
  const handleSearchSelect = useCallback(
    (personId: string) => {
      const node = nodes.find((n) => n.id === personId);
      if (node) {
        // Pan to the selected node with some zoom
        const x = node.position.x + 70; // Center of node (NODE_WIDTH / 2)
        const y = node.position.y + 50; // Center of node (NODE_HEIGHT / 2)
        const zoom = Math.max(getZoom(), 0.8); // Ensure at least 0.8 zoom
        setCenter(x, y, { zoom, duration: 800 });
      }
    },
    [nodes, setCenter, getZoom]
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
          showFitView={false}
          position="top-right"
          className="[&>button]:!bg-bg-secondary [&>button]:!fill-text-primary !shadow-none [&>button]:!opacity-80 hover:[&>button]:!bg-bg-hover [&>button]:!w-6 [&>button]:!h-6 [&>button]:!p-2 [&>button]:!rounded-lg [&>button]:!my-2 [&>button]:!border-solid [&>button]:!border [&>button]:!border-border-secondary"
        >
          <div className="">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="bg-bg-secondary text-text-primary opacity-80 hover:bg-bg-hover hover:opacity-100 w-10 h-10 p-2 flex items-center justify-center rounded-lg border border-border-secondary transition-opacity"
              title="Search family tree"
            >
              <MagnifyingGlassIcon size={16} weight="regular" />
            </button>
          </div>
        </Controls>
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

      {/* Search Dialog */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        familyTree={familyTree}
        onPersonSelect={handleSearchSelect}
      />
    </div>
  );
}

/**
 * FamilyTreeViewer - Wrapper component with ReactFlowProvider
 */
export function FamilyTreeViewer(props: FamilyTreeViewerProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeViewerInner {...props} />
    </ReactFlowProvider>
  );
}

export default FamilyTreeViewer;
