import { useState } from "react";

export function TodoForm({ createTodo, isSaving, saveError }) {
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedDescription = description.trim();

    setValidationError(null);

    if (!normalizedDescription) {
      setValidationError("TODO description cannot be empty.");
      return;
    }

    try {
      await createTodo(normalizedDescription);
      setDescription("");
    } catch {
      // do nothing - saveError will be displayed by the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="todo-description">TODO: </label>

        <input
          id="todo-description"
          name="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSaving}
        />
      </div>

      <div style={{ marginTop: "5px" }}>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add TODO"}
        </button>
      </div>

      {validationError && <p>{validationError}</p>}

      {!validationError && saveError && <p>{saveError.message}</p>}
    </form>
  );
}

export default TodoForm;
