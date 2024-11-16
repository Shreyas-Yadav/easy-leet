import React from "react";
import MathSolver from "./Components/MathSolver";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Easy Leet</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 h-full">
            <MathSolver />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
