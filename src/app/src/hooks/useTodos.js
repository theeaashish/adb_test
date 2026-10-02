import { useCallback, useEffect, useState } from "react";

import { getTodos, createTodo as createTodoRequest } from "../services/todoApi";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const createTodo = useCallback(
    async (description) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const createdTodo = await createTodoRequest(description);

        await loadTodos();

        return createdTodo;
      } catch (error) {
        setSaveError(error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [loadTodos],
  );

  return {
    todos,
    loading,
    loadError,
    isSaving,
    saveError,
    loadTodos,
    createTodo,
  };
}
