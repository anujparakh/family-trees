import { useState, useEffect } from 'preact/hooks';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { PersonNode } from './PersonNode';
import { TreeControls } from './TreeControls';
import { calculateLayout } from '../../utils/layoutEngine';
import { FamilyTree, LayoutResult } from '../../data/types';
import { Button } from '../ui';

interface FamilyTreeViewerProps {
  familyTree: FamilyTree;
  editMode?: boolean;
}

/**
 * FamilyTreeViewer - Main component for rendering and interacting with family tree
 */
export function FamilyTreeViewer({
  familyTree,
  editMode: _editMode = false,
}: FamilyTreeViewerProps) {
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutResult | null>(null);

  // Calculate layout when tree or orientation changes
  useEffect(() => {
    const newLayout = calculateLayout(familyTree, orientation);
    setLayout(newLayout);
  }, [familyTree, orientation]);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Calculating layout...</div>
      </div>
    );
  }

  const { nodes, edges, bounds } = layout;

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId(personId);
    console.log('Selected person:', familyTree.persons[personId]);
  };

  const handleToggleOrientation = () => {
    setOrientation((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Family Trees</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleToggleOrientation}>
            {orientation === 'vertical' ? 'Horizontal' : 'Vertical'}
          </Button>
        </div>
      </div>

      {/* Tree visualization area */}
      <div className="flex-1 relative overflow-hidden">
        <TransformWrapper
          initialScale={0.8}
          minScale={0.25}
          maxScale={3}
          centerOnInit={true}
          limitToBounds={false}
          doubleClick={{ mode: 'zoomIn', step: 0.5 }}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          panning={{
            velocityDisabled: false,
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom controls */}
              <TreeControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetTransform} />

              {/* Transformable SVG */}
              <TransformComponent
                wrapperClass="w-full h-full"
                contentClass="w-full h-full flex items-center justify-center"
              >
                <svg
                  width={bounds.width}
                  height={bounds.height}
                  className="no-select"
                  style={{ touchAction: 'none' }}
                >
                  {/* Render edges first (so they appear behind nodes) */}
                  <g className="edges">
                    {edges.map((edge) => (
                      <line
                        key={edge.id}
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        stroke={edge.type === 'spouse' ? '#9CA3AF' : '#D1D5DB'}
                        strokeWidth={edge.type === 'spouse' ? 2 : 1.5}
                        strokeLinecap="round"
                      />
                    ))}
                  </g>

                  {/* Render person nodes */}
                  <g className="nodes">
                    {nodes.map((node) => (
                      <PersonNode
                        key={node.id}
                        person={node.person}
                        x={node.x}
                        y={node.y}
                        isSelected={node.id === selectedPersonId}
                        onClick={() => handlePersonClick(node.id)}
                      />
                    ))}
                  </g>
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
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
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyTreeViewer;
