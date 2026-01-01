import { useState, useEffect, useCallback } from 'preact/hooks';
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
import { GearIcon, QuestionIcon } from '@phosphor-icons/react';
import { PersonNode } from '@/components/FamilyTree/PersonNode';
import { SpouseEdge } from '@/components/FamilyTree/SpouseEdge';
import { ParentChildEdge } from '@/components/FamilyTree/ParentChildEdge';
import { calculateLayout } from '@/utils/layoutEngine';
import { FamilyTree, PersonNodeData, Person } from '@/data/types';
import { Button } from '@/components/ui';
import { TreeIcon } from '@/components/ui/icons';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { HowToDialog } from '@/components/HowToDialog';
import { PersonDetailsDialog } from '@/components/PersonDetailsDialog';
import { hasSeenInstructions, markInstructionsAsSeen } from '@/utils/sessionStorage';
import { AuthButton } from '@/components/Auth/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FamilyTreeViewerProps {
  familyTree: FamilyTree;
  editMode?: boolean;
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
 * FamilyTreeViewer - Main component for rendering and interacting with family tree
 */
export function FamilyTreeViewer({
  familyTree,
  editMode: _editMode = false,
}: FamilyTreeViewerProps) {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);

  // ReactFlow node and edge state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Check if user has seen instructions on mount
  useEffect(() => {
    if (!hasSeenInstructions()) {
      setIsHowToOpen(true);
    }
  }, []);

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
      if (person) {
        setSelectedPerson(person);
      }
    },
    [familyTree]
  );

  const handleOrientationChange = (newOrientation: 'vertical' | 'horizontal') => {
    setOrientation(newOrientation);
  };

  const handleHowToClose = () => {
    setIsHowToOpen(false);
    markInstructionsAsSeen();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-bg-primary">
      {/* Header with controls */}
      <div className="bg-bg-secondary border-b border-border-primary p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TreeIcon size={28} className="text-accent-primary" />
          <h1 className="text-xl font-semibold text-text-primary">Family Tree</h1>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => setIsHowToOpen(true)} ariaLabel="Help">
            <QuestionIcon size={20} weight="regular" />
          </Button>
          <Button variant="ghost" onClick={() => setIsSettingsOpen(true)} ariaLabel="Settings">
            <GearIcon size={20} weight="regular" />
          </Button>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>

      {/* Tree visualization area */}
      <div className="flex-1 relative">
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
            className="[&>button]:!bg-bg-secondary [&>button]:!border-border-primary [&>button]:!fill-text-primary hover:[&>button]:!bg-bg-hover"
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
            className="!bg-bg-secondary !border-border-primary"
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {/* Person Details Dialog */}
      <PersonDetailsDialog
        isOpen={selectedPerson !== null}
        onClose={() => setSelectedPerson(null)}
        person={selectedPerson}
        familyTree={familyTree}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        orientation={orientation}
        onOrientationChange={handleOrientationChange}
      />

      {/* How To Dialog */}
      <HowToDialog isOpen={isHowToOpen} onClose={handleHowToClose} />
    </div>
  );
}

export default FamilyTreeViewer;
