"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WhiteboardsListPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loginUrl = `${API_URL}/auth/google`;

  useEffect(() => {
    async function fetchUserAndWhiteboards() {
      try {
        const response = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          await fetchWhiteboards();
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndWhiteboards();
  }, []);

  async function fetchWhiteboards() {
    try {
      const response = await fetch(`${API_URL}/api/whiteboards`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setWhiteboards(data);
      }
    } catch (error) {
      console.error("Failed to load whiteboards:", error);
    }
  }

  async function createNewWhiteboard() {
    const title = prompt("Enter whiteboard title (optional):");
    if (title === null) return;

    try {
      const response = await fetch(`${API_URL}/api/whiteboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title || "Untitled Whiteboard" }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/whiteboard?id=${data._id}`);
      }
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
    }
  }

  async function deleteWhiteboard(id) {
    if (!confirm("Are you sure you want to delete this whiteboard?")) return;

    try {
      const response = await fetch(`${API_URL}/api/whiteboards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setWhiteboards(whiteboards.filter((wb) => wb._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete whiteboard:", error);
    }
  }

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    router.push("/");
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
        <h1>Whiteboards</h1>
        <p className="muted">Sign in with Google to access your whiteboards.</p>
        <a className="button" href={loginUrl}>
          Continue with Google
        </a>
      </main>
    );
  }

  return (
    <main>
      <h1>My Whiteboards</h1>
      <p className="muted">
        Signed in as {user.name} ({user.email})
      </p>

      <div className="row" style={{ marginBottom: 20, gap: 8 }}>
        <button className="button" onClick={createNewWhiteboard}>
          + New Whiteboard
        </button>
        <button className="secondary" onClick={() => router.push("/")}>
          Back Home
        </button>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </div>

      {whiteboards.length === 0 ? (
        <p className="muted">
          No whiteboards yet. Create one to get started!
        </p>
      ) : (
        <ul className="whiteboards-grid">
          {whiteboards.map((wb) => (
            <li key={wb._id} className="whiteboard-card">
              <div className="whiteboard-card-content">
                <h3>{wb.title}</h3>
                <p className="whiteboard-date">
                  {new Date(wb.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="whiteboard-card-actions">
                <button
                  className="button"
                  onClick={() => router.push(`/whiteboard?id=${wb._id}`)}
                >
                  Open
                </button>
                <button
                  className="secondary"
                  onClick={() => deleteWhiteboard(wb._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
