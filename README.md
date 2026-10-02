# TODO Application

A containerized TODO application.

The application consists of a React frontend, a Django REST API, and MongoDB. The frontend communicates with the backend through HTTP APIs, while the backend persists TODO items in MongoDB.

## Architecture

```text
┌──────────────────────┐
│      React App       │
│       :3000          │
│                      │
│  TodoForm            │
│  TodoList            │
│  useTodos            │
│  todoApi             │
└──────────┬───────────┘
           │ HTTP
           │ GET /todos/
           │ POST /todos/
           ▼
┌──────────────────────┐
│    Django REST API   │
│       :8000          │
│                      │
│  TodoListView        │
│       │              │
│       ├── Validation │
│       │              │
│       └── Repository │
└──────────┬───────────┘
           │ PyMongo
           ▼
┌──────────────────────┐
│       MongoDB        │
│       :27017         │
│                      │
│    test_db.todos     │
└──────────────────────┘
```

### Backend responsibilities

The backend is intentionally split into small responsibilities:

- `views.py` handles HTTP concerns and translates application outcomes into HTTP responses.
- `todo_validation.py` validates and normalizes incoming TODO payloads.
- `todo_repository.py` encapsulates MongoDB persistence.
- MongoDB stores the actual TODO documents.

There is deliberately no Django model, serializer, ORM, or additional persistence abstraction because the assignment explicitly requires MongoDB access through the provided database connection.

### Frontend responsibilities

The frontend follows a small separation-of-concerns structure:

- `todoApi.js` owns HTTP communication.
- `useTodos.js` owns server state and asynchronous orchestration.
- `TodoForm.js` owns local form state and submission UI.
- `TodoList.js` is responsible for rendering TODO state.
- `App.js` composes the application.

After successfully creating a TODO, the frontend performs a fresh `GET /todos/` request instead of manually appending the created item to local state. This keeps the displayed list synchronized with the backend source of truth.

---

# Features

The implementation covers the assignment requirements:

- Create TODO items through the backend API.
- Retrieve TODO items from MongoDB.
- Persist TODOs in MongoDB.
- Replace the frontend hardcoded TODO list with backend data.
- Refresh the TODO list after creating a TODO.
- Validate incoming request data.
- Return appropriate HTTP status codes.
- Handle backend/database failures gracefully.
- Use React Hooks instead of class components.
- Run the complete application through Docker Compose.

---

# Technology Stack

### Frontend

- React
- React Hooks
- JavaScript
- Native `fetch` API

### Backend

- Python
- Django
- Django REST Framework
- PyMongo

### Database

- MongoDB

### Infrastructure

- Docker
- Docker Compose

No additional application dependencies were introduced for validation, API communication, or database abstraction.

---

# Project Structure

```text
.
├── Dockerfile
├── docker-compose.yml
│
├── src/
│   │
│   ├── app/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── TodoForm.js
│   │       │   └── TodoList.js
│   │       │
│   │       ├── hooks/
│   │       │   └── useTodos.js
│   │       │
│   │       ├── services/
│   │       │   └── todoApi.js
│   │       │
│   │       └── App.js
│   │
│   └── rest/
│       └── rest/
│           ├── views.py
│           ├── todo_repository.py
│           └── todo_validation.py
│
└── db/
```

---

# Running the Application

## Prerequisites

Make sure Docker and Docker Compose are installed and Docker is running.

The application is designed to be run using the provided Docker setup.

## 1. Clone the repository

```bash
git clone git@github.com:theeaashish/adb_test.git
cd adb_test
```

## 2. Configure the codebase path

The provided Docker Compose configuration expects `ADBREW_CODEBASE_PATH` to point to the project source directory.

From the project root:

```bash
export ADBREW_CODEBASE_PATH="$(pwd)/src"
```

## 3. Build and start the application

```bash
docker compose up -d --build
```

This starts three containers:

| Service |    Port | Responsibility           |
| ------- | ------: | ------------------------ |
| `app`   |  `3000` | React development server |
| `api`   |  `8000` | Django REST API          |
| `mongo` | `27017` | MongoDB                  |

Open the application at:

```text
http://localhost:3000
```

The backend is available at:

```text
http://localhost:8000
```

## Stop the application

```bash
docker compose down
```

To rebuild the containers after code or dependency changes:

```bash
docker compose up -d --build
```

---

# API

## `GET /todos/`

Returns all TODO items stored in MongoDB.

### Response

```json
[
  {
    "id": "68c...",
    "description": "Learn MongoDB"
  },
  {
    "id": "68d...",
    "description": "Build backend API"
  }
]
```

### Success

```text
200 OK
```

### Database failure

```text
500 Internal Server Error
```

```json
{
  "error": "failed to fetch todo items"
}
```

---

## `POST /todos/`

Creates a new TODO item.

### Request

```json
{
  "description": "Learn Django"
}
```

### Success response

```text
201 Created
```

```json
{
  "id": "68e...",
  "description": "Learn Django"
}
```

The MongoDB-generated `_id` is converted into a string `id` before being returned through the API.

---

# Request Validation

The backend validates TODO creation requests before attempting database access.

The following rules are enforced:

1. The request body must be a JSON object.
2. `description` is required.
3. `description` must be a string.
4. Leading and trailing whitespace is removed.
5. The resulting description must not be empty.
6. The description must not exceed 500 characters.

### Example

Input:

```json
{
  "description": "   Learn MongoDB   "
}
```

is normalized to:

```json
{
  "description": "Learn MongoDB"
}
```

Invalid requests return:

```text
400 Bad Request
```

Example:

```json
{
  "description": ""
}
```

Response:

```json
{
  "error": "description cannot be empty"
}
```

---

# Error Handling

The backend separates client errors from infrastructure failures.

### Client validation errors

Invalid input results in:

```text
400 Bad Request
```

with a descriptive error message.

### Database errors

MongoDB failures are caught at the HTTP boundary and converted into:

```text
500 Internal Server Error
```

The API returns a generic message to the client while the server logs the underlying exception.

For example:

```json
{
  "error": "failed to create todo item"
}
```

This prevents internal database details from being exposed through the API.

---

# Backend Design

## Validation Layer

File:

```text
src/rest/rest/todo_validation.py
```

The validation logic is kept outside the view so that request validation does not become mixed with HTTP and persistence logic.

The validator returns normalized application data:

```python
{
    "description": "Learn MongoDB"
}
```

A dedicated `TodoValidationError` is used to distinguish validation failures from unexpected application/database errors.

---

## Repository Layer

File:

```text
src/rest/rest/todo_repository.py
```

`TodoRepository` isolates MongoDB operations from the Django view.

Its responsibilities are intentionally small:

```text
create(description)
find_all()
```

The repository receives the already-created database object rather than creating its own MongoDB connection.

This keeps connection ownership with the existing application setup and makes the persistence boundary explicit.

---

## API Layer

File:

```text
src/rest/rest/views.py
```

`TodoListView` is responsible for:

```text
HTTP request
     │
     ├── validate request
     │
     ├── call repository
     │
     └── return HTTP response
```

The view does not contain MongoDB query implementation details.

This separation keeps the API layer focused on HTTP concerns and makes the persistence implementation replaceable without changing the API contract.

---

# Frontend Design

## API Service

File:

```text
src/app/src/services/todoApi.js
```

All HTTP communication is centralized here.

The service currently exposes:

```javascript
getTodos();
createTodo(description);
```

A shared internal request helper handles:

- performing the `fetch`
- parsing JSON responses
- detecting non-2xx responses
- extracting API error messages
- generating a fallback error when the server does not provide one

No third-party HTTP client is required for this application.

---

## Server State Hook

File:

```text
src/app/src/hooks/useTodos.js
```

`useTodos` owns TODO-related server state:

```text
todos
loading
loadError
isSaving
saveError
```

Initial data loading occurs through `useEffect`.

The asynchronous operations are wrapped in `useCallback` so that their references remain stable when used by React effects and child components.

### Create flow

```text
User submits form
       │
       ▼
createTodo()
       │
       ▼
POST /todos/
       │
       ├── failure → saveError
       │
       ▼
GET /todos/
       │
       ▼
update todos state
```

The second GET is intentional: MongoDB remains the source of truth rather than duplicating persistence logic in the frontend.

---

## TODO Form

File:

```text
src/app/src/components/TodoForm.js
```

The form owns local UI state for the input field and performs lightweight client-side validation before making the request.

The submit button is disabled while a create request is in progress.

After a successful creation, the input is cleared.

Server-side validation remains authoritative, so client-side validation is treated as a user-experience improvement rather than a replacement for backend validation.

---

## TODO List

File:

```text
src/app/src/components/TodoList.js
```

The component is intentionally presentation-focused.

It renders four states:

```text
Loading
   ↓
Error
   ↓
Empty list
   ↓
TODO list
```

It receives state through props instead of owning the server data-fetching logic itself.

---

# Data Model

TODOs are stored in MongoDB as documents similar to:

```json
{
  "_id": "ObjectId(...)",
  "description": "Learn Django"
}
```

The API intentionally exposes a frontend-friendly representation:

```json
{
  "id": "ObjectId-as-string",
  "description": "Learn Django"
}
```

The MongoDB-specific `_id` field therefore does not leak into the frontend API contract.

The collection used by the application is:

```text
test_db.todos
```

---

# Design Decisions

## Why MongoDB directly instead of Django models?

The assignment explicitly requires MongoDB persistence and instructs that Django models and SQLite should not be used.

Using PyMongo also keeps the implementation close to the database layer without introducing an additional ODM dependency.

## Why a repository?

Without a repository, the Django view would contain both HTTP logic and MongoDB implementation details.

The repository creates a clear boundary:

```text
View → Repository → MongoDB
```

This improves readability and keeps persistence concerns localized.

## Why no service layer?

The current business logic is small:

```text
validate → persist → respond
```

Adding a separate service layer would introduce another abstraction without providing enough value for the current scope.

The repository + validation boundaries provide sufficient separation.

## Why no React state-management library?

The application has a single small piece of server state: TODOs.

A custom hook provides the required state management without introducing Redux, React Query, Context, or another library that would add complexity without solving a real problem in this application.

## Why refresh the list after POST?

The assignment requires the list to reflect newly created TODOs.

Refreshing through `GET /todos/` keeps the backend as the source of truth and avoids duplicating synchronization logic in the frontend.

---

# Error and Loading State Strategy

The frontend distinguishes between different asynchronous states instead of using one global boolean.

```text
Loading TODOs
    → loading

Loading failed
    → loadError

Creating TODO
    → isSaving

Creating failed
    → saveError
```

This allows the UI to communicate the correct state to the user and prevents unrelated operations from sharing the same loading flag.

---

# Verification

The implementation has been manually verified against the important application flows.

Verified cases include:

- Loading existing TODOs from MongoDB.
- Creating a TODO through the frontend.
- Refreshing the list after creation.
- Empty TODO list state.
- Empty description validation.
- Whitespace-only description validation.
- Non-string descriptions.
- Missing `description`.
- Descriptions exceeding the configured limit.
- Whitespace normalization.
- Malformed JSON requests.
- Backend/database error handling.
- Disabled submit state while saving.

The application was also verified running through the provided Docker Compose setup with the React, Django, and MongoDB containers.

---

# Scope

The assignment only requires creating and reading TODOs.

Therefore the API intentionally does not implement:

- authentication
- authorization
- TODO updates
- TODO deletion
- pagination
- search
- sorting
- user-specific TODO ownership

These would be separate requirements rather than implicit responsibilities of this implementation.

---

# Engineering Notes

A few principles guided the implementation:

- Keep the HTTP layer separate from persistence.
- Validate input before accessing the database.
- Do not expose internal database errors to API consumers.
- Keep dependencies minimal.
- Keep frontend state ownership explicit.
- Prefer the backend as the source of truth.
- Avoid abstractions that do not provide value at the current scale.
- Keep the implementation small enough to be explained completely during the live walkthrough.

The goal was not to build a large framework around a small TODO application, but to demonstrate clean boundaries, predictable error handling, and maintainable code while respecting the constraints of the assignment.

---

# Live Walkthrough

The application can be explained through the following request flow.

### Creating a TODO

```text
React TodoForm
      │
      │ POST /todos/
      ▼
Django TodoListView
      │
      │ validate_create_todo_payload()
      ▼
TodoRepository
      │
      │ insert_one()
      ▼
MongoDB
      │
      │ created document
      ▼
Django API
      │
      │ 201 Created
      ▼
React
      │
      │ GET /todos/
      ▼
Updated TODO list
```

### Reading TODOs

```text
React
  │
  │ GET /todos/
  ▼
TodoListView
  │
  ▼
TodoRepository.find_all()
  │
  ▼
MongoDB
  │
  ▼
Repository maps Mongo _id → API id
  │
  ▼
JSON response
  │
  ▼
TodoList
```

This keeps each layer responsible for one clear concern and makes the complete request lifecycle straightforward to reason about during the assignment walkthrough.
