import { FamilyTreeViewer } from '@/components/FamilyTree/FamilyTreeViewer';
import { mockFamilyTree } from '@/data/mockFamilyData';

interface TreeViewPageProps {
  params: {
    treeId: string;
  };
}

/**
 * Page for viewing a specific family tree
 * Fetches tree data from API and renders FamilyTreeViewer
 */
export function TreeViewPage({ params }: TreeViewPageProps) {
  const { treeId } = params;

  // TODO: Fetch tree data from API using treeId
  // For now, using mock data
  console.log('Viewing tree:', treeId);

  // Later this will be replaced with:
  // const { data: tree, isLoading, error } = useFetchTree(treeId);
  // if (isLoading) return <LoadingSpinner />;
  // if (error) return <ErrorMessage />;

  return (
    <div className="w-full h-screen">
      <FamilyTreeViewer familyTree={mockFamilyTree} />
    </div>
  );
}

export default TreeViewPage;
