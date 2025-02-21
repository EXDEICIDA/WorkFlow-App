import { useEffect, useRef, useState } from "react";
import "./CanvasPage.css";
import CanvasItem from "../Components/CanvasItem"; // Adjust the path as necessary

const CanvasPage = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const activeCanvasRef = tabs[activeTabIndex]?.canvasRef || null;
  const [nextItemId, setNextItemId] = useState(1);

  // Get active tab's canvas items and connections
  const canvasItems = tabs[activeTabIndex]?.canvasItems || [];
  const connections = tabs[activeTabIndex]?.connections || [];

  const handleCanvasClick = (e) => {
    if (e.target === activeCanvasRef?.current && activeTabIndex !== null) {
      const rect = e.target.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      const newItem = {
        id: nextItemId,
        position: { x, y },
      };

      setTabs(prevTabs => prevTabs.map((tab, index) => {
        if (index === activeTabIndex) {
          return {
            ...tab,
            canvasItems: [...(tab.canvasItems || []), newItem]
          };
        }
        return tab;
      }));
      setNextItemId(nextItemId + 1);
    }
  };

  const handleItemPositionChange = (itemId, newPosition) => {
    setTabs(prevTabs => prevTabs.map((tab, index) => {
      if (index === activeTabIndex) {
        return {
          ...tab,
          canvasItems: (tab.canvasItems || []).map(item =>
            item.id === itemId ? { ...item, position: newPosition } : item
          )
        };
      }
      return tab;
    }));
  };

  const handleConnect = (fromId, toId) => {
    setTabs(prevTabs => prevTabs.map((tab, index) => {
      if (index === activeTabIndex) {
        return {
          ...tab,
          connections: [...(tab.connections || []), { from: fromId, to: toId }]
        };
      }
      return tab;
    }));
  };

  // Add zoom constants
  const MIN_ZOOM = 0.25; // Maximum zoom out (25%)
  const MAX_ZOOM = 2; // Maximum zoom in (200%)
  const ZOOM_FACTOR = 1.1; // Zoom step (10% per click)

  // Add constants for safe areas
  const HEADER_HEIGHT = 60; // Height of the top toolbar
  const TOOLBAR_WIDTH = 50; // Width of the right toolbar
  const SAFE_MARGIN = 20; // Additional safety margin

  // Helper to check if any tabs exist
  const hasNoTabs = tabs.length === 0;

  // Handle keyboard events for space key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scroll
        setIsSpacePressed(true);
        document.body.style.cursor = "grab";
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        document.body.style.cursor = "default";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Function to add new tab with canvas
  const addNewTab = () => {
    const newTab = {
      id: tabs.length + 1,
      name: "",
      active: false,
      isEditing: true,
      canvasRef: { current: null },
      canvasItems: [], // Initialize empty canvas items array
      connections: [], // Initialize empty connections array
    };
    setTabs([...tabs, newTab]);
    setActiveTabIndex(tabs.length);
  };

  // Function to handle tab name editing
  const handleTabNameChange = (index, newName) => {
    if (!newName.trim()) {
      newName = `Untitled ${index + 1}`;
    }
    setTabs(
      tabs.map((tab, i) =>
        i === index ? { ...tab, name: newName, isEditing: false } : tab
      )
    );
  };

  // Function to handle input key press
  const handleKeyPress = (e, index, currentValue) => {
    if (e.key === "Enter") {
      handleTabNameChange(index, currentValue);
    }
  };

  // Function to handle input blur
  const handleBlur = (index, currentValue) => {
    handleTabNameChange(index, currentValue);
  };

  // Navigate between tabs
  const navigateTab = (direction) => {
    if (direction === "left" && activeTabIndex > 0) {
      setActiveTabIndex(activeTabIndex - 1);
    } else if (direction === "right" && activeTabIndex < tabs.length - 1) {
      setActiveTabIndex(activeTabIndex + 1);
    }
  };

  // Initialize canvas when tab changes or new tab is created
  useEffect(() => {
    if (activeTabIndex !== null) {
      const currentTab = tabs[activeTabIndex];
      if (currentTab?.canvasRef?.current) {
        initializeCanvas(currentTab.canvasRef);
      }
    }
  }, [activeTabIndex, tabs.length]);

  // Function to initialize canvas
  const initializeCanvas = (canvasRef) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawGrid();
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply transformations
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw dots
      ctx.fillStyle = "#2a2a2a";
      const dotSize = 1;
      const spacing = 20;

      // Calculate visible area
      const startX = Math.floor(-pan.x / zoom / spacing) * spacing - spacing;
      const startY = Math.floor(-pan.y / zoom / spacing) * spacing - spacing;
      const endX =
        Math.ceil((canvas.width - pan.x) / zoom / spacing) * spacing + spacing;
      const endY =
        Math.ceil((canvas.height - pan.y) / zoom / spacing) * spacing + spacing;

      for (let x = startX; x < endX; x += spacing) {
        for (let y = startY; y < endY; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    // Mouse event handlers
    const handleMouseDown = (e) => {
      if (isSpacePressed) {
        setIsDragging(true);
        setStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        document.body.style.cursor = "grabbing";
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging && isSpacePressed) {
        const newPan = {
          x: e.clientX - startPos.x,
          y: e.clientY - startPos.y,
        };
        setPan(newPan);
        drawGrid();
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = isSpacePressed ? "grab" : "default";
    };

    // Zoom handler
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;

        setZoom((prevZoom) => {
          const newZoom = Math.min(
            Math.max(prevZoom * zoomFactor, MIN_ZOOM),
            MAX_ZOOM
          );
          return newZoom;
        });
      }
    };

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resizeCanvas);
    };
  };

  // Update handleZoom with limits
  const handleZoom = (zoomIn) => {
    if (activeTabIndex === null) return;

    const canvas = tabs[activeTabIndex]?.canvasRef?.current;
    if (!canvas) return;

    const zoomFactor = zoomIn ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const ctx = canvas.getContext("2d");

    // Get center of canvas for zoom point
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setZoom((prevZoom) => {
      // Apply zoom limits
      const newZoom = Math.min(
        Math.max(prevZoom * zoomFactor, MIN_ZOOM),
        MAX_ZOOM
      );

      // Only update if within limits
      if (newZoom === prevZoom) return prevZoom;

      setPan((prevPan) => ({
        x: centerX - (centerX - prevPan.x) * zoomFactor,
        y: centerY - (centerY - prevPan.y) * zoomFactor,
      }));

      // Redraw grid immediately after state update
      requestAnimationFrame(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(newZoom, newZoom);

        // Draw dots
        ctx.fillStyle = "#2a2a2a";
        const dotSize = 1;
        const spacing = 20;

        const startX =
          Math.floor(-pan.x / newZoom / spacing) * spacing - spacing;
        const startY =
          Math.floor(-pan.y / newZoom / spacing) * spacing - spacing;
        const endX =
          Math.ceil((canvas.width - pan.x) / newZoom / spacing) * spacing +
          spacing;
        const endY =
          Math.ceil((canvas.height - pan.y) / newZoom / spacing) * spacing +
          spacing;

        for (let x = startX; x < endX; x += spacing) {
          for (let y = startY; y < endY; y += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      });

      return newZoom;
    });
  };

  // Add reset zoom function
  const handleResetZoom = () => {
    if (activeTabIndex === null) return;

    const canvas = tabs[activeTabIndex]?.canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Reset zoom and pan to initial values
    setZoom(1);
    setPan({ x: 0, y: 0 });

    // Redraw grid with reset values
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(0, 0);
      ctx.scale(1, 1);

      // Draw dots
      ctx.fillStyle = "#2a2a2a";
      const dotSize = 1;
      const spacing = 20;

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    });
  };

  // Function to draw grid with boundary checks
  const drawGrid = (ctx, canvas, newZoom = zoom, newPan = pan) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(newPan.x, newPan.y);
    ctx.scale(newZoom, newZoom);

    ctx.fillStyle = "#2a2a2a";
    const dotSize = 1;
    const spacing = 20;

    // Calculate visible area
    const startX = Math.floor(-newPan.x / newZoom / spacing) * spacing;
    const startY = Math.floor(-newPan.y / newZoom / spacing) * spacing;
    const endX =
      Math.ceil((canvas.width - newPan.x) / newZoom / spacing) * spacing;
    const endY =
      Math.ceil((canvas.height - newPan.y) / newZoom / spacing) * spacing;

    // Draw dots with safe area checks
    for (let x = startX; x < endX; x += spacing) {
      for (let y = startY; y < endY; y += spacing) {
        // Convert to screen coordinates
        const screenX = x * newZoom + newPan.x;
        const screenY = y * newZoom + newPan.y;

        // Check if dot is within safe area (away from edges and UI elements)
        const isSafeX =
          screenX >= SAFE_MARGIN &&
          screenX <= canvas.width - TOOLBAR_WIDTH - SAFE_MARGIN;

        const isSafeY =
          screenY >= HEADER_HEIGHT + SAFE_MARGIN &&
          screenY <= canvas.height - SAFE_MARGIN;

        if (isSafeX && isSafeY) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  };

  return (
    <div className="canvas-page">
      <div className="canvas-toolbar">
        <div className="toolbar-left">
          <button
            className="toolbar-btn"
            onClick={() => navigateTab("left")}
            disabled={activeTabIndex === 0 || activeTabIndex === null}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => navigateTab("right")}
            disabled={
              activeTabIndex === tabs.length - 1 || activeTabIndex === null
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
</svg>

          </button>

          <div className="canvas-tabs">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`canvas-tab ${
                  index === activeTabIndex ? "active" : ""
                }`}
                onClick={() => !tab.isEditing && setActiveTabIndex(index)}
                onDoubleClick={() =>
                  setTabs(
                    tabs.map((t, i) =>
                      i === index ? { ...t, isEditing: true } : t
                    )
                  )
                }
              >
                {tab.isEditing ? (
                  <input
                    type="text"
                    value={tab.name}
                    placeholder={`Untitled ${index + 1}`}
                    onChange={(e) =>
                      setTabs(
                        tabs.map((t, i) =>
                          i === index ? { ...t, name: e.target.value } : t
                        )
                      )
                    }
                    onBlur={(e) => handleTabNameChange(index, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, index, e.target.value)}
                    autoFocus
                    className="tab-name-input"
                  />
                ) : (
                  tab.name || `Untitled ${index + 1}`
                )}
              </div>
            ))}
            <button className="new-tab-btn" onClick={addNewTab}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="canvas-container">
        {tabs.map((tab, index) => (
          <canvas
            key={tab.id}
            ref={tab.canvasRef}
            className="drawing-canvas"
            style={{ display: index === activeTabIndex ? "block" : "none" }}
            onClick={handleCanvasClick}
          />
        ))}

        {/* Add this new div for canvas items */}
        <div className="canvas-items-layer">
          {canvasItems.map((item) => (
            <CanvasItem
              key={item.id}
              id={item.id}
              position={item.position}
              onConnect={handleConnect}
              onPositionChange={handleItemPositionChange}
            />
          ))}
        </div>

        {/* Show help text only when no tabs exist */}
        {hasNoTabs && (
          <div className="canvas-help">
            <p>Click the + button above to create a new canvas</p>
          </div>
        )}

        <div className="tools-panel">
          <button className="tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </button>
          <button
            className="tool-btn"
            onClick={() => handleZoom(true)}
            title="Zoom In"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
          <button
            className="tool-btn"
            onClick={() => handleZoom(false)}
            title="Zoom Out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15"
              />
            </svg>
          </button>
          <button
            className="tool-btn"
            onClick={handleResetZoom}
            title="Reset Zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <button className="tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <button className="tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        <div className="bottom-tools">
          <button className="tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </button>
          <button className="tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
              />
            </svg>
          </button>
          <button className="tool-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
