import { FamilyTreeViewer } from '@/components/FamilyTree/FamilyTreeViewer';
import { mockFamilyTree } from '@/data/mockFamilyData';

export function App() {
  return (
    <div className="w-full h-screen">
      <FamilyTreeViewer familyTree={mockFamilyTree} />
    </div>
  );
}

export default App;
