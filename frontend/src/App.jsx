import TaskManager from './components/TaskManager';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Fullstack CRUD App
      </h1>
      <div className="w-full">
        <TaskManager />
      </div>
    </div>
  );
}

export default App;