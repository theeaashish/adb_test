export function TodoList({ todos, loading, loadError }) {
  if (loading) {
    return <p>Loading TODOs...</p>;
  }

  if (loadError) {
    return <p>{loadError.message}</p>;
  }

  if (todos.length === 0) {
    return <p>No TODOs yet.</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.description}</li>
      ))}
    </ul>
  );
}

export default TodoList;
