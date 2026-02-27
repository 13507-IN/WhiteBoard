"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [error, setError] = useState("");

  const loginUrl = useMemo(() => `${API_URL}/auth/google`, []);

  async function fetchMe() {
    const response = await fetch(`${API_URL}/api/me`, {
      credentials: "include",
    });
    const data = await response.json();
    if (data.authenticated) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }

  async function fetchTodos() {
    const response = await fetch(`${API_URL}/api/todos`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Could not load todos");
    }
    const data = await response.json();
    setTodos(data);
  }

  useEffect(() => {
    async function load() {
      try {
        setError("");
        await fetchMe();
      } catch (_error) {
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchTodos().catch(() => setError("Failed to load todos"));
  }, [user]);

  async function addTodo(event) {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;

    const response = await fetch(`${API_URL}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      setError("Failed to create todo");
      return;
    }

    setNewTodo("");
    fetchTodos().catch(() => setError("Failed to refresh todos"));
  }

  async function toggleTodo(todo) {
    const response = await fetch(`${API_URL}/api/todos/${todo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (!response.ok) {
      setError("Failed to update todo");
      return;
    }

    fetchTodos().catch(() => setError("Failed to refresh todos"));
  }

  async function deleteTodo(id) {
    const response = await fetch(`${API_URL}/api/todos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      setError("Failed to delete todo");
      return;
    }

    fetchTodos().catch(() => setError("Failed to refresh todos"));
  }

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setTodos([]);
    setUser(null);
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>Todo List</h1>
        <p className="muted">Sign in with Google to manage your tasks.</p>
        <a className="button" href={loginUrl}>
          Continue with Google
        </a>
        {error ? <p>{error}</p> : null}
      </main>
    );
  }

  return (
    <main>
      <h1>Todo List</h1>
      <p className="muted">
        Signed in as {user.name} ({user.email})
      </p>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <form onSubmit={addTodo} className="row">
        <input
          type="text"
          placeholder="Add a task..."
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error ? <p>{error}</p> : null}

      <ul>
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? "completed" : ""}>
            <div className="left">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
              />
              <span>{todo.text}</span>
            </div>
            <button className="secondary" onClick={() => deleteTodo(todo._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
