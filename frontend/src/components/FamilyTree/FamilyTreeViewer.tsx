import { useState, useEffect, useCallback } from 'preact/hooks';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GearIcon, XIcon } from '@phosphor-icons/react';
import { PersonNode } from './PersonNode';
import { calculateLayout } from '../../utils/layoutEngine';
import { FamilyTree, PersonNodeData } from '../../data/types';
import { Button } from '../ui';
import { TreeIcon } from '../ui/icons';
import { SettingsDialog } from '../Settings/SettingsDialog';

interface FamilyTreeViewerProps {
  familyTree: FamilyTree;
  editMode?: boolean;
}

// Register custom node types
const nodeTypes: NodeTypes = {
  person: PersonNode,
};

/**
 * FamilyTreeViewer - Main component for rendering and interacting with family tree
 */
export function FamilyTreeViewer({
  familyTree,
  editMode: _editMode = false,
}: FamilyTreeViewerProps) {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      setSelectedPersonId(node.id);
      console.log('Selected person:', familyTree.persons[node.id]);
    },
    [familyTree]
  );

  const handleOrientationChange = (newOrientation: 'vertical' | 'horizontal') => {
    setOrientation(newOrientation);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TreeIcon size={28} className="text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-800">Family Tree</h1>
        </div>
        <Button variant="ghost" onClick={() => setIsSettingsOpen(true)} ariaLabel="Settings">
          <GearIcon size={20} weight="regular" />
        </Button>
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
          fitView
          minZoom={0.2}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnScroll={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
        >
          <Background color="#E5E7EB" gap={16} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as PersonNodeData;
              return data.person.gender === 'male'
                ? '#3B82F6'
                : data.person.gender === 'female'
                  ? '#EC4899'
                  : '#6B7280';
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {/* Selected person details (bottom sheet) */}
      {selectedPersonId && (
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {familyTree.persons[selectedPersonId].firstName}{' '}
                  {familyTree.persons[selectedPersonId].lastName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Born: {familyTree.persons[selectedPersonId].birthDate || 'Unknown'}
                </p>
                {familyTree.persons[selectedPersonId].deathDate && (
                  <p className="text-sm text-gray-600">
                    Died: {familyTree.persons[selectedPersonId].deathDate}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPersonId(null)}
                ariaLabel="Close"
              >
                <XIcon size={20} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        orientation={orientation}
        onOrientationChange={handleOrientationChange}
      />
    </div>
  );
}

export default FamilyTreeViewer;
