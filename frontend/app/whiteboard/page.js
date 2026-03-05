"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WhiteboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [whiteboardId, setWhiteboardId] = useState(
    searchParams.get("id") || null
  );
  const [title, setTitle] = useState("Untitled Whiteboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawingData, setDrawingData] = useState([]);
  const [textMode, setTextMode] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const currentStrokeRef = useRef(null);

  const CANVAS_WIDTH = 20000;
  const CANVAS_HEIGHT = 20000;
  const loginUrl = `${API_URL}/auth/google`;

  // Fetch user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`${API_URL}/api/me`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !user) return;

    const canvas = canvasRef.current;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = "white";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    contextRef.current = context;

    if (whiteboardId) {
      loadWhiteboard();
    }
  }, [user, whiteboardId]);

  // Redraw canvas when drawingData changes (but not during drawing)
  useEffect(() => {
    if (!isDrawing) {
      redrawCanvas(drawingData);
    }
  }, [drawingData, isDrawing]);

  // Load whiteboard from API
  async function loadWhiteboard() {
    try {
      const response = await fetch(
        `${API_URL}/api/whiteboards/${whiteboardId}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        const parsedData = typeof data.drawingData === "string" 
          ? JSON.parse(data.drawingData) 
          : data.drawingData;
        setDrawingData(parsedData || []);
        setTimeout(() => redrawCanvas(parsedData || []), 100);
      }
    } catch (error) {
      console.error("Failed to load whiteboard:", error);
    }
  }

  // Redraw canvas with existing data
  function redrawCanvas(data) {
    if (!contextRef.current || !canvasRef.current) return;
    
    const context = contextRef.current;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "white";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!Array.isArray(data)) return;

    data.forEach((item) => {
      try {
        if (item.type === "stroke") {
          const points = item.points || [];
          if (points.length < 2) return;
          
          context.strokeStyle = item.color || "#000000";
          context.lineWidth = item.size || 5;
          context.lineCap = "round";
          context.lineJoin = "round";
          
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          
          for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
          }
          context.stroke();
        } else if (item.type === "text") {
          context.fillStyle = item.color || "#000000";
          context.font = `${item.size || 20}px Arial`;
          context.fillText(item.text, item.x, item.y);
        }
      } catch (e) {
        console.error("Error drawing item:", e);
      }
    });
  }

  // Handle canvas wheel for zoom
  function handleWheel(e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    
    const newZoom = Math.max(0.1, Math.min(3, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  }

  // Handle mouse down for drawing or panning
  function handleMouseDown(e) {
    if (!contextRef.current || !user) return;

    const shouldPan = e.button === 1 || (e.button === 0 && e.ctrlKey);
    
    if (shouldPan) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    if (textMode) {
      handleTextInput(e);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = brushSize;
    contextRef.current.lineCap = "round";
    contextRef.current.lineJoin = "round";
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    
    setIsDrawing(true);
    
    // Store current stroke in ref to avoid state updates during drawing
    currentStrokeRef.current = {
      type: "stroke",
      color: color,
      size: brushSize,
      points: [{ x, y }],
    };
  }

  // Handle mouse move
  function handleMouseMove(e) {
    if (isPanning) {
      setPanX(e.clientX - panStart.x);
      setPanY(e.clientY - panStart.y);
      return;
    }

    if (!isDrawing || !contextRef.current || !currentStrokeRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    // Draw directly on canvas
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    
    // Track point in current stroke (without state update)
    if (currentStrokeRef.current.points) {
      currentStrokeRef.current.points.push({ x, y });
    }
  }

  // Handle mouse up
  function handleMouseUp(e) {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !contextRef.current) return;

    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Now add the completed stroke to state
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      setDrawingData(prev => [...prev, currentStrokeRef.current]);
    }
    
    currentStrokeRef.current = null;
  }

  // Handle text input
  function handleTextInput(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    const text = prompt("Enter text:");
    if (text) {
      contextRef.current.fillStyle = color;
      contextRef.current.font = `${brushSize * 4}px Arial`;
      contextRef.current.fillText(text, x, y);

      const newText = {
        type: "text",
        x: x,
        y: y,
        text: text,
        color: color,
        size: brushSize * 4,
      };

      setDrawingData([...drawingData, newText]);
    }
    setTextMode(false);
  }

  // Clear canvas
  function clearCanvas() {
    if (confirm("Are you sure you want to clear the whiteboard?")) {
      contextRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      contextRef.current.fillStyle = "white";
      contextRef.current.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      setDrawingData([]);
    }
  }

  // Save whiteboard
  async function saveWhiteboard() {
    if (!user) return;

    try {
      const url = whiteboardId
        ? `${API_URL}/api/whiteboards/${whiteboardId}`
        : `${API_URL}/api/whiteboards`;

      const method = whiteboardId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title,
          drawingData: JSON.stringify(drawingData),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWhiteboardId(data._id);
        alert("Whiteboard saved successfully!");
      } else {
        alert("Failed to save whiteboard");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving whiteboard");
    }
  }

  // Undo functionality
  function undo() {
    if (drawingData.length > 0) {
      const newData = drawingData.slice(0, -1);
      setDrawingData(newData);
      redrawCanvas(newData);
    }
  }

  // Handle logout
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
      <main className="whiteboard-container">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="whiteboard-container">
        <h1>Whiteboard</h1>
        <p className="muted">Sign in with Google to use the whiteboard.</p>
        <a className="button" href={loginUrl}>
          Continue with Google
        </a>
      </main>
    );
  }

  return (
    <div className="whiteboard-page">
      <header className="whiteboard-header">
        <div className="whiteboard-info">
          <h1>Whiteboard</h1>
          <input
            type="text"
            className="whiteboard-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Whiteboard title..."
          />
          <p className="user-info">
            by {user.name} ({user.email})
          </p>
        </div>
        <div className="header-buttons">
          <button className="button" onClick={saveWhiteboard}>
            💾 Save
          </button>
          <button className="secondary" onClick={() => router.push("/")}>
            ← Home
          </button>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="whiteboard-content">
        <div className="toolbar">
          <div className="toolbar-group">
            <label>Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-picker"
            />
          </div>

          <div className="toolbar-group">
            <label>Size:</label>
            <input
              type="range"
              min="1"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="size-slider"
            />
            <span className="size-value">{brushSize}px</span>
          </div>

          <div className="toolbar-group">
            <button
              className={`secondary ${textMode ? "active" : ""}`}
              onClick={() => setTextMode(!textMode)}
            >
              {textMode ? "🖌️ Draw" : "📝 Text"}
            </button>
          </div>

          <div className="toolbar-group">
            <button className="secondary" onClick={undo}>
              ↩️ Undo
            </button>
            <button className="secondary" onClick={clearCanvas}>
              🗑️ Clear
            </button>
          </div>

          <div className="toolbar-group">
            <label>Zoom:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="size-slider"
            />
            <span className="size-value">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="toolbar-info">
            💡 Ctrl+Scroll to zoom | Ctrl+Click & drag to pan | Hold middle mouse to pan
          </div>
        </div>

        <div
          ref={containerRef}
          className="whiteboard-container-canvas"
          onWheel={handleWheel}
          style={{
            overflow: "auto",
            flex: 1,
            background: "#f0f0f0",
          }}
        >
          <canvas
            ref={canvasRef}
            className="whiteboard-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              display: "block",
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: "0 0",
              cursor: isPanning ? "grabbing" : textMode ? "text" : "crosshair",
            }}
          />
        </div>
      </div>
    </div>
  );
}
