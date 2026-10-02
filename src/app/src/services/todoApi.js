const API_BASE_URL = "http://localhost:8000";

const TODOS_URL = `${API_BASE_URL}/todos/`;

export async function request(url, options = {}) {
  const response = await fetch(url, options);

  let data = null;

  try {
    data = await response.json();
  } catch {
    // ignore error
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.detail ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function getTodos() {
  return request(TODOS_URL);
}

export async function createTodo(description) {
  return request(TODOS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });
}
