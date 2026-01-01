import { Route, Switch } from 'wouter';
import { LandingPage } from '@/pages/LandingPage';
import { TreesListPage } from '@/pages/TreesListPage';
import { TreeViewPage } from '@/pages/TreeViewPage';

export function App() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/trees" component={TreesListPage} />
      <Route path="/trees/:treeId">{(params) => <TreeViewPage params={params} />}</Route>
      <Route>
        {/* 404 - Not Found */}
        <div className="w-full h-screen flex items-center justify-center bg-bg-primary">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
            <p className="text-text-secondary">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
