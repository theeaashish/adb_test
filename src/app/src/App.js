import "./App.css";

import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";

export function App() {
  const { todos, loading, loadError, isSaving, saveError, createTodo } =
    useTodos();

  return (
    <div className="App">
      <div>
        <h1>List of TODOs</h1>

        <TodoList todos={todos} loading={loading} loadError={loadError} />
      </div>

      <div>
        <h1>Create a TODO</h1>

        <TodoForm
          createTodo={createTodo}
          isSaving={isSaving}
          saveError={saveError}
        />
      </div>
    </div>
  );
}

export default App;
